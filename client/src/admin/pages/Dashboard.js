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
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  ExitToApp as LogoutIcon,
  Assessment as ResultsIcon,
  Person as StudentIcon
} from '@mui/icons-material';
import { useAuth } from '../../shared/context/AuthContext';
import axios from 'axios';
import StudentManagement from './StudentManagement';
import ExamResults from './ExamResults';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();

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
          { text: 'Dashboard', icon: <DashboardIcon sx={{ color: '#3f51b5' }} />, to: '/admin' },
          { text: 'User Management', icon: <PeopleIcon sx={{ color: '#3f51b5' }} />, to: '/admin/users' },
          { text: 'Student Management', icon: <StudentIcon sx={{ color: '#3f51b5' }} />, to: '/admin/students' },
          { text: 'Exam Results', icon: <ResultsIcon sx={{ color: '#3f51b5' }} />, to: '/admin/results' }
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

  if (!user || user.role !== 'admin') {
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
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            EduConnect Dashboard - Admin
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
        ModalProps={{
          keepMounted: true
        }}
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
          ml: { sm: 0 },

          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={
            <Container maxWidth="lg" sx={{ mt: 2, mb: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontWeight: 'bold', color: '#1a237e', mb: 2 }}
                >
                  Welcome to the Admin Dashboard
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: '#455a64' }}
                >
                  Use the navigation menu to manage users, students, and exam results.
                </Typography>
              </Paper>
            </Container>
          } />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/results" element={<ExamResults />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminDashboard;