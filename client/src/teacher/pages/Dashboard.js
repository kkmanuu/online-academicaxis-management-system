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
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as ExamIcon,
  School as CourseIcon,
  ExitToApp as LogoutIcon,
  Assessment as ResultsIcon
} from '@mui/icons-material';
import { useAuth } from '../../shared/context/AuthContext';
import axios from 'axios';
import ExamManagement from './ExamManagement';
import QuestionManagement from './QuestionManagement';
import StudentEnrollment from './StudentEnrollment';
import CourseManagement from './CourseManagement';
import StudentResults from './StudentResults';

const drawerWidth = 240;

const TeacherDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalExams: 0,
    totalStudents: 0
  });

  const { user, logout, getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teacher/statistics', {
          headers: getAuthHeader()
        });
        const { totalCourses, totalExams, totalStudents } = response.data;
        setStats({ totalCourses, totalExams, totalStudents });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    if (user && user.role === 'teacher') {
      fetchStats();
    }
  }, [getAuthHeader, user]);

  const handleLogout = () => {
    logout();
  };

  const drawer = (
    <Box sx={{ height: '100%' }}>
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
          color: '#fff'
        }}
      >
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          EduConnect
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {[
          { text: 'Dashboard', icon: <DashboardIcon />, to: '/teacher' },
          { text: 'Exam Management', icon: <ExamIcon />, to: '/teacher/exams' },
          { text: 'Course Management', icon: <CourseIcon />, to: '/teacher/courses' },
          { text: 'Student Results', icon: <ResultsIcon />, to: '/teacher/results' }
        ].map((item) => (
          <ListItem
            button
            component={Link}
            to={item.to}
            key={item.text}
            sx={{
              '&:hover': {
                backgroundColor: '#e8eaf6',
              },
              '& .MuiListItemIcon-root': { color: '#3f51b5' },
              '& .MuiListItemText-primary': { fontWeight: 500, color: '#1a237e' }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
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
              backgroundColor: '#e8eaf6',
            },
            '& .MuiListItemIcon-root': { color: '#3f51b5' },
            '& .MuiListItemText-primary': { fontWeight: 500, color: '#1a237e' }
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/login" />;
  }

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
          boxShadow: 3
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" fontWeight="bold">
            EduConnect Dashboard - Teacher
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#fff'
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Temporary drawer for mobile */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#fff'
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        <Routes>
          <Route path="/" element={
            <Container maxWidth="lg">
              <Typography
                variant="h4"
                gutterBottom
                fontWeight="bold"
                sx={{ color: '#1a237e', mb: 4 }}
              >
                Welcome, {user.name || 'Teacher'}
              </Typography>
              <Grid container spacing={3}>
                {[
                  { title: 'Total Courses', value: stats.totalCourses },
                  { title: 'Total Exams', value: stats.totalExams },
                  { title: 'Total Students', value: stats.totalStudents }
                ].map((stat, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        textAlign: 'center',
                        background: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ color: '#3f51b5', mb: 1 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                        {stat.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Container>
          } />
          <Route path="/exams" element={<ExamManagement />} />
          <Route path="/exams/:examId/questions" element={<QuestionManagement />} />
          <Route path="/exams/:examId/students" element={<StudentEnrollment />} />
          <Route path="/courses" element={<CourseManagement />} />
          <Route path="/results" element={<StudentResults />} />
          <Route path="/results/:examId" element={<StudentResults />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
