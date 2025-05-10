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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Assessment as ResultsIcon } from '@mui/icons-material';
import { useAuth } from '../../shared/context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    startTime: '',
    endTime: ''
  });

  const { getAuthHeader } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/exams/teacher', {
        headers: getAuthHeader()
      });
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teacher/courses', {
        headers: getAuthHeader()
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleOpenDialog = (exam = null) => {
    if (exam) {
      setSelectedExam(exam);
      setFormData({
        title: exam.title,
        description: exam.description,
        courseId: exam.course._id,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        startTime: exam.startTime.split('T')[0],
        endTime: exam.endTime.split('T')[0]
      });
    } else {
      setSelectedExam(null);
      setFormData({
        title: '',
        description: '',
        courseId: '',
        duration: 60,
        totalMarks: 100,
        passingMarks: 40,
        startTime: '',
        endTime: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedExam(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = getAuthHeader();
      
      // Format the dates properly
      const formattedData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };
      
      // Log the data being sent to the server
      console.log('Sending exam data:', formattedData);
      
      if (selectedExam) {
        await axios.put(`http://localhost:5000/api/exams/${selectedExam._id}`, formattedData, {
          headers
        });
      } else {
        if (!formData.courseId) {
          alert('Please select a course');
          return;
        }
        const response = await axios.post('http://localhost:5000/api/exams', formattedData, {
          headers
        });
        console.log('Exam created successfully:', response.data);
      }
      fetchExams();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving exam:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to save exam: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await axios.delete(`http://localhost:5000/api/exams/${examId}`, {
          headers: getAuthHeader()
        });
        fetchExams();
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  const handleManageQuestions = (examId) => {
    navigate(`/teacher/exams/${examId}/questions`);
  };

  const handleManageStudents = (examId) => {
    navigate(`/teacher/exams/${examId}/students`);
  };

  const handleViewResults = (examId) => {
    navigate(`/teacher/results/${examId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Exam Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create New Exam
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Duration (min)</TableCell>
              <TableCell>Total Marks</TableCell>
              <TableCell>Passing Marks</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam._id}>
                <TableCell>{exam.title}</TableCell>
                <TableCell>{exam.course?.name || 'N/A'}</TableCell>
                <TableCell>{exam.duration}</TableCell>
                <TableCell>{exam.totalMarks}</TableCell>
                <TableCell>{exam.passingMarks}</TableCell>
                <TableCell>{new Date(exam.startTime).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(exam.endTime).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleManageQuestions(exam._id)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleManageStudents(exam._id)} color="primary">
                    <AddIcon />
                  </IconButton>
                  <IconButton onClick={() => handleViewResults(exam._id)} color="success">
                    <ResultsIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(exam._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedExam ? 'Edit Exam' : 'Create New Exam'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Course</InputLabel>
                  <Select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    label="Course"
                  >
                    {courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Total Marks"
                  name="totalMarks"
                  type="number"
                  value={formData.totalMarks}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Passing Marks"
                  name="passingMarks"
                  type="number"
                  value={formData.passingMarks}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  name="startTime"
                  type="date"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  name="endTime"
                  type="date"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedExam ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamManagement; 