import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userStats: {
      total: 0,
      students: 0,
      teachers: 0,
      admins: 0
    },
    examStats: {
      total: 0,
      active: 0,
      completed: 0,
      upcoming: 0
    },
    courseStats: {
      total: 0,
      active: 0,
      completed: 0
    },
    performanceStats: {
      averageScore: 0,
      passRate: 0,
      failRate: 0
    }
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/statistics');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  const userData = [
    { name: 'Students', value: stats.userStats.students },
    { name: 'Teachers', value: stats.userStats.teachers },
    { name: 'Admins', value: stats.userStats.admins }
  ];

  const examData = [
    { name: 'Active', value: stats.examStats.active },
    { name: 'Completed', value: stats.examStats.completed },
    { name: 'Upcoming', value: stats.examStats.upcoming }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        System Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* User Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Exam Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Exam Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={examData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Average Score</TableCell>
                    <TableCell align="right">{stats.performanceStats.averageScore.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pass Rate</TableCell>
                    <TableCell align="right">{stats.performanceStats.passRate.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fail Rate</TableCell>
                    <TableCell align="right">{stats.performanceStats.failRate.toFixed(2)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Course Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Course Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                  <Typography variant="h4">{stats.courseStats.total}</Typography>
                  <Typography>Total Courses</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                  <Typography variant="h4">{stats.courseStats.active}</Typography>
                  <Typography>Active Courses</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                  <Typography variant="h4">{stats.courseStats.completed}</Typography>
                  <Typography>Completed Courses</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics; 