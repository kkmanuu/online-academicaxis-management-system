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

    const matchesExam = !selectedExam || (selectedExam === 'all') || (result.exam?._id === selectedExam);

    return matchesSearch && matchesExam;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container  maxWidth={false} // disable maxWidth to control full width
  sx={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    p: 3,
  }}
>
        <Alert severity="error" sx={{ fontSize: '1.1rem' }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Exam Results
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
        <Box display="flex" gap={3} flexWrap="wrap" alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by student name, exam title, or course"
            value={searchTerm}
            onChange={handleSearchChange}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel id="exam-filter-label">Filter by Exam</InputLabel>
            <Select
              labelId="exam-filter-label"
              value={selectedExam}
              onChange={handleExamChange}
              label="Filter by Exam"
              size="medium"
              sx={{ borderRadius: 2 }}
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
        <Paper sx={{ p: 4, mt: 3, borderRadius: 3, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
          <Typography variant="body1" color="textSecondary" textAlign="center" fontSize="1.1rem">
            No results found.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="exam results table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Exam Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Submitted On</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{result.student?.name || 'Unknown'}</TableCell>
                  <TableCell>{result.exam?.title || 'Unknown'}</TableCell>
                  <TableCell>{result.exam?.course?.name || 'Unknown'}</TableCell>
                  <TableCell>{(result.percentage || 0).toFixed(2)}%</TableCell>
                  <TableCell>
                    <Chip
                      label={result.status ? result.status.toUpperCase() : 'Unknown'}
                      color={result.status === 'pass' ? 'success' : 'error'}
                      sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {result.submittedAt
                      ? `${new Date(result.submittedAt).toLocaleDateString()} ${new Date(result.submittedAt).toLocaleTimeString()}`
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewDetails(result)} color="primary" size="large" aria-label="view details">
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
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'primary.main' }}>
          Result Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedResult && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                  Student Information
                </Typography>
                <Typography><strong>Name:</strong> {selectedResult.student?.name || 'Unknown'}</Typography>
                <Typography><strong>Email:</strong> {selectedResult.student?.email || 'Unknown'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                  Exam Information
                </Typography>
                <Typography><strong>Title:</strong> {selectedResult.exam?.title || 'Unknown'}</Typography>
                <Typography><strong>Course:</strong> {selectedResult.exam?.course?.name || 'Unknown'}</Typography>
                <Typography><strong>Teacher:</strong> {selectedResult.exam?.teacher?.name || 'Unknown'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                  Result Information
                </Typography>
                <Typography><strong>Total Marks:</strong> {selectedResult.totalMarks || 0}</Typography>
                <Typography><strong>Marks Obtained:</strong> {selectedResult.marksObtained || 0}</Typography>
                <Typography><strong>Percentage:</strong> {(selectedResult.percentage || 0).toFixed(2)}%</Typography>
                <Typography><strong>Status:</strong> {selectedResult.status || 'Unknown'}</Typography>
                <Typography><strong>Submitted On:</strong> {selectedResult.submittedAt
                  ? `${new Date(selectedResult.submittedAt).toLocaleDateString()} ${new Date(selectedResult.submittedAt).toLocaleTimeString()}`
                  : 'Unknown'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                  Answer Details
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 1, boxShadow: 'none' }}>
                  <Table size="small" aria-label="answers table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Question #</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Selected Answer</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Correct?</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Marks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedResult.answers && selectedResult.answers.map((answer, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{answer.selectedAnswer}</TableCell>
                          <TableCell>
                            {answer.isCorrect ? (
                              <Chip label="Correct" color="success" size="small" />
                            ) : (
                              <Chip label="Incorrect" color="error" size="small" />
                            )}
                          </TableCell>
                          <TableCell>{answer.marks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamResults;
