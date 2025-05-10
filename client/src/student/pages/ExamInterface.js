import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../shared/context/AuthContext';

const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    fetchExamDetails();
    setupCamera();
    setupWebSocket();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/exams/${examId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Exam data received:', response.data);
      
      // Check if questions property exists and is an array
      if (!response.data.questions || !Array.isArray(response.data.questions)) {
        console.warn('Exam data does not contain valid questions property');
        // Initialize with empty array if questions is missing
        response.data.questions = [];
      }
      
      setExam(response.data);
      setLoading(false);
      startTimer(response.data.duration);
    } catch (error) {
      console.error('Error fetching exam details:', error);
      setError('Failed to load exam details. Please try again.');
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
      setError('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket('ws://localhost:5000');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'student_join',
        examId,
        studentId: user._id
      }));
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'webrtc_offer') {
        await handleWebRTCOffer(data.offer);
      }
    };
  };

  const handleWebRTCOffer = async (offer) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peerConnectionRef.current = pc;

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        pc.addTrack(track, cameraStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current.send(JSON.stringify({
          type: 'ice_candidate',
          candidate: event.candidate,
          examId,
          studentId: user._id
        }));
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    wsRef.current.send(JSON.stringify({
      type: 'webrtc_answer',
      answer,
      examId,
      studentId: user._id
    }));
  };

  const startTimer = (duration) => {
    const endTime = Date.now() + duration * 60 * 1000;
    
    const timer = setInterval(() => {
      const remaining = endTime - Date.now();
      
      if (remaining <= 0) {
        clearInterval(timer);
        // Stop the camera before auto-submitting
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        // Close WebSocket connection
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
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }

      console.log('Submitting exam with answers:', answers);
      
      const response = await axios.post(`http://localhost:5000/api/student/exams/${examId}/submit`, {
        answers
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('Exam submission response:', response.data);
      navigate('/student/results');
    } catch (error) {
      console.error('Error submitting exam:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      
      // Display a more specific error message
      if (error.response && error.response.data && error.response.data.message) {
        setError(`Failed to submit exam: ${error.response.data.message}`);
      } else {
        setError('Failed to submit exam. Please try again.');
      }
      
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
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
              Time Remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Typography>
            <Divider sx={{ my: 3 }} />
            {exam.questions && exam.questions.length > 0 ? (
              exam.questions.map((question, index) => (
                <Box key={question._id} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {index + 1}. {question.text}
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={answers[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    >
                      {question.options.map((option, optionIndex) => (
                        <FormControlLabel
                          key={optionIndex}
                          value={option}
                          control={<Radio />}
                          label={option}
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
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Submit Exam'}
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
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExamInterface; 