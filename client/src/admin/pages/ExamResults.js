import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search as SearchIcon, Visibility as ViewIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../shared/context/AuthContext';

const ExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    fetchExams();
    fetchAllResults();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/exams', {
        headers: getAuthHeader()
      });
      console.log('Exams fetched:', response.data);
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchAllResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/results', {
        headers: getAuthHeader()
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

  const fetchExamResults = async (examId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/admin/exams/${examId}/results`, {
        headers: getAuthHeader()
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleExamChange = (event) => {
    const examId = event.target.value;
    setSelectedExam(examId);
    
    if (examId === 'all') {
      fetchAllResults();
    } else {
      fetchExamResults(examId);
    }
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResult(null);
  };

  const filteredResults = results.filter(result => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (result.student?.name?.toLowerCase().includes(searchLower)) ||
      (result.exam?.title?.toLowerCase().includes(searchLower)) ||
      (result.exam?.course?.name?.toLowerCase().includes(searchLower))
    );
    
    const matchesExam = !selectedExam || (result.exam?._id === selectedExam);
    
    return matchesSearch && matchesExam;
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
        Exam Results
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2}>
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
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Exam</InputLabel>
            <Select
              value={selectedExam}
              onChange={handleExamChange}
              label="Filter by Exam"
            >
              <MenuItem value="all">All Exams</MenuItem>
              {exams.map((exam) => (
                <MenuItem key={exam._id} value={exam._id}>
                  {exam.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result._id}>
                  <TableCell>{result.student?.name || 'Unknown'}</TableCell>
                  <TableCell>{result.exam?.title || 'Unknown'}</TableCell>
                  <TableCell>{result.exam?.course?.name || 'Unknown'}</TableCell>
                  <TableCell>{(result.percentage || 0).toFixed(2)}%</TableCell>
                  <TableCell>
                    <Chip 
                      label={result.status || 'Unknown'} 
                      color={result.status === 'pass' ? 'success' : 'error'} 
                    />
                  </TableCell>
                  <TableCell>
                    {result.submittedAt ? 
                      `${new Date(result.submittedAt).toLocaleDateString()} ${new Date(result.submittedAt).toLocaleTimeString()}` : 
                      'Unknown'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewDetails(result)} color="primary">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Result Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Result Details
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6">Student Information</Typography>
                <Typography>Name: {selectedResult.student?.name || 'Unknown'}</Typography>
                <Typography>Email: {selectedResult.student?.email || 'Unknown'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Exam Information</Typography>
                <Typography>Title: {selectedResult.exam?.title || 'Unknown'}</Typography>
                <Typography>Course: {selectedResult.exam?.course?.name || 'Unknown'}</Typography>
                <Typography>Teacher: {selectedResult.exam?.teacher?.name || 'Unknown'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Result Information</Typography>
                <Typography>Total Marks: {selectedResult.totalMarks || 0}</Typography>
                <Typography>Marks Obtained: {selectedResult.marksObtained || 0}</Typography>
                <Typography>Percentage: {(selectedResult.percentage || 0).toFixed(2)}%</Typography>
                <Typography>Status: {selectedResult.status || 'Unknown'}</Typography>
                <Typography>Submitted On: {selectedResult.submittedAt ? 
                  `${new Date(selectedResult.submittedAt).toLocaleDateString()} ${new Date(selectedResult.submittedAt).toLocaleTimeString()}` : 
                  'Unknown'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Answer Details</Typography>
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Question #</TableCell>
                        <TableCell>Selected Answer</TableCell>
                        <TableCell>Correct?</TableCell>
                        <TableCell>Marks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedResult.answers && selectedResult.answers.map((answer, index) => (
                        <TableRow key={index}>
                          <TableCell>{answer.questionIndex + 1}</TableCell>
                          <TableCell>{answer.selectedAnswer}</TableCell>
                          <TableCell>
                            <Chip 
                              label={answer.isCorrect ? "Correct" : "Incorrect"} 
                              color={answer.isCorrect ? "success" : "error"} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{answer.marksObtained || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamResults;