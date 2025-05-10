import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import Login from './auth/pages/Login';
import Register from './auth/pages/Register';
import AdminDashboard from './admin/pages/Dashboard';
import TeacherDashboard from './teacher/pages/Dashboard';
import StudentDashboard from './student/pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />
        
        {/* Teacher routes */}
        <Route path="/teacher/*" element={<TeacherDashboard />} />
        
        {/* Student routes */}
        <Route path="/student/*" element={<StudentDashboard />} />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
