import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!API_URL) {
      setError("API URL is not configured. Please contact the administrator.");
      setLoading(false);
      return;
    }

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      console.log("Login request to:", `${API_URL}/api/auth/login`);
      console.log("Login payload:", { email: formData.email, role: formData.role });
      const result = await login(formData.email, formData.password, formData.role);

      if (result.success) {
        console.log("Login successful, user:", result.user);
        const userRole = result.user.role?.toLowerCase();
        if (userRole === "admin") {
          navigate("/admin/dashboard");
        } else if (userRole === "teacher") {
          navigate("/teacher/dashboard");
        } else if (userRole === "student") {
          navigate("/student/dashboard");
        } else {
          // Invalid role fallback
          setError("Invalid user role assigned. Please contact support.");
        }
      } else {
        console.error("Login failed:", result.error);
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.message || "An error occurred during login.");
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
                <p className="text-muted mb-0">Sign in to access your learning portal</p>
              </div>

              <div className="card-body p-4 p-md-5">
                {(error || authError) && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error || authError}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
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
                      autoFocus
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

                  <div className="mb-4">
                    <label htmlFor="role" className="form-label fw-medium">Login As</label>
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
                      <option value="admin">Admin</option>
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
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-door-open"></i>
                        Sign In
                      </>
                    )}
                  </button>

                  <Link
                    to="/register"
                    className="btn btn-outline-primary btn-lg w-100 rounded-3 fw-semibold"
                  >
                    Don't have an account? Register
                  </Link>
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

export default Login;