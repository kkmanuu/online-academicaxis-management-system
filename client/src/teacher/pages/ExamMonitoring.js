import React, { useState, useEffect } from 'react';
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
  CircularProgress
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

  useEffect(() => {
    fetchExamDetails();
    return () => {
      websocketService.disconnect();
    };
  }, [examId]);

  useEffect(() => {
    if (exam) {
      // Initialize WebSocket connection
      websocketService.connect(examId, 'teacher', user.id);
      
      // Set up message handler
      websocketService.setOnMessageCallback((message) => {
        if (message.type === 'offer') {
          // Handle WebRTC offer from student
          handleStudentOffer(message);
        }
      });
    }
  }, [exam]);

  const fetchExamDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exams/${examId}`, {
        headers: getAuthHeader()
      });
      setExam(response.data);
      setActiveStudents(response.data.enrolledStudents || []);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load exam details');
      setLoading(false);
    }
  };

  const handleStudentOffer = async (message) => {
    // Handle WebRTC offer from student
    // This will be implemented in the CameraMonitor component
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {exam.title} - Exam Monitoring
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {exam.description}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Students
            </Typography>
            <List>
              {activeStudents.map((student) => (
                <React.Fragment key={student._id}>
                  <ListItem
                    button
                    onClick={() => handleStudentSelect(student)}
                    selected={selectedStudent?._id === student._id}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.name}
                      secondary={student.email}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedStudent ? (
            <CameraMonitor
              role="teacher"
              examId={examId}
              studentId={selectedStudent._id}
            />
          ) : (
            <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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