import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      // Store token and redirect
      localStorage.setItem('token', response.data.token);
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.data.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (response.data.user.role === 'student') {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 4, mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 2,
          py: 3,
          px: 2
        }}
      >
        <Avatar
          src="https://images.unsplash.com/photo-1516321310764-8d9a662d6929?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          alt="EduConnect Dashboard"
          sx={{ width: 80, height: 80, mb: 2, border: '2px solid #fff', boxShadow: 3 }}
        />
        <Typography
          component="h1"
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#1a237e' }}
        >
          EduConnect Dashboard
        </Typography>
        <Typography
          variant="subtitle2"
          align="center"
          sx={{ mb: 2, color: '#455a64' }}
        >
          Register to start your learning journey
        </Typography>
        <Paper
          elevation={6}
          sx={{
            p: 3,
            width: '100%',
            borderRadius: 2,
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="dense"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': { borderColor: '#3f51b5' },
                  '&.Mui-focused fieldset': { borderColor: '#3f51b5' }
                }
              }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': { borderColor: '#3f51b5' },
                  '&.Mui-focused fieldset': { borderColor: '#3f51b5' }
                }
              }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': { borderColor: '#3f51b5' },
                  '&.Mui-focused fieldset': { borderColor: '#3f51b5' }
                }
              }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': { borderColor: '#3f51b5' },
                  '&.Mui-focused fieldset': { borderColor: '#3f51b5' }
                }
              }}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
                disabled={loading}
                sx={{
                  borderRadius: 1,
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3f51b5' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3f51b5' }
                }}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 1,
                py: 1,
                borderRadius: 1,
                backgroundColor: '#3f51b5',
                '&:hover': { backgroundColor: '#303f9f' },
                textTransform: 'none',
                fontSize: '0.9rem'
              }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SchoolIcon />}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/login')}
              disabled={loading}
              sx={{
                py: 1,
                borderRadius: 1,
                borderColor: '#3f51b5',
                color: '#3f51b5',
                textTransform: 'none',
                fontSize: '0.9rem',
                '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#303f9f' }
              }}
            >
              Already have an account? Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;