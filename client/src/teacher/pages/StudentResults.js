import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';

const StudentResults = () => {
  const { examId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (examId) {
      fetchExamResults(examId);
    } else {
      fetchAllResults();
    }
  }, [examId]);

  const fetchExamResults = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teacher/exams/${id}/results`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Exam results fetched:', response.data);
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exam results:', error);
      setError('Failed to load exam results. Please try again.');
      setLoading(false);
    }
  };

  const fetchAllResults = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teacher/results', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('All results fetched:', response.data);
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all results:', error);
      setError('Failed to load results. Please try again.');
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredResults = results.filter(result => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (result.student && result.student.name && result.student.name.toLowerCase().includes(searchLower)) ||
      (result.exam && result.exam.title && result.exam.title.toLowerCase().includes(searchLower)) ||
      (result.exam && result.exam.course && result.exam.course.name && result.exam.course.name.toLowerCase().includes(searchLower))
    );
  });

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
      <Typography variant="h4" gutterBottom>
        {examId ? 'Exam Results' : 'All Student Results'}
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by student name, exam title, or course"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {filteredResults.length === 0 ? (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="body1">
            No results found.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Exam Title</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result._id}>
                  <TableCell>{result.student ? result.student.name : 'Unknown'}</TableCell>
                  <TableCell>{result.exam ? result.exam.title : 'Unknown'}</TableCell>
                  <TableCell>{result.exam && result.exam.course ? result.exam.course.name : 'Unknown'}</TableCell>
                  <TableCell>{result.percentage.toFixed(2)}%</TableCell>
                  <TableCell>
                    <Chip 
                      label={result.status} 
                      color={result.status === 'pass' ? 'success' : 'error'} 
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(result.submittedAt).toLocaleDateString()} {new Date(result.submittedAt).toLocaleTimeString()}
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

export default StudentResults; 