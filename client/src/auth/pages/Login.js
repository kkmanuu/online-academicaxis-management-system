import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const roleConfig = [
    { value: "student", icon: "bi-mortarboard-fill", label: "Student" },
    { value: "teacher", icon: "bi-person-workspace", label: "Teacher" },
    { value: "admin", icon: "bi-shield-fill-check", label: "Admin" },
  ];

  const features = [
    { icon: "bi-book-fill", color: "#818cf8", label: "Access your courses & exams", sub: "All learning materials in one place" },
    { icon: "bi-bar-chart-line-fill", color: "#34d399", label: "Track academic progress", sub: "Real-time results and analytics" },
    { icon: "bi-people-fill", color: "#60a5fa", label: "Collaborate with peers", sub: "Connect with teachers and students" },
  ];

  return (
    <>
      <div className="auth-root">
        {/* Background layers */}
        <div className="auth-bg"></div>
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
        <div className="auth-grid"></div>

        {/* ── BRAND PANEL (desktop only) ── */}
        <div className="auth-brand-panel">
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div className="brand-logo-ring">
              <i className="bi bi-mortarboard-fill" style={{ fontSize: "2.25rem", color: "#fff" }}></i>
            </div>
            <h1 style={{ fontWeight: 800, fontSize: "2.2rem", color: "#f1f5f9", margin: "0 0 .6rem", lineHeight: 1.15 }}>
              AcademicAxis
            </h1>
            <p style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.75, margin: "0 0 2rem" }}>
              Your all-in-one learning management platform for students, teachers, and administrators.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "2rem" }}>
              {features.map((f) => (
                <div key={f.label} className="brand-feature">
                  <div className="brand-feature-icon">
                    <i className={`bi ${f.icon}`} style={{ fontSize: "1.15rem", color: f.color }}></i>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: "#e2e8f0", fontSize: ".875rem" }}>{f.label}</p>
                    <p style={{ margin: 0, color: "#475569", fontSize: ".75rem" }}>{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {[{ n: "10K+", l: "Students" }, { n: "500+", l: "Courses" }, { n: "98%", l: "Pass Rate" }].map((s) => (
                <div key={s.l} className="brand-stat-pill">
                  <p style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#818cf8" }}>{s.n}</p>
                  <p style={{ margin: 0, fontSize: ".72rem", color: "#475569", fontWeight: 500 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FORM PANEL ── */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            {/* Mobile logo */}
            <div className="d-lg-none text-center" style={{ marginBottom: "1.75rem" }}>
              <div style={{ width: 60, height: 60, borderRadius: 15, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto .875rem" }}>
                <i className="bi bi-mortarboard-fill" style={{ fontSize: "1.6rem", color: "#fff" }}></i>
              </div>
              <h2 style={{ fontWeight: 800, color: "#f1f5f9", fontSize: "1.4rem", margin: 0 }}>AcademicAxis</h2>
              <p style={{ color: "#475569", fontSize: ".8rem", margin: ".2rem 0 0" }}>Your learning management platform</p>
            </div>

            <div className="auth-card">
              <h2 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#f1f5f9", margin: "0 0 .2rem" }}>Welcome back</h2>
              <p style={{ color: "#475569", fontSize: ".83rem", margin: "0 0 1.4rem" }}>Sign in to access your dashboard</p>

              {/* Error */}
              {(error || authError) && (
                <div className="auth-alert">
                  <i className="bi bi-exclamation-triangle-fill" style={{ flexShrink: 0, marginTop: 1 }}></i>
                  <span>{error || authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Role pills */}
                <div className="auth-field-group">
                  <label className="auth-label">Sign in as</label>
                  <div className="role-pills">
                    {roleConfig.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        className={`role-pill ${formData.role === r.value ? "selected" : ""}`}
                        onClick={() => !loading && setFormData({ ...formData, role: r.value })}
                        disabled={loading}
                      >
                        <i className={`bi ${r.icon}`}></i>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="email">Email address</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-envelope-fill input-icon"></i>
                    <input
                      className="auth-input"
                      type="email" id="email" name="email"
                      autoComplete="email" autoFocus
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-field-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="auth-label" htmlFor="password">Password</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-lock-fill input-icon"></i>
                    <input
                      className="auth-input"
                      type={showPassword ? "text" : "password"}
                      id="password" name="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      style={{ paddingRight: 40 }}
                    />
                    <button type="button" className="auth-input-eye" onClick={() => setShowPassword(!showPassword)}>
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} style={{ fontSize: ".95rem" }}></i>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginBottom: 10 }}>
                  {loading
                    ? <><div className="spin-sm"></div> Signing in…</>
                    : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>
                  }
                </button>

                {/* Register link */}
                <Link
                  to="/register"
                  className="auth-btn-outline"
                  style={{ pointerEvents: loading ? "none" : "auto", opacity: loading ? .45 : 1 }}
                >
                  <i className="bi bi-person-plus"></i>
                  Don't have an account? Register
                </Link>
              </form>
            </div>

            <p className="auth-footer">© 2025 AcademicAxis. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;