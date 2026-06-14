import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";

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
        .auth-root {
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          position: relative;
          overflow: hidden;
        }
        /* Animated gradient background */
        .auth-bg {
          position: fixed; inset: 0; z-index: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0c1a2e 70%, #0f172a 100%);
        }
        /* Floating orbs */
        .auth-orb {
          position: fixed; border-radius: 50%;
          filter: blur(80px); opacity: .35; z-index: 0;
          animation: floatOrb 8s ease-in-out infinite alternate;
        }
        .auth-orb-1 { width: 500px; height: 500px; background: #4f46e5; top: -120px; left: -80px; animation-delay: 0s; }
        .auth-orb-2 { width: 400px; height: 400px; background: #0369a1; bottom: -100px; right: -60px; animation-delay: 2s; }
        .auth-orb-3 { width: 300px; height: 300px; background: #7c3aed; top: 40%; left: 50%; animation-delay: 4s; }
        @keyframes floatOrb {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-30px) scale(1.06); }
        }
        /* Grid pattern overlay */
        .auth-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        /* Left brand panel */
        .auth-brand-panel {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 3rem 2rem;
          position: relative; z-index: 1;
        }
        @media (max-width: 991px) { .auth-brand-panel { display: none; } }
        .brand-logo-ring {
          width: 96px; height: 96px;
          border-radius: 24px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 12px rgba(79,70,229,.15), 0 0 0 24px rgba(79,70,229,.07);
          margin-bottom: 2rem;
        }
        .brand-stat {
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          text-align: center;
          backdrop-filter: blur(12px);
          transition: background .2s;
        }
        .brand-stat:hover { background: rgba(255,255,255,.1); }
        /* Right form panel */
        .auth-form-panel {
          width: 100%; max-width: 480px;
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 2rem 1.5rem;
          position: relative; z-index: 1;
          background: rgba(15,23,42,.6);
          backdrop-filter: blur(24px);
          border-left: 1px solid rgba(255,255,255,.07);
        }
        @media (max-width: 991px) {
          .auth-form-panel {
            max-width: 100%;
            background: rgba(15,23,42,.75);
            border-left: none;
          }
        }
        .auth-form-inner {
          width: 100%; max-width: 380px;
          margin: 0 auto;
        }
        .auth-card {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(8px);
        }
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 10px;
          padding: 11px 14px 11px 42px;
          font-size: .9rem;
          color: #f1f5f9;
          outline: none;
          transition: border-color .15s, background .15s, box-shadow .15s;
          font-family: inherit;
        }
        .auth-input::placeholder { color: #64748b; }
        .auth-input:focus {
          border-color: #4f46e5;
          background: rgba(79,70,229,.1);
          box-shadow: 0 0 0 3px rgba(79,70,229,.2);
          color: #f1f5f9;
        }
        .auth-input:disabled { opacity: .5; cursor: not-allowed; }
        .auth-input-wrap { position: relative; }
        .auth-input-wrap .input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #475569; font-size: 1rem; pointer-events: none;
          transition: color .15s;
        }
        .auth-input-wrap:focus-within .input-icon { color: #818cf8; }
        .auth-label {
          display: block;
          font-size: .75rem; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          color: #94a3b8; margin-bottom: 6px;
        }
        .auth-select {
          width: 100%;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 10px;
          padding: 11px 14px 11px 42px;
          font-size: .9rem;
          color: #f1f5f9;
          outline: none;
          transition: border-color .15s, background .15s;
          font-family: inherit;
          appearance: none;
          cursor: pointer;
        }
        .auth-select option { background: #1e1b4b; color: #f1f5f9; }
        .auth-select:focus {
          border-color: #4f46e5;
          background: rgba(79,70,229,.1);
          box-shadow: 0 0 0 3px rgba(79,70,229,.2);
        }
        .auth-select:disabled { opacity: .5; cursor: not-allowed; }
        .auth-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border: none; border-radius: 10px;
          padding: 12px;
          font-size: .95rem; font-weight: 600;
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity .15s, transform .1s, box-shadow .15s;
          box-shadow: 0 4px 16px rgba(79,70,229,.35);
          font-family: inherit;
          position: relative; overflow: hidden;
        }
        .auth-btn-primary::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(rgba(255,255,255,.1), transparent);
        }
        .auth-btn-primary:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(79,70,229,.45); }
        .auth-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .auth-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .auth-btn-outline {
          width: 100%;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 10px;
          padding: 12px;
          font-size: .9rem; font-weight: 500;
          color: #cbd5e1; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background .15s, border-color .15s, color .15s;
          font-family: inherit; text-decoration: none;
        }
        .auth-btn-outline:hover:not(:disabled) { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.25); color: #fff; }
        .auth-btn-outline:disabled { opacity: .5; cursor: not-allowed; }
        .auth-error {
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.3);
          border-radius: 10px;
          padding: 10px 14px;
          display: flex; align-items: flex-start; gap: 8px;
          font-size: .85rem; color: #fca5a5;
          margin-bottom: 1.25rem;
        }
        .auth-divider {
          height: 1px;
          background: rgba(255,255,255,.08);
          margin: 1.25rem 0;
          position: relative;
        }
        .auth-divider span {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: transparent;
          padding: 0 .75rem;
          font-size: .75rem; color: #475569;
          white-space: nowrap;
        }
        .role-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.05);
          cursor: pointer; flex: 1;
          transition: background .15s, border-color .15s;
          font-size: .82rem; font-weight: 600; color: #94a3b8;
        }
        .role-pill.selected {
          border-color: #4f46e5;
          background: rgba(79,70,229,.2);
          color: #818cf8;
        }
        .role-pill:hover:not(.selected) { background: rgba(255,255,255,.08); }
        .spin-anim {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
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

  const handleRoleSelect = (role) => {
    if (!loading) setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }
    try {
      console.log("Submitting login form with email:", formData.email, "and role:", formData.role);
      const result = await login(formData.email, formData.password, formData.role);
      if (result.success) {
        console.log("Login successful, redirecting to dashboard");
        const userRole = result.user.role?.toLowerCase();
        if (userRole === "admin") navigate("/admin/dashboard");
        else if (userRole === "teacher") navigate("/teacher/dashboard");
        else if (userRole === "student") navigate("/student/dashboard");
        else setError("Invalid user role. Please contact support.");
      } else {
        console.error("Login failed:", result.error);
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
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

  return (
    <>
      <BootstrapLoader />
      <div className="auth-root">
        <div className="auth-bg"></div>
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
        <div className="auth-grid"></div>

        {/* Brand panel */}
        <div className="auth-brand-panel">
          <div className="auth-form-inner" style={{ maxWidth: 440 }}>
            <div className="brand-logo-ring">
              <i className="bi bi-mortarboard-fill" style={{ fontSize: "2.5rem", color: "#fff" }}></i>
            </div>
            <h1 style={{ fontWeight: 800, fontSize: "2.4rem", color: "#f1f5f9", marginBottom: ".75rem", lineHeight: 1.15 }}>
              AcademicAxis
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
              Your all-in-one learning management platform for students, teachers, and administrators.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "bi-book-fill", color: "#818cf8", label: "Access your courses & exams", sub: "All learning materials in one place" },
                { icon: "bi-bar-chart-line-fill", color: "#34d399", label: "Track your academic progress", sub: "Real-time results and analytics" },
                { icon: "bi-people-fill", color: "#60a5fa", label: "Collaborate with your peers", sub: "Connect with teachers and students" },
              ].map((feat) => (
                <div key={feat.label} className="brand-stat" style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`bi ${feat.icon}`} style={{ fontSize: "1.25rem", color: feat.color }}></i>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: "#e2e8f0", fontSize: ".9rem" }}>{feat.label}</p>
                    <p style={{ margin: 0, color: "#64748b", fontSize: ".78rem" }}>{feat.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: "2.5rem" }}>
              {[{ n: "10K+", l: "Students" }, { n: "500+", l: "Courses" }, { n: "98%", l: "Pass Rate" }].map(s => (
                <div key={s.l} className="brand-stat" style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#818cf8" }}>{s.n}</p>
                  <p style={{ margin: 0, fontSize: ".75rem", color: "#64748b" }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            {/* Logo (mobile only) */}
            <div className="d-lg-none text-center mb-4">
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <i className="bi bi-mortarboard-fill" style={{ fontSize: "1.75rem", color: "#fff" }}></i>
              </div>
              <h2 style={{ fontWeight: 800, color: "#f1f5f9", fontSize: "1.5rem", margin: 0 }}>AcademicAxis</h2>
              <p style={{ color: "#64748b", fontSize: ".85rem", margin: ".25rem 0 0" }}>Your learning management platform</p>
            </div>

            {/* Card */}
            <div className="auth-card">
              <h2 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#f1f5f9", margin: "0 0 .25rem" }}>
                Welcome back
              </h2>
              <p style={{ color: "#64748b", fontSize: ".85rem", margin: "0 0 1.5rem" }}>
                Sign in to access your dashboard
              </p>

              {(error || authError) && (
                <div className="auth-error">
                  <i className="bi bi-exclamation-triangle-fill" style={{ flexShrink: 0, marginTop: 1 }}></i>
                  <span>{error || authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Role selector */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="auth-label">Sign in as</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {roleConfig.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        className={`role-pill ${formData.role === r.value ? "selected" : ""}`}
                        onClick={() => handleRoleSelect(r.value)}
                        disabled={loading}
                      >
                        <i className={`bi ${r.icon}`} style={{ fontSize: "1rem" }}></i>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: "1rem" }}>
                  <label className="auth-label" htmlFor="email">Email address</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-envelope-fill input-icon"></i>
                    <input
                      className="auth-input"
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="auth-label" htmlFor="password">Password</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-lock-fill input-icon"></i>
                    <input
                      className="auth-input"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", padding: 0 }}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} style={{ fontSize: "1rem" }}></i>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginBottom: 12 }}>
                  {loading ? (
                    <><div className="spin-anim"></div> Signing in…</>
                  ) : (
                    <><i className="bi bi-box-arrow-in-right"></i> Sign In</>
                  )}
                </button>

                <Link to="/register" className="auth-btn-outline" style={{ pointerEvents: loading ? "none" : "auto" }}>
                  <i className="bi bi-person-plus"></i>
                  Don't have an account? Register
                </Link>
              </form>
            </div>

            <p style={{ textAlign: "center", color: "#334155", fontSize: ".75rem", marginTop: "1.5rem" }}>
              © 2025 AcademicAxis. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;