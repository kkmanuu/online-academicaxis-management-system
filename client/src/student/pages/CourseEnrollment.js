import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../shared/context/AuthContext';

const CourseEnrollment = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    fetchData();
  }, [getAuthHeader]);

  const fetchData = async () => {
    try {
      const teacherRes = await axios.get('http://localhost:5000/api/student/my-teacher', {
        headers: getAuthHeader()
      });

      if (teacherRes.data && !teacherRes.data.message) {
        setSelectedTeacher(teacherRes.data);
        setSelectedTeacherId(teacherRes.data._id);
      } else {
        setSelectedTeacher(null);
        setSelectedTeacherId('');
        setShowTeacherDialog(true);
      }

      const teachersRes = await axios.get('http://localhost:5000/api/student/available-teachers', {
        headers: getAuthHeader()
      });
      setTeachers(teachersRes.data);

      const [availableRes, enrolledRes] = await Promise.all([
        axios.get('http://localhost:5000/api/student/available-courses', {
          headers: getAuthHeader()
        }),
        axios.get('http://localhost:5000/api/student/enrolled-courses', {
          headers: getAuthHeader()
        })
      ]);

      if (availableRes.data.message) {
        setShowTeacherDialog(true);
      } else {
        setAvailableCourses(availableRes.data);
      }

      setEnrolledCourses(enrolledRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
      setLoading(false);
    }
  };

  const handleSelectTeacher = async (teacherId) => {
    try {
      await axios.post(`http://localhost:5000/api/student/select-teacher/${teacherId}`, {}, {
        headers: getAuthHeader()
      });
      setSuccess('🎉 Teacher selected successfully!');
      setShowTeacherDialog(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to select teacher');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTeacherChange = async (event) => {
    const teacherId = event.target.value;
    setSelectedTeacherId(teacherId);

    if (teacherId) {
      try {
        await axios.post(`http://localhost:5000/api/student/select-teacher/${teacherId}`, {}, {
          headers: getAuthHeader()
        });
        setSuccess('🎉 Teacher selected successfully!');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to select teacher');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`http://localhost:5000/api/student/enroll/${courseId}`, {}, {
        headers: getAuthHeader()
      });
      setSuccess('✅ Successfully enrolled in the course!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in the course');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" sx={{ backgroundColor: '#f5f7fa' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: 3, py: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1, maxWidth: 'lg', mx: 'auto' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 1, maxWidth: 'lg', mx: 'auto' }}>{success}</Alert>}

      {/* TEACHER SELECTION */}
      <Paper
        elevation={6}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1a237e' }}>
           Select Your Teacher
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="teacher-select-label">Teacher</InputLabel>
          <Select
            labelId="teacher-select-label"
            id="teacher-select"
            value={selectedTeacherId}
            label="Teacher"
            onChange={handleTeacherChange}
            sx={{
              borderRadius: 1,
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3f51b5' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3f51b5' }
            }}
          >
            <MenuItem value="">
              <em>Select a teacher</em>
            </MenuItem>
            {teachers.map((teacher) => (
              <MenuItem key={teacher._id} value={teacher._id}>
                {teacher.name} ({teacher.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* MY ASSIGNED TEACHER */}
      {selectedTeacher && (
        <Paper
          elevation={6}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            backgroundColor: '#e6f7e6',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
            }
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1a237e' }}>
             My Assigned Teacher
          </Typography>
          <Box display="flex" alignItems="center">
            <Avatar
              src={selectedTeacher.profilePicture || 'https://images.unsplash.com/photo-1516321310764-8d9a662d6929?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
              sx={{ width: 80, height: 80, mr: 2, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              {selectedTeacher.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {selectedTeacher.name}
              </Typography>
              <Typography sx={{ color: '#455a64' }}>
                {selectedTeacher.email}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* AVAILABLE COURSES */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1a237e' }}>
        Available Courses
      </Typography>
      <Grid container spacing={2}>
        {availableCourses.length > 0 ? (
          availableCourses.map((course) => (
            <Grid item xs={12} sm={6} lg={4} key={course._id}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#fff7e6',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    {course.name}
                  </Typography>
                  <Typography sx={{ color: '#455a64', mb: 1 }}>
                    Teacher: {course.teacher.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#455a64' }}>
                    {course.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleEnroll(course._id)}
                    startIcon={<SchoolIcon />}
                    sx={{
                      backgroundColor: '#3f51b5',
                      '&:hover': { backgroundColor: '#303f9f' },
                      borderRadius: 1,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1
                    }}
                  >
                    Enroll Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center', width: '100%', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ color: '#455a64' }}>
              No available courses. Please select a teacher.
            </Typography>
          </Paper>
        )}
      </Grid>

      {/* ENROLLED COURSES */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: '#1a237e' }}>
       My Enrolled Courses
      </Typography>
      <Grid container spacing={2}>
        {enrolledCourses.length > 0 ? (
          enrolledCourses.map((course) => (
            <Grid item xs={12} sm={6} lg={4} key={course._id}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#f2f2f2',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    {course.name}
                  </Typography>
                  <Typography sx={{ color: '#455a64', mb: 1 }}>
                    Teacher: {course.teacher.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#455a64' }}>
                    {course.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center', width: '100%', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ color: '#455a64' }}>
              No enrolled courses yet.
            </Typography>
          </Paper>
        )}
      </Grid>

      {/* DIALOG FOR TEACHER SELECTION */}
      <Dialog
        open={showTeacherDialog}
        onClose={() => setShowTeacherDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1a237e' }}>Select a Teacher</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, color: '#455a64' }}>
            Please select a teacher to view and enroll in their courses.
          </Typography>
          <Divider sx={{ my: 1 }} />
          <List>
            {teachers.map((teacher) => (
              <ListItem
                button
                onClick={() => handleSelectTeacher(teacher._id)}
                key={teacher._id}
                sx={{
                  borderRadius: 1,
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={teacher.profilePicture || 'https://images.unsplash.com/photo-1516321310764-8d9a662d6929?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    sx={{ width: 48, height: 48, border: '2px solid #fff' }}
                  >
                    {teacher.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 'bold', color: '#1a237e' }}>{teacher.name}</Typography>}
                  secondary={<Typography sx={{ color: '#455a64' }}>{teacher.email}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowTeacherDialog(false)}
            sx={{
              color: '#3f51b5',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseEnrollment;