import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Divider,
  Container,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../shared/context/AuthContext';
import { Edit as EditIcon, School as SchoolIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file); // Convert to Base64
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name || formData.name.trim() === '') {
      setError('Name is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Assume auth token is handled by AuthContext or middleware
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update user in auth context
      setUser({ ...user, ...formData });
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setError('');
    setSuccess('');
    // Reset form data when canceling edit
    if (editMode) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        profilePicture: user?.profilePicture || ''
      });
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
            startIcon={editMode ? <CancelIcon /> : <SchoolIcon />}
            size="small"
            onClick={toggleEditMode}
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
            {editMode ? 'Cancel' : 'Edit Profile'}
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

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                {editMode ? (
                  <>
                    <Avatar
                      src={formData.profilePicture || 'https://images.unsplash.com/photo-1516321310764-8d9a662d6929?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                      alt={formData.name}
                      sx={{
                        width: { xs: 100, sm: 120 },
                        height: { xs: 100, sm: 120 },
                        mb: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '3px solid #fff'
                      }}
                    >
                      {getInitials(formData.name)}
                    </Avatar>
                    <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                      Upload Picture
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>
                  </>
                ) : (
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
                )}
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
                  {editMode ? formData.name || 'Student Name' : user?.name || 'Student Name'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    color: '#455a64',
                    mb: 1
                  }}
                >
                  {editMode ? formData.email || 'student@example.com' : user?.email || 'student@example.com'}
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

                {editMode ? (
                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={loading}
                          sx={{
                            borderRadius: 2,
                            backgroundColor: '#3f51b5',
                            '&:hover': { backgroundColor: '#303f9f' }
                          }}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentProfile;