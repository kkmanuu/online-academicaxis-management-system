import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../../shared/context/AuthContext';
import axios from 'axios';
import CameraMonitor from '../../shared/components/CameraMonitor';
import websocketService from '../../shared/services/websocketService';

const ExamMonitoring = () => {
  const [exam, setExam] = useState(null);
  const [activeStudents, setActiveStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { examId } = useParams();
  const { user, getAuthHeader } = useAuth();

  /* 1. Fetch exam details */

  const fetchExamDetails = useCallback(async () => {
    try {
      const resp = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/exams/${examId}`,
        { headers: getAuthHeader() }
      );
      setExam(resp.data);
      setActiveStudents(resp.data.enrolledStudents || []);
      setLoading(false);
    } catch (err) {
      console.error('Fetch exam error', err);
      setError(err.response?.data?.message || 'Failed to load exam');
      setLoading(false);
    }
  }, [examId, getAuthHeader]);

  useEffect(() => {
    fetchExamDetails();
    return () => websocketService.disconnect();
  }, [fetchExamDetails]);

  /* 2. WebSocket connection (teacher) */

  useEffect(() => {
    if (!exam || !user?.id) return;

    // Build wss://… from the HTTP API URL
    const wsBase = process.env.REACT_APP_API_URL
      .replace(/^http/, 'ws') 
      //ensure wss for productions 
      .replace(/^ws/, 'wss'); 

    const wsUrl = `${wsBase.endsWith('/') ? wsBase.slice(0, -1) : wsBase}/ws/exams`;

    console.log('[WS] Teacher connecting →', wsUrl);

    websocketService.connect(examId, 'teacher', user.id, wsUrl);

    const handler = (msg) => {
      if (msg.type === 'webrtc_offer') {
        handleStudentOffer(msg);
      }
    };

    websocketService.setOnMessageCallback(handler);

    return () => {
      websocketService.setOnMessageCallback(null);
    };
  }, [exam, user?.id, examId]);

  /* 3. Offer handling (pass to CameraMonitor) */

  const handleStudentOffer = (message) => {
    console.log('Received WebRTC offer from student', message.studentId);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  
  /* UI  */
 
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
      {/* Exam header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {exam.title} - Exam Monitoring
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {exam.description}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Left panel – active students */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Students ({activeStudents.length})
            </Typography>
            <List>
              {activeStudents.map((student) => (
                <React.Fragment key={student._id}>
                  <ListItem
                    button
                    selected={selectedStudent?._id === student._id}
                    onClick={() => handleStudentSelect(student)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={student.name} secondary={student.email} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Right panel – camera feed */}
        <Grid item xs={12} md={8}>
          {selectedStudent ? (
            <CameraMonitor
              role="teacher"
              examId={examId}
              studentId={selectedStudent._id}
              websocketService={websocketService}
            />
          ) : (
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Select a student to view their camera feed
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExamMonitoring;