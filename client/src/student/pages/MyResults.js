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
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../shared/context/AuthContext';
import { format, parseISO } from 'date-fns';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { getAuthHeader, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      setError('Please log in to view your results.');
      navigate('/login');
      return;
    }
    fetchResults();
  }, [isAuthenticated, navigate]);

  const fetchResults = async () => {
    try {
      const headers = getAuthHeader();
      console.log('Auth headers:', headers);
      const response = await axios.get('http://localhost:5000/api/student/results', {
        headers
      });
      console.log('Results fetched:', response.data);
      setResults(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error.response?.data?.message || 'Failed to load results. Please try again.');
      setLoading(false);
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
        My Exam Results
      </Typography>
      
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 1, backgroundColor: '#ffebee', color: '#c62828' }}
        >
          {error}
        </Alert>
      )}

      {results.length === 0 ? (
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
            variant="body1"
            sx={{ color: '#455a64', mb: 2 }}
          >
            You haven't taken any exams yet. Visit the Available Exams page to take an exam.
          </Typography>
          <Chip
            label="View Available Exams"
            onClick={() => navigate('/student/exams')}
            sx={{
              backgroundColor: '#3f51b5',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: 1,
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: '#303f9f',
                cursor: 'pointer'
              }
            }}
          />
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
                <TableCell>Exam Title</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Marks Obtained</TableCell>
                <TableCell>Total Marks</TableCell>
                <TableCell>Percentage</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result, index) => (
                <TableRow
                  key={result._id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <TableCell sx={{ color: '#455a64' }}>{result.exam?.title || 'N/A'}</TableCell>
                  <TableCell sx={{ color: '#455a64' }}>
                    {result.exam?.course?.name || result.course?.name || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#455a64' }}>{result.marksObtained || 0}</TableCell>
                  <TableCell sx={{ color: '#455a64' }}>{result.totalMarks || 0}</TableCell>
                  <TableCell sx={{ color: '#455a64' }}>{result.percentage?.toFixed(2)}%</TableCell>
                  <TableCell>
                    <Chip
                      label={result.status}
                      color={result.status === 'pass' ? 'success' : 'error'}
                      sx={{
                        fontWeight: 'bold',
                        borderRadius: 1
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#455a64' }}>
                    {result.submittedAt ? format(parseISO(result.submittedAt), 'PPpp') : 'N/A'}
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

export default MyResults;