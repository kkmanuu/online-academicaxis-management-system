import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import ProtectedRoute from './shared/components/ProtectedRoute';
// Import pages
import Login from './auth/pages/Login';
import Register from './auth/pages/Register';
import AdminDashboard from './admin/pages/Dashboard';
import TeacherDashboard from './teacher/pages/Dashboard';
import StudentDashboard from './student/pages/Dashboard';
import ProtectedRoute from './shared/components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route
          path="/admin/*"
          element={<ProtectedRoute element={<AdminDashboard />} role="admin" />}
        />

        {/* Teacher */}
        <Route
          path="/teacher/*"
          element={<ProtectedRoute element={<TeacherDashboard />} role="teacher" />}
        />

        {/* Student */}
        <Route
          path="/student/*"
          element={<ProtectedRoute element={<StudentDashboard />} role="student" />}
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
export default App;
