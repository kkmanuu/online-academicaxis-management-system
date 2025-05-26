import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../shared/context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('edit'); // 'edit' or 'add'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: getAuthHeader()
      });
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users. Please try again.');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'student',
      password: ''
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: getAuthHeader()
        });
        setSuccess('User deleted successfully');
        fetchUsers();
      } catch (error) {
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const handleBlock = async (userId, isBlocked) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/block`,
        {},
        { headers: getAuthHeader() }
      );
      setSuccess(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
      fetchUsers();
    } catch (error) {
      setError('Failed to update user status. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'edit') {
        await axios.put(
          `http://localhost:5000/api/admin/users/${selectedUser._id}`,
          formData,
          { headers: getAuthHeader() }
        );
        setSuccess('User updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/users',
          formData,
          { headers: getAuthHeader() }
        );
        setSuccess('User created successfully');
      }
      setOpenDialog(false);
      fetchUsers();
    } catch (error) {
      setError(dialogMode === 'edit' ? 'Failed to update user' : 'Failed to create user');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const filteredUsers = users.filter(user => {
    if (tabValue === 0) return user.role === 'teacher';
    if (tabValue === 1) return user.role === 'student';
    return true;
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAdd}
        sx={{ mb: 2 }}
      >
        Add New User
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Teachers" />
        <Tab label="Students" />
        <Tab label="All Users" />
      </Tabs>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'error' : user.role === 'teacher' ? 'primary' : 'success'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isBlocked ? 'Blocked' : 'Active'}
                      color={user.isBlocked ? 'error' : 'success'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(user)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleBlock(user._id, user.isBlocked)}
                      color={user.isBlocked ? 'success' : 'error'}
                    >
                      {user.isBlocked ? <UnblockIcon /> : <BlockIcon />}
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogMode === 'edit' ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {dialogMode === 'add' && (
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          )}
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} color="primary">{dialogMode === 'edit' ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;