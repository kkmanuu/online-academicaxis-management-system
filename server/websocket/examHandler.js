const WebSocket = require("ws");

class ExamHandler {
  constructor() {
    this.connections = new Map(); // Map to store WebSocket connections
    this.examSessions = new Map(); // Map to store exam sessions
  }

  initialize(server, path = "/ws") {
    const wss = new WebSocket.Server({ server, path });
    console.log(`WebSocket server initialized on path: ${path}`);

    wss.on("connection", (ws, req) => {
      console.log("WebSocket connection attempt:", { url: req.url });
      let examId, role, userId;

      try {
        const params = new URLSearchParams(req.url.split("?")[1] || "");
        examId = params.get("examId");
        role = params.get("role");
        userId = params.get("userId");

        if (!examId || !role || !userId) {
          console.error("Missing WebSocket parameters:", { examId, role, userId });
          ws.close(1008, "Missing required parameters: examId, role, userId");
          return;
        }
      } catch (error) {
        console.error("Error parsing WebSocket URL:", error);
        ws.close(1008, "Invalid URL parameters");
        return;
      }

      // Store the connection
      const connectionId = `${examId}-${userId}`;
      this.connections.set(connectionId, ws);

      // Initialize exam session if it doesn't exist
      if (!this.examSessions.has(examId)) {
        this.examSessions.set(examId, new Map());
      }

      // Add user to exam session
      this.examSessions.get(examId).set(userId, {
        role,
        ws,
        connectionId,
      });

      // Handle messages
      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message);
          console.log("WebSocket message received:", { examId, userId, data });
          this.handleMessage(examId, userId, role, data);
        } catch (error) {
          console.error("Error handling WebSocket message:", {
            error: error.message,
            stack: error.stack,
          });
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            })
          );
        }
      });

      // Handle connection close
      ws.on("close", (code, reason) => {
        console.log("WebSocket closed:", { code, reason: reason.toString() });
        this.handleDisconnect(examId, userId, connectionId);
      });

      // Handle errors
      ws.on("error", (error) => {
        console.error("WebSocket error:", {
          error: error.message,
          stack: error.stack,
        });
      });

      // Send initial connection success message
      ws.send(
        JSON.stringify({
          type: "connection",
          status: "success",
          message: "Connected to exam monitoring system",
        })
      );
    });

    wss.on("error", (error) => {
      console.error("WebSocket server error:", {
        error: error.message,
        stack: error.stack,
      });
    });
  }

  handleMessage(examId, userId, role, data) {
    const session = this.examSessions.get(examId);
    if (!session) {
      console.error("No session found for examId:", examId);
      return;
    }

    switch (data.type) {
      case "student_join":
        console.log("Student joined exam:", { examId, userId });
        session.forEach((user, id) => {
          if (user.role === "teacher") {
            user.ws.send(
              JSON.stringify({
                type: "student_join",
                studentId: userId,
              })
            );
          }
        });
        break;

      case "webrtc_offer":
        if (role === "student") {
          console.log("Received WebRTC offer from student:", { userId });
          session.forEach((user, id) => {
            if (user.role === "teacher") {
              user.ws.send(
                JSON.stringify({
                  type: "webrtc_offer",
                  studentId: userId,
                  offer: data.offer,
                })
              );
            }
          });
        }
        break;

      case "webrtc_answer":
        if (role === "teacher") {
          console.log("Received WebRTC answer from teacher:", { userId });
          const student = session.get(data.studentId);
          if (student) {
            student.ws.send(
              JSON.stringify({
                type: "webrtc_answer",
                teacherId: userId,
                answer: data.answer,
              })
            );
          }
        }
        break;

      case "ice_candidate":
        if (role === "student") {
          console.log("Received ICE candidate from student:", { userId });
          session.forEach((user, id) => {
            if (user.role === "teacher") {
              user.ws.send(
                JSON.stringify({
                  type: "ice_candidate",
                  studentId: userId,
                  candidate: data.candidate,
                })
              );
            }
          });
        } else if (role === "teacher") {
          console.log("Received ICE candidate from teacher:", { userId });
          const student = session.get(data.studentId);
          if (student) {
            student.ws.send(
              JSON.stringify({
                type: "ice_candidate",
                teacherId: userId,
                candidate: data.candidate,
              })
            );
          }
        }
        break;

      default:
        console.warn("Unknown message type:", data.type);
    }
  }

  handleDisconnect(examId, userId, connectionId) {
    console.log("Handling disconnect:", { examId, userId, connectionId });
    // Remove connection
    this.connections.delete(connectionId);

    // Remove user from exam session
    const session = this.examSessions.get(examId);
    if (session) {
      session.delete(userId);

      // Notify other users in the exam
      session.forEach((user) => {
        user.ws.send(
          JSON.stringify({
            type: "user_disconnected",
            userId: userId,
          })
        );
      });

      // Clean up empty sessions
      if (session.size === 0) {
        this.examSessions.delete(examId);
        console.log("Cleaned up empty exam session:", examId);
      }
    }
  }
}


module.exports = new ExamHandler();