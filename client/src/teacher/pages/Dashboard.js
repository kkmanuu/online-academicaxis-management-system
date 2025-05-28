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

const TeacherDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalExams: 0,
    totalStudents: 0,
    averageScore: 0
  });
  
  const { user, logout, getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teacher/statistics', {
          headers: getAuthHeader()
        });
        setStats(response.data);
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
    <Box sx={{ backgroundColor: '#ffffff', height: '100%' }}>
      <Toolbar sx={{ background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)', color: '#fff' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          EduConnect
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {[
          { text: 'Dashboard', icon: <DashboardIcon sx={{ color: '#3f51b5' }} />, to: '/teacher' },
          { text: 'Exam Management', icon: <ExamIcon sx={{ color: '#3f51b5' }} />, to: '/teacher/exams' },
          { text: 'Course Management', icon: <CourseIcon sx={{ color: '#3f51b5' }} />, to: '/teacher/courses' },
          { text: 'Student Results', icon: <ResultsIcon sx={{ color: '#3f51b5' }} />, to: '/teacher/results' }
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

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/login" />;
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
            EduConnect Dashboard - Teacher
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
          // width: { sm: `calc(100% - 240px)` },
          // ml: { sm: '240px' },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={
            <Container maxWidth="lg" sx={{ mt: 2, mb: 3 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3 }}
              >
                Welcome, {user.name || 'Teacher'}
              </Typography>
              <Grid container spacing={2}>
                {[
                  { title: 'Total Courses', value: stats.totalCourses || 0 },
                  { title: 'Total Exams', value: stats.totalExams || 0 },
                  { title: 'Total Students', value: stats.totalStudents || 0 },
                  { title: 'Average Score', value: stats.averageScore ? `${stats.averageScore.toFixed(2)}%` : 'N/A' }
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
                      <Typography component="h2" variant="h6" sx={{ color: '#3f51b5', mb: 1 }}>
                        {stat.title}
                      </Typography>
                      <Typography component="p" variant="h4" sx={{ color: '#1a237e' }}>
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