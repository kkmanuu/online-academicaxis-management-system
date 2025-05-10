import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as ExamIcon,
  School as CourseIcon,
  ExitToApp as LogoutIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useAuth } from '../../shared/context/AuthContext';
import axios from 'axios';
import CourseEnrollment from './CourseEnrollment';
import StudentProfile from '../components/StudentProfile';
import ExamInterface from './ExamInterface';
import AvailableExams from './AvailableExams';
import MyResults from './MyResults';
import { format, parseISO } from 'date-fns';

const StudentDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      enrolledCourses: 0,
      completedExams: 0,
      pendingExams: 0,
      averageScore: 0
    },
    results: [],
    courses: []
  });
  const { user, logout, getAuthHeader, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      setError('Please log in to view the dashboard.');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeader();
      console.log('Fetch dashboard data - Auth headers:', headers);

      const response = await axios.get('http://localhost:5000/api/student/dashboard', { headers });
      console.log('Dashboard data response:', response.data);

      setDashboardData({
        stats: response.data.stats || {
          enrolledCourses: 0,
          completedExams: 0,
          pendingExams: 0,
          averageScore: 0
        },
        results: response.data.results || [],
        courses: response.data.courses || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      let errorMessage = 'Failed to load dashboard data. Please try again.';
      if (error.response) {
        errorMessage = error.response.data.message || `Error ${error.response.status}: Invalid request`;
        if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = 'Authentication failed. Please log in again.';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your network connection.';
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const drawer = (
    <Box sx={{ backgroundColor: '#ffffff', height: '100%' }}>
      <Toolbar sx={{ background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)', color: '#fff' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          EduConnect
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {[
          { text: 'Dashboard', icon: <DashboardIcon sx={{ color: '#3f51b5' }} />, to: '/student' },
          { text: 'My Profile', icon: <ProfileIcon sx={{ color: '#3f51b5' }} />, to: '/student/profile' },
          { text: 'Course Enrollment', icon: <CourseIcon sx={{ color: '#3f51b5' }} />, to: '/student/courses' },
          { text: 'Available Exams', icon: <ExamIcon sx={{ color: '#3f51b5' }} />, to: '/student/exams' },
          { text: 'My Results', icon: <ExamIcon sx={{ color: '#3f51b5' }} />, to: '/student/results' }
        ].map((item) => (
          <ListItem
            button
            component={Link}
            to={item.to}
            key={item.text}
            sx={{
              '&:hover': {
                backgroundColor: '#f5f5f5',
                '& .MuiListItemIcon-root': { color: '#303f9f' },
                '& .MuiListItemText-primary': { color: '#303f9f' }
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: '#1a237e' }} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            '&:hover': {
              backgroundColor: '#f5f5f5',
              '& .MuiListItemIcon-root': { color: '#303f9f' },
              '& .MuiListItemText-primary': { color: '#303f9f' }
            }
          }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: '#3f51b5' }} />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: '#1a237e' }} />
        </ListItem>
      </List>
    </Box>
  );

  // Redirect if not student
  if (!user || user.role !== 'student') {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ backgroundColor: '#f5f7fa' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            EduConnect Dashboard - Student
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: 'transparent'
          },
          display: { xs: 'none', sm: 'block' }
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: 'transparent'
          },
          display: { xs: 'block', sm: 'none' }
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Toolbar />
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1, maxWidth: 'lg', mx: 'auto' }}>
            {error}
          </Alert>
        )}
        <Routes>
          <Route path="/" element={
            <Container maxWidth="lg" sx={{ mt: 2, mb: 3 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3 }}
              >
                Welcome, {user.name || 'Student'}
              </Typography>
              <Grid container spacing={2}>
                {[
                  { title: 'Enrolled Courses', value: dashboardData.stats.enrolledCourses || 0, icon: <CourseIcon /> },
                  { title: 'Completed Exams', value: dashboardData.stats.completedExams || 0, icon: <ExamIcon /> },
                  { title: 'Pending Exams', value: dashboardData.stats.pendingExams || 0, icon: <ExamIcon /> },
                  { title: 'Average Score', value: dashboardData.stats.averageScore ? `${dashboardData.stats.averageScore.toFixed(2)}%` : 'N/A', icon: <DashboardIcon /> }
                ].map((stat, index) => (
                  <Grid item xs={12} sm={6} lg={3} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 120,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={1}>
                        {stat.icon}
                        <Typography component="h2" variant="h6" color="#3f51b5" ml={1}>
                          {stat.title}
                        </Typography>
                      </Box>
                      <Typography component="p" variant="h4" sx={{ color: '#1a237e' }}>
                        {stat.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                  Enrolled Courses
                </Typography>
                {dashboardData.courses && dashboardData.courses.length > 0 ? (
                  <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#3f51b5' }}>
                          <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Course Name</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Teacher</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.courses.map((course, index) => (
                          <TableRow
                            key={course._id}
                            sx={{
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5',
                              '&:hover': { backgroundColor: '#e3f2fd' }
                            }}
                          >
                            <TableCell sx={{ color: '#1a237e' }}>{course.name || 'N/A'}</TableCell>
                            <TableCell sx={{ color: '#455a64' }}>{course.teacher || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip
                                label={course.status.replace('_', ' ').toUpperCase()}
                                color={course.status === 'completed' ? 'success' : course.status === 'in_progress' ? 'warning' : 'default'}
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <Typography variant="h6" color="text.secondary">
                      No enrolled courses.
                    </Typography>
                  </Paper>
                )}
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                  Recent Exam Results
                </Typography>
                {dashboardData.results.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <Typography variant="h6" color="text.secondary">
                      No results available yet.
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#3f51b5' }}>
                          <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Exam Title</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Course</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Marks Obtained</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Total Marks</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Percentage</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Submitted At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.results.map((result, index) => (
                          <TableRow
                            key={result._id}
                            sx={{
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5',
                              '&:hover': { backgroundColor: '#e3f2fd' }
                            }}
                          >
                            <TableCell sx={{ color: '#1a237e' }}>{result.exam?.title || 'N/A'}</TableCell>
                            <TableCell sx={{ color: '#455a64' }}>{result.exam?.course?.name || result.course?.name || 'N/A'}</TableCell>
                            <TableCell sx={{ color: '#455a64' }}>{result.marksObtained || 0}</TableCell>
                            <TableCell sx={{ color: '#455a64' }}>{result.totalMarks || 0}</TableCell>
                            <TableCell sx={{ color: '#455a64' }}>{result.percentage ? result.percentage.toFixed(2) + '%' : 'N/A'}</TableCell>
                            <TableCell>
                              <Chip
                                label={result.status ? result.status.charAt(0).toUpperCase() + result.status.slice(1) : 'N/A'}
                                color={result.status === 'pass' ? 'success' : 'error'}
                                sx={{ fontWeight: 'medium' }}
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
              </Box>
            </Container>
          } />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/exams" element={<AvailableExams />} />
          <Route path="/exams/:examId" element={<ExamInterface />} />
          <Route path="/courses" element={<CourseEnrollment />} />
          <Route path="/results" element={<MyResults />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default StudentDashboard;