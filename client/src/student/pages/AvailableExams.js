import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { useAuth } from '../../shared/context/AuthContext';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { getAuthHeader, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      console.warn('User not authenticated. Redirecting to login.');
      setError('Please log in to view available exams.');
      navigate('/login');
      return;
    }
    fetchAvailableExams();
  }, [isAuthenticated, navigate]);

  const fetchAvailableExams = async () => {
    try {
      const headers = getAuthHeader();
      console.log('Fetch exams - Auth headers:', headers);

      if (!headers?.Authorization || !headers.Authorization.startsWith('Bearer ')) {
        setError('Authentication token is missing or invalid. Please log in again.');
        navigate('/login');
        return;
      }

      const config = {
        headers,
        url: 'http://localhost:5000/api/student/exams/available'
      };
      console.log('Axios request config:', config);

      const response = await axios.get(config.url, { headers });
      console.log('Available exams response:', response.data);

      const validExams = Array.isArray(response.data)
        ? response.data.filter(exam => {
            const isValidId = exam._id && /^[0-9a-fA-F]{24}$/.test(exam._id);
            const hasValidDates = exam.startTime && exam.endTime && !isNaN(new Date(exam.startTime)) && !isNaN(new Date(exam.endTime));
            if (!isValidId) {
              console.warn('Invalid exam ID found:', exam);
            }
            if (!hasValidDates) {
              console.warn('Invalid exam dates found:', exam);
            }
            return isValidId && hasValidDates;
          })
        : [];
      setExams(validExams);
      if (validExams.length === 0 && Array.isArray(response.data) && response.data.length > 0) {
        setError('No valid exams found. Some exams have invalid data.');
      } else if (response.data.message) {
        setError(response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exams:', error);
      let errorMessage = 'Failed to load available exams. Please try again.';
      if (error.response) {
        console.log('Error response:', error.response);
        console.log('Error data:', error.response.data);
        console.log('Error status:', error.response.status);
        errorMessage = error.response.data.message || `Error ${error.response.status}: ${error.response.data.error || 'Invalid request'}`;
        if (error.response.status === 400) {
          console.warn('400 Bad Request details:', error.response.data);
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = error.response.data.message || 'Authentication failed. Please log in again.';
          navigate('/login');
        } else if (error.response.status === 404) {
          errorMessage = 'Exams endpoint not found. Please contact the administrator.';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check if the backend is running at http://localhost:5000.';
      } else {
        errorMessage = `Request error: ${error.message}`;
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    if (!examId || !/^[0-9a-fA-F]{24}$/.test(examId)) {
      console.error('Invalid examId passed to handleStartExam:', examId);
      setError('Invalid exam ID. Please try again.');
      return;
    }
    console.log('Navigating to exam:', examId);
    navigate(`/student/exams/${examId}`);
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = exam.startTime ? new Date(exam.startTime) : null;
    const endTime = exam.endTime ? new Date(exam.endTime) : null;

    if (!startTime || !endTime || isNaN(startTime) || isNaN(endTime)) {
      return <Chip label="Invalid Dates" color="warning" sx={{ fontWeight: 'bold', borderRadius: 1 }} />;
    }
    if (now < startTime) {
      return <Chip label="Upcoming" color="info" sx={{ fontWeight: 'bold', borderRadius: 1 }} />;
    } else if (now > endTime) {
      return <Chip label="Expired" color="error" sx={{ fontWeight: 'bold', borderRadius: 1 }} />;
    } else {
      return <Chip label="Active" color="success" sx={{ fontWeight: 'bold', borderRadius: 1 }} />;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 2,
        mb: 3,
        py: 3,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#1a237e', mb: 2 }}
      >
        Available Exams
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 1, backgroundColor: '#ffebee', color: '#c62828' }}
        >
          {error}
        </Alert>
      )}

      {exams.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            mt: 2,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center',
            backgroundColor: '#ffffff'
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: '#455a64', mb: 2 }}
          >
            No exams available at the moment.
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#455a64', mb: 2 }}
          >
            This could be because:
          </Typography>
          <Box
            component="ul"
            sx={{
              textAlign: 'left',
              display: 'inline-block',
              listStylePosition: 'inside',
              color: '#455a64'
            }}
          >
            <li>You haven't enrolled in any courses yet</li>
            <li>There are no active exams for your enrolled courses</li>
            <li>You have completed all available exams</li>
            <li>Exam dates are not currently active</li>
          </Box>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            mt: 2,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backgroundColor: '#ffffff'
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: '#e8eaf6',
                  '& th': { fontWeight: 'bold', color: '#1a237e' }
                }}
              >
                <TableCell>Title</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Duration (min)</TableCell>
                <TableCell>Total Marks</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam, index) => (
                <TableRow
                  key={exam._id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <TableCell sx={{ color: '#455a64' }}>{exam.title || 'N/A'}</TableCell>
                  <TableCell sx={{ color: '#455a64' }}>{exam.course?.name || 'N/A'}</TableCell>
                  <TableCell sx={{ color: '#455a64' }}>{exam.duration || 'N/A'}</TableCell>
                  <TableCell sx={{ color: '#455a64' }}>{exam.totalMarks || 0}</TableCell>
                  <TableCell sx={{ color: '#455a64' }}>
                    {exam.startTime ? format(parseISO(exam.startTime), 'PPpp') : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#455a64' }}>
                    {exam.endTime ? format(parseISO(exam.endTime), 'PPpp') : 'N/A'}
                  </TableCell>
                  <TableCell>{getExamStatus(exam)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => handleStartExam(exam._id)}
                      disabled={!exam.startTime || !exam.endTime || new Date() < new Date(exam.startTime) || new Date() > new Date(exam.endTime)}
                      sx={{
                        backgroundColor: '#3f51b5',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#303f9f'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#b0bec5',
                          color: '#eceff1'
                        }
                      }}
                    >
                      Start Exam
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AvailableExams;