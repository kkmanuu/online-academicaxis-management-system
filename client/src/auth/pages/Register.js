import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!API_URL) {
      setError('API URL is not configured. Please contact the administrator.');
      setLoading(false);
      return;
    }

    if (!formData.name || formData.name.length < 2) {
      setError('Name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('Registration request to:', `${API_URL}/api/auth/register`);
      console.log('Request payload:', {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });

      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Invalid response format from server');
      }

      localStorage.setItem('token', token);
      console.log('Registration successful, user:', user);

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
      setError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again or contact support.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5" 
         style={{ 
           background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
           backgroundAttachment: "fixed"
         }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              {/* Header */}
              <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
                <div className="mx-auto mb-3 d-flex justify-content-center">
                  <img
                    src="https://images.unsplash.com/photo-1516321310764-8d9a662d6929?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="EduConnect Dashboard"
                    className="rounded-circle border border-3 border-white shadow"
                    style={{ width: "90px", height: "90px", objectFit: "cover" }}
                  />
                </div>
                <h1 className="h3 fw-bold text-primary mb-1">EduConnect</h1>
                <p className="text-muted mb-0">Register to start your learning journey</p>
              </div>

              <div className="card-body p-4 p-md-5">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-medium">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control form-control-lg rounded-3"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control form-control-lg rounded-3"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control form-control-lg rounded-3"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-medium">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control form-control-lg rounded-3"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="role" className="form-label fw-medium">Role</label>
                    <select
                      id="role"
                      name="role"
                      className="form-select form-select-lg rounded-3"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus"></i>
                        Create Account
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="btn btn-outline-primary btn-lg w-100 rounded-3 fw-semibold"
                    disabled={loading}
                  >
                    Already have an account? Login
                  </button>
                </form>
              </div>

              <div className="card-footer bg-white border-0 text-center py-3">
                <small className="text-muted">© 2026 EduConnect. All rights reserved.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;