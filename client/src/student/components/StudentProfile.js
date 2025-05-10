import React from 'react';
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
  Chip
} from '@mui/material';
import { useAuth } from '../../shared/context/AuthContext';
import { Edit as EditIcon, School as SchoolIcon } from '@mui/icons-material';

const StudentProfile = () => {
  const { user } = useAuth();

  // Default avatar if no profile picture is available
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
      </Paper>
    </Container>
  );
};

export default StudentProfile;