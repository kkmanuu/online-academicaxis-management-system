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
  const [results, setResults] = useState([]); // Stores fetched exam results
  const [loading, setLoading] = useState(true); // Controls loading spinner
  const [error, setError] = useState(''); // Stores any error message
  const [searchTerm, setSearchTerm] = useState(''); // Stores search input
  const [selectedResult, setSelectedResult] = useState(null); // Stores result selected for detail view
  const [openDialog, setOpenDialog] = useState(false); // Controls result detail dialog
  const [exams, setExams] = useState([]); // Stores list of all exams
  const [selectedExam, setSelectedExam] = useState(''); // Currently selected exam filter
  const { getAuthHeader } = useAuth(); // Authentication headers

  // Fetch exams and all results on component mount
  useEffect(() => {
    fetchExams();
    fetchAllResults();
  }, []);

  // Fetch all exams
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

  // Fetch all results
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

  // Fetch results for a specific exam
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

  // Handle change of selected exam
  const handleExamChange = (event) => {
    const examId = event.target.value;
    setSelectedExam(examId);

    if (examId === 'all') {
      fetchAllResults();
    } else {
      fetchExamResults(examId);
    }
  };

  // Open result detail dialog
  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setOpenDialog(true);
  };

  // Close result detail dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResult(null);
  };

  // Filter results by search term and selected exam
  const filteredResults = results.filter(result => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      result.student?.name?.toLowerCase().includes(searchLower) ||
      result.exam?.title?.toLowerCase().includes(searchLower) ||
      result.exam?.course?.name?.toLowerCase().includes(searchLower)
    );

    const matchesExam = !selectedExam || selectedExam === 'all' || result.exam?._id === selectedExam;

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
      <Container maxWidth={false} sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflowY: 'auto', bgcolor: 'background.paper', p: 3 }}>
        <Alert severity="error" sx={{ fontSize: '1.1rem' }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Exam Results
      </Typography>

      {/* Filter Section */}
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
            sx={{ maxWidth: 500, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                <MenuItem key={exam._id} value={exam._id}>{exam.title}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Results Table */}
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
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamResults;
