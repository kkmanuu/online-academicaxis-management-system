import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Container,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../shared/context/AuthContext';
import { School as SchoolIcon } from '@mui/icons-material';
import axios from 'axios';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000'; // Adjust to your backend URL

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleOpen = () => {
    setOpen(true);
    setError('');
    setSuccess('');
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      profilePicture: user?.profilePicture || ''
    });
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate form data
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      setError('A valid email is required');
      setLoading(false);
      return;
    }

    if (
      formData.name === (user?.name || '') &&
      formData.email === (user?.email || '') &&
      formData.profilePicture === (user?.profilePicture || '')
    ) {
      setError('No changes made to the profile');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    console.log('Submitting profile update:', {
      token: token ? 'Present' : 'Missing',
      formData,
      url: `${axios.defaults.baseURL}/api/student/profile`
    });

    if (!token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put('/api/student/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: status => status >= 200 && status < 300 // Accept 200-299
      });
      console.log('Raw response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      setUser(response.data.student);
      setSuccess(response.data.message);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Update error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        headers: err.response?.headers
      });
      let errorMessage = 'Failed to update profile';
      if (err.response) {
        errorMessage = err.response.data.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Check if the backend is running.';
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 3 }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)'
        }}
      >
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Button
            variant="contained"
            startIcon={<SchoolIcon />}
            size="small"
            onClick={handleOpen}
            sx={{
              borderRadius: 2,
              backgroundColor: '#3f51b5',
              '&:hover': {
                backgroundColor: '#303f9f',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              },
              textTransform: 'none',
              fontSize: '0.9rem',
              px: 2,
              py: 1
            }}
          >
            Edit Profile
          </Button>
        </Box>

        <Typography
          variant="h5"
          gutterBottom
          sx={{
            mb: 2,
            fontWeight: 'bold',
            color: '#1a237e',
            borderBottom: '2px solid #3f51b5',
            pb: 1,
            display: 'inline-block'
          }}
        >
          EduConnect Profile
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              elevation={0}
              sx={{
                width: '100%',
                borderRadius: 3,
                background: 'transparent',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Avatar
                  src={user?.profilePicture || 'https://images.unsplash.com/photo-1516321310764-8d9a662d6929?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                  alt={user?.name}
                  sx={{
                    width: { xs: 100, sm: 120 },
                    height: { xs: 100, sm: 120 },
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '3px solid #fff'
                  }}
                >
                  {getInitials(user?.name)}
                </Avatar>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#1a237e',
                    mb: 1
                  }}
                >
                  {user?.name || 'Student Name'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: '#455a64',
                    mb: 1
                  }}
                >
                  {user?.email || 'student@example.com'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: 'center',
                    color: '#455a64',
                    fontStyle: 'italic'
                  }}
                >
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card
              elevation={0}
              sx={{
                width: '100%',
                borderRadius: 3,
                background: 'transparent',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 'bold',
                    color: '#1a237e',
                    borderBottom: '1px solid',
                    borderColor: '#3f51b5',
                    pb: 1
                  }}
                >
                  Account Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        '&:hover': { backgroundColor: '#f5f5f5' }
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          minWidth: 100,
                          fontWeight: 'bold',
                          color: '#455a64'
                        }}
                      >
                        Email:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#1a237e' }}>
                        {user?.email || 'student@example.com'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        '&:hover': { backgroundColor: '#f5f5f5' }
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          minWidth: 100,
                          fontWeight: 'bold',
                          color: '#455a64'
                        }}
                      >
                        Role:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          textTransform: 'capitalize',
                          fontWeight: 'medium',
                          color: '#1a237e'
                        }}
                      >
                        {user?.role || 'Student'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        '&:hover': { backgroundColor: '#f5f5f5' }
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          minWidth: 100,
                          fontWeight: 'bold',
                          color: '#455a64'
                        }}
                      >
                        Status:
                      </Typography>
                      <Chip
                        label={user?.isBlocked ? 'Blocked' : 'Active'}
                        color={user?.isBlocked ? 'error' : 'success'}
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                fullWidth
                id="profilePicture"
                label="Profile Picture URL"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                helperText="Enter a valid image URL (optional)"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default StudentProfile;