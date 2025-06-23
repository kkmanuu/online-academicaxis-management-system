import React, { useState } from 'react';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Toolbar,
  Typography,
  IconButton,
  Switch
} from '@mui/material';
import {
  Person as ProfileIcon,
  Lock as PasswordIcon,
  Notifications as NotificationsIcon,
  Brightness4 as ThemeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SettingsSidebar = ({ open, onClose, onThemeToggle, isDarkMode }) => {
  const { user } = useAuth();

  const settingsItems = [
    { text: 'Profile', icon: <ProfileIcon sx={{ color: '#3f51b5' }} />, to: `/${user?.role}/settings/profile` },
    { text: 'Change Password', icon: <PasswordIcon sx={{ color: '#3f51b5' }} />, to: `/${user?.role}/settings/password` },
    { text: 'Notifications', icon: <NotificationsIcon sx={{ color: '#3f51b5' }} />, to: `/${user?.role}/settings/notifications` }
  ];

  const drawerContent = (
    <Box sx={{ backgroundColor: '#ffffff', height: '100%' }}>
      <Toolbar sx={{ background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)', color: '#fff' }}>
        <SettingsIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Settings
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {settingsItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.to}
            key={item.text}
            onClick={onClose}
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
        <ListItem
          sx={{
            '&:hover': {
              backgroundColor: '#f5f5f5',
              '& .MuiListItemIcon-root': { color: '#303f9f' },
              '& .MuiListItemText-primary': { color: '#303f9f' }
            }
          }}
        >
          <ListItemIcon>
            <ThemeIcon sx={{ color: '#3f51b5' }} />
          </ListItemIcon>
          <ListItemText primary="Dark Mode" sx={{ color: '#1a237e' }} />
          <Switch
            checked={isDarkMode}
            onChange={onThemeToggle}
            color="primary"
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: 'transparent'
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default SettingsSidebar;