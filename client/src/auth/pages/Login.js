import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const BootstrapLoader = () => {
  useEffect(() => {
    if (!document.getElementById("bs-css")) {
      const link = document.createElement("link");
      link.id = "bs-css"; link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("bs-icons")) {
      const link2 = document.createElement("link");
      link2.id = "bs-icons"; link2.rel = "stylesheet";
      link2.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
      document.head.appendChild(link2);
    }
    if (!document.getElementById("auth-style")) {
      const style = document.createElement("style");
      style.id = "auth-style";
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .auth-root {
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          display: flex; position: relative; overflow: hidden;
        }
        .auth-bg {
          position: fixed; inset: 0; z-index: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #0c1a2e 65%, #0f172a 100%);
        }
        .auth-orb {
          position: fixed; border-radius: 50%;
          filter: blur(90px); opacity: .3; z-index: 0;
          animation: floatOrb 9s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .auth-orb-1 { width: 520px; height: 520px; background: #4f46e5; top: -140px; left: -100px; animation-delay: 0s; }
        .auth-orb-2 { width: 420px; height: 420px; background: #0369a1; bottom: -120px; right: -80px; animation-delay: 2.5s; }
        .auth-orb-3 { width: 280px; height: 280px; background: #7c3aed; top: 45%; left: 45%; animation-delay: 5s; }
        @keyframes floatOrb {
          from { transform: translateY(0) scale(1); }
          to   { transform: translateY(-36px) scale(1.07); }
        }
        .auth-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 52px 52px;
        }
        /* ── LEFT BRAND PANEL ── */
        .auth-brand-panel {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 3rem 2.5rem; position: relative; z-index: 1;
        }
        @media (max-width: 991px) { .auth-brand-panel { display: none !important; } }
        .brand-logo-ring {
          width: 88px; height: 88px; border-radius: 22px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 14px rgba(79,70,229,.13), 0 0 0 28px rgba(79,70,229,.06);
          margin-bottom: 1.75rem;
        }
        .brand-feature {
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 14px; padding: 1rem 1.25rem;
          display: flex; align-items: center; gap: 14px;
          backdrop-filter: blur(10px);
          transition: background .2s;
        }
        .brand-feature:hover { background: rgba(255,255,255,.09); }
        .brand-feature-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: rgba(255,255,255,.07);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .brand-stat-pill {
          flex: 1; background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 14px; padding: 1.1rem 1rem;
          text-align: center; backdrop-filter: blur(10px);
          transition: background .2s;
        }
        .brand-stat-pill:hover { background: rgba(255,255,255,.09); }
        /* ── RIGHT FORM PANEL ── */
        .auth-form-panel {
          width: 100%; max-width: 460px;
          display: flex; flex-direction: column; justify-content: center;
          padding: 2.5rem 2rem; position: relative; z-index: 1;
          background: rgba(13,19,33,.65); backdrop-filter: blur(28px);
          border-left: 1px solid rgba(255,255,255,.06);
          overflow-y: auto;
        }
        @media (max-width: 991px) {
          .auth-form-panel {
            max-width: 100%; border-left: none;
            background: rgba(13,19,33,.8);
          }
        }
        .auth-form-inner { width: 100%; max-width: 360px; margin: 0 auto; }
        /* ── CARD ── */
        .auth-card {
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 20px; padding: 1.75rem;
          backdrop-filter: blur(6px);
        }
        /* ── INPUTS ── */
        .auth-field-group { margin-bottom: 1rem; }
        .auth-label {
          display: block; font-size: .72rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          color: #94a3b8; margin-bottom: 5px;
        }
        .auth-input-wrap { position: relative; }
        .auth-input-wrap .input-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          color: #475569; font-size: .95rem; pointer-events: none;
          transition: color .15s;
        }
        .auth-input-wrap:focus-within .input-icon { color: #818cf8; }
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 10px; padding: 11px 14px 11px 40px;
          font-size: .875rem; color: #f1f5f9; outline: none;
          transition: border-color .15s, background .15s, box-shadow .15s;
          font-family: inherit;
        }
        .auth-input::placeholder { color: #4b5563; }
        .auth-input:focus {
          border-color: #4f46e5;
          background: rgba(79,70,229,.1);
          box-shadow: 0 0 0 3px rgba(79,70,229,.18);
          color: #f1f5f9;
        }
        .auth-input:disabled { opacity: .45; cursor: not-allowed; }
        .auth-input-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #475569;
          cursor: pointer; padding: 0; line-height: 1; transition: color .15s;
        }
        .auth-input-eye:hover { color: #818cf8; }
        /* ── ROLE PILLS ── */
        .role-pills { display: flex; gap: 7px; }
        .role-pill {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 9px 10px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.045);
          cursor: pointer; font-size: .8rem; font-weight: 600;
          color: #94a3b8; transition: background .15s, border-color .15s, color .15s;
          font-family: inherit;
        }
        .role-pill.selected {
          border-color: #4f46e5; background: rgba(79,70,229,.18); color: #a5b4fc;
        }
        .role-pill:hover:not(.selected):not(:disabled) { background: rgba(255,255,255,.08); color: #cbd5e1; }
        .role-pill:disabled { opacity: .45; cursor: not-allowed; }
        /* ── BUTTONS ── */
        .auth-btn-primary {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border: none; border-radius: 10px;
          font-size: .9rem; font-weight: 600; color: #fff;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 18px rgba(79,70,229,.35);
          transition: opacity .15s, transform .1s, box-shadow .15s;
          position: relative; overflow: hidden;
        }
        .auth-btn-primary::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(rgba(255,255,255,.08), transparent);
          pointer-events: none;
        }
        .auth-btn-primary:hover:not(:disabled) {
          opacity: .9; transform: translateY(-1px);
          box-shadow: 0 6px 26px rgba(79,70,229,.45);
        }
        .auth-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .auth-btn-primary:disabled { opacity: .55; cursor: not-allowed; }
        .auth-btn-outline {
          width: 100%; padding: 11px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.13); border-radius: 10px;
          font-size: .875rem; font-weight: 500; color: #94a3b8;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer; font-family: inherit; text-decoration: none;
          transition: background .15s, border-color .15s, color .15s;
        }
        .auth-btn-outline:hover:not(:disabled) {
          background: rgba(255,255,255,.08);
          border-color: rgba(255,255,255,.22); color: #e2e8f0;
        }
        .auth-btn-outline:disabled { opacity: .45; pointer-events: none; }
        /* ── ALERT ── */
        .auth-alert {
          background: rgba(239,68,68,.11);
          border: 1px solid rgba(239,68,68,.28);
          border-radius: 10px; padding: 10px 13px;
          display: flex; align-items: flex-start; gap: 9px;
          font-size: .83rem; color: #fca5a5; margin-bottom: 1.25rem;
        }
        /* ── SPINNER ── */
        .spin-sm {
          width: 17px; height: 17px; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,.28); border-top-color: #fff;
          border-radius: 50%; animation: spin .75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        /* ── FOOTER ── */
        .auth-footer {
          text-align: center; color: #334155;
          font-size: .72rem; margin-top: 1.5rem;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  return null;
};

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
      <BootstrapLoader />
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