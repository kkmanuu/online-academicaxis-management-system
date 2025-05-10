import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useAuth } from '../../shared/context/AuthContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StudentEnrollment = () => {
  const [students, setStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const { examId } = useParams();
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    fetchStudents();
    fetchEnrolledStudents();
  }, [examId]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/students', {
        headers: getAuthHeader()
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exams/${examId}`, {
        headers: getAuthHeader()
      });
      setEnrolledStudents(response.data.enrolledStudents || []);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = students
        .filter(student => !enrolledStudents.find(es => es._id === student._id))
        .map(student => student._id);
      setSelectedStudents(newSelected);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    const selectedIndex = selectedStudents.indexOf(studentId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedStudents, studentId);
    } else {
      newSelected = newSelected.concat(
        selectedStudents.slice(0, selectedIndex),
        selectedStudents.slice(selectedIndex + 1)
      );
    }

    setSelectedStudents(newSelected);
  };

  const handleEnrollStudents = async () => {
    try {
      await axios.post(`http://localhost:5000/api/exams/${examId}/enroll`, {
        studentIds: selectedStudents
      }, {
        headers: getAuthHeader()
      });
      fetchEnrolledStudents();
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error enrolling students:', error);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      // Remove student logic here
      fetchEnrolledStudents();
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Student Enrollment
      </Typography>

      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Enroll New Students
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search students..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                    checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents
                .filter(student => !enrolledStudents.find(es => es._id === student._id))
                .map((student) => (
                  <TableRow key={student._id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedStudents.indexOf(student._id) !== -1}
                        onChange={() => handleSelectStudent(student._id)}
                      />
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleSelectStudent(student._id)}
                      >
                        <AddIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleEnrollStudents}
            disabled={selectedStudents.length === 0}
          >
            Enroll Selected Students
          </Button>
        </Box>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Enrolled Students
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrolledStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveStudent(student._id)}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default StudentEnrollment; 