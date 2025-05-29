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
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon, Block as BlockIcon, CheckCircle as UnblockIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../shared/context/AuthContext';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [studentResults, setStudentResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/students', {
        headers: getAuthHeader()
      });
      console.log('Students fetched:', response.data);
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again.');
      setLoading(false);
    }
  };

  const fetchStudentResults = async (studentId) => {
    try {
      setLoadingResults(true);
      const response = await axios.get(`http://localhost:5000/api/admin/students/${studentId}/results`, {
        headers: getAuthHeader()
      });
      console.log('Student results fetched:', response.data);
      setStudentResults(response.data);
      setLoadingResults(false);
    } catch (error) {
      console.error('Error fetching student results:', error);
      setError('Failed to load student results. Please try again.');
      setLoadingResults(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewResults = (student) => {
    setSelectedStudent(student);
    fetchStudentResults(student._id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setStudentResults([]);
  };

  const handleToggleBlock = async (student) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${student._id}/block`,
        {},
        { headers: getAuthHeader() }
      );
      
      // Update the student in the local state
      setStudents(students.map(s => 
        s._id === student._id ? { ...s, isBlocked: !s.isBlocked } : s
      ));
      
      console.log('Student block status updated:', response.data);
    } catch (error) {
      console.error('Error updating student block status:', error);
      setError('Failed to update student status. Please try again.');
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(searchLower)) ||
      (student.email && student.email.toLowerCase().includes(searchLower))
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
        Student Management
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by student name or email"
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
      
      {filteredStudents.length === 0 ? (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="body1">
            No students found.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={student.isBlocked ? "Blocked" : "Active"} 
                      color={student.isBlocked ? "error" : "success"} 
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => handleViewResults(student)}
                      sx={{ mr: 1 }}
                    >
                      View Results
                    </Button>
                    <Tooltip title={student.isBlocked ? "Unblock Student" : "Block Student"}>
                      <IconButton 
                        onClick={() => handleToggleBlock(student)} 
                        color={student.isBlocked ? "success" : "error"}
                      >
                        {student.isBlocked ? <UnblockIcon /> : <BlockIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Results Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Results for {selectedStudent?.name}
        </DialogTitle>
        <DialogContent>
          {loadingResults ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : studentResults.length === 0 ? (
            <Typography variant="body1" sx={{ p: 2 }}>
              No results found for this student.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Exam Title</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentResults.map((result) => (
                    <TableRow key={result._id}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentManagement; 