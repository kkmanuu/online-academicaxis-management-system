import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../../shared/context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;
const WS_URL = API_URL ? `wss://${API_URL.replace('https://', '')}/ws` : null;

const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    if (!API_URL || !WS_URL) {
      setError("API or WebSocket URL is not configured. Please contact the administrator.");
      setLoading(false);
      return;
    }
    if (!user?._id) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }
    fetchExamDetails();
    setupCamera();
    setupWebSocket();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [examId, user]);

  const fetchExamDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/student/exams/${examId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          timeout: 30000,
        }
      );
      console.log("Exam data received:", response.data);

      if (!response.data.questions || !Array.isArray(response.data.questions)) {
        console.warn("Exam data does not contain valid questions property");
        response.data.questions = [];
      }

      setExam(response.data);
      setLoading(false);
      startTimer(response.data.duration);
    } catch (error) {
      console.error("Error fetching exam details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });
      let errorMessage = error.response?.data?.message || error.message;
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please try again in a moment.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Unable to connect to the server. Please check your internet connection or try again later.";
      }
      setError(errorMessage || "Failed to load exam details. Please try again.");
      setLoading(false);
    }
  };

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setError(
        "Failed to access camera. Please ensure camera permissions are granted."
      );
    }
  };

  const setupWebSocket = () => {
    if (!WS_URL) {
      setError("WebSocket URL is not configured.");
      return;
    }
    const ws = new WebSocket(`${WS_URL}/exams?examId=${examId}&role=student&userId=${user._id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(
        JSON.stringify({
          type: "student_join",
          examId,
          studentId: user._id,
        })
      );
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        if (data.type === "webrtc_offer") {
          await handleWebRTCOffer(data.offer);
        } else if (data.type === "error") {
          setError(data.message || "WebSocket error occurred.");
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        setError("Invalid WebSocket message received.");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection failed. Please try again.");
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", { code: event.code, reason: event.reason });
      setError("WebSocket connection closed. Please refresh the page.");
    };
  };

  const handleWebRTCOffer = async (offer) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = pc;

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
          pc.addTrack(track, cameraStream);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          wsRef.current.send(
            JSON.stringify({
              type: "ice_candidate",
              candidate: event.candidate,
              examId,
              studentId: user._id,
            })
          );
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      wsRef.current.send(
        JSON.stringify({
          type: "webrtc_answer",
          answer,
          examId,
          studentId: user._id,
        })
      );
    } catch (error) {
      console.error("WebRTC error:", {
        message: error.message,
        stack: error.stack,
      });
      setError("Failed to establish WebRTC connection.");
    }
  };

  const startTimer = (duration) => {
    const endTime = Date.now() + duration * 60 * 1000;

    const timer = setInterval(() => {
      const remaining = endTime - Date.now();

      if (remaining <= 0) {
        clearInterval(timer);
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          setCameraStream(null);
        }
        if (wsRef.current) {
          wsRef.current.close();
        }
        handleSubmit();
      } else {
        setTimeLeft(Math.floor(remaining / 1000));
      }
    }, 1000);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (
      exam.questions.length > 0 &&
      Object.keys(answers).length !== exam.questions.length
    ) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }

      if (wsRef.current) {
        wsRef.current.close();
      }

      console.log("Submitting exam with answers:", answers);

      const response = await axios.post(
        `${API_URL}/api/student/exams/${examId}/submit`,
        {
          answers,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          timeout: 30000,
        }
      );

      console.log("Exam submission response:", response.data);

      alert(`Exam submitted successfully! Your score: ${response.data.score}%`);
      navigate("/student/results");
    } catch (error) {
      console.error("Error submitting exam:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });
      let errorMessage = error.response?.data?.message || error.message;
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Submission timed out. Please try again in a moment.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Unable to connect to the server. Please check your internet connection or try again later.";
      }
      setError(errorMessage || "Failed to submit exam. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {exam.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Duration: {exam.duration} minutes
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 2, mb: 2 }}>
              Time Remaining: {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </Typography>
            <Divider sx={{ my: 3 }} />
            {exam.questions && exam.questions.length > 0 ? (
              exam.questions.map((question, index) => (
                <Box key={question._id} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {index + 1}. {question.text} ({question.marks} marks)
                  </Typography>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Select an option</FormLabel>
                    <RadioGroup
                      value={answers[question._id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(question._id, e.target.value)
                      }
                    >
                      {question.options.map((option, optionIndex) => (
                        <FormControlLabel
                          key={optionIndex}
                          value={String.fromCharCode(97 + optionIndex)} // Sends 'a', 'b', 'c', 'd'
                          control={<Radio />}
                          label={`${String.fromCharCode(
                            65 + optionIndex
                          )}. ${option}`}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Box>
              ))
            ) : (
              <Typography variant="body1" sx={{ mb: 4 }}>
                No questions available for this exam.
              </Typography>
            )}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : "Submit Exam"}
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Camera Feed
            </Typography>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExamInterface;