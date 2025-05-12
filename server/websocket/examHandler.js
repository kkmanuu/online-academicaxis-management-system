const WebSocket = require('ws');

class ExamHandler {
  constructor() {
    this.connections = new Map(); // Map to store WebSocket connections
    this.examSessions = new Map(); // Map to store exam sessions
  }

  initialize(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
      const params = new URLSearchParams(req.url.split('?')[1]);
      const examId = params.get('examId');
      const role = params.get('role');
      const userId = params.get('userId');

      if (!examId || !role || !userId) {
        ws.close(1008, 'Missing required parameters');
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
        connectionId
      });

      // Handle messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(examId, userId, role, data);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      // Handle connection close
      ws.on('close', () => {
        this.handleDisconnect(examId, userId, connectionId);
      });

      // Send initial connection success message
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'success',
        message: 'Connected to exam monitoring system'
      }));
    });
  }

  handleMessage(examId, userId, role, data) {
    const session = this.examSessions.get(examId);
    if (!session) return;

    switch (data.type) {
      case 'offer':
        // Handle WebRTC offer from student
        if (role === 'student') {
          // Broadcast to all teachers in the exam
          session.forEach((user, id) => {
            if (user.role === 'teacher') {
              user.ws.send(JSON.stringify({
                type: 'offer',
                studentId: userId,
                offer: data.offer
              }));
            }
          });
        }
        break;

      case 'answer':
        // Handle WebRTC answer from teacher
        if (role === 'teacher') {
          const student = session.get(data.studentId);
          if (student) {
            student.ws.send(JSON.stringify({
              type: 'answer',
              teacherId: userId,
              answer: data.answer
            }));
          }
        }
        break;

      case 'ice-candidate':
        // Handle ICE candidate
        if (role === 'student') {
          // Send to all teachers
          session.forEach((user, id) => {
            if (user.role === 'teacher') {
              user.ws.send(JSON.stringify({
                type: 'ice-candidate',
                studentId: userId,
                candidate: data.candidate
              }));
            }
          });
        } else if (role === 'teacher') {
          // Send to specific student
          const student = session.get(data.studentId);
          if (student) {
            student.ws.send(JSON.stringify({
              type: 'ice-candidate',
              teacherId: userId,
              candidate: data.candidate
            }));
          }
        }
        break;
    }
  }

  handleDisconnect(examId, userId, connectionId) {
    // Remove connection
    this.connections.delete(connectionId);

    // Remove user from exam session
    const session = this.examSessions.get(examId);
    if (session) {
      session.delete(userId);

      // Notify other users in the exam
      session.forEach((user) => {
        user.ws.send(JSON.stringify({
          type: 'user-disconnected',
          userId: userId
        }));
      });

      // Clean up empty sessions
      if (session.size === 0) {
        this.examSessions.delete(examId);
      }
    }
  }
}

module.exports = new ExamHandler(); 