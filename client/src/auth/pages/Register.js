import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      console.log('Request payload:', { name: formData.name, email: formData.email, role: formData.role });

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

  // Password strength
  const getPwStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak',   color: '#ef4444', pct: '20%' };
    if (score <= 2) return { label: 'Fair',   color: '#f59e0b', pct: '50%' };
    if (score <= 3) return { label: 'Good',   color: '#3b82f6', pct: '75%' };
    return              { label: 'Strong', color: '#22c55e', pct: '100%' };
  };
  const strength = getPwStrength(formData.password);
  const pwMatch    = formData.confirmPassword && formData.password === formData.confirmPassword;
  const pwMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  const roleConfig = [
    { value: 'student', icon: 'bi-mortarboard-fill', label: 'Student' },
    { value: 'teacher', icon: 'bi-person-workspace',  label: 'Teacher' },
  ];

  const steps = [
    { icon: 'bi-person-plus-fill', color: '#818cf8', label: 'Create your account', sub: 'Fill in your details' },
    { icon: 'bi-journals',          color: '#34d399', label: 'Enrol in courses',    sub: 'Browse and join courses' },
    { icon: 'bi-trophy-fill',       color: '#fbbf24', label: 'Achieve your goals',  sub: 'Track progress & earn certificates' },
  ];

  return (
    <>
      <div className="auth-root">
        <div className="auth-bg"></div>
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
        <div className="auth-grid"></div>

        {/* ── BRAND PANEL ── */}
        <div className="auth-brand-panel">
          <div style={{ width: '100%', maxWidth: 420 }}>
            <div className="brand-logo-ring">
              <i className="bi bi-mortarboard-fill" style={{ fontSize: '2.25rem', color: '#fff' }}></i>
            </div>
            <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#f1f5f9', margin: '0 0 .6rem', lineHeight: 1.15 }}>
              Join AcademicAxis
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.75, margin: '0 0 2rem' }}>
              Create your free account and start your academic journey today.
            </p>

            {/* Step timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: '2rem' }}>
              {steps.map((step, i) => (
                <div key={step.label} style={{ display: 'flex', gap: 14, paddingBottom: i < steps.length - 1 ? '1.25rem' : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`bi ${step.icon}`} style={{ fontSize: '1.1rem', color: step.color }}></i>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,.07)', margin: '5px 0' }}></div>
                    )}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#e2e8f0', fontSize: '.875rem' }}>{step.label}</p>
                    <p style={{ margin: 0, color: '#475569', fontSize: '.75rem' }}>{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ n: '10K+', l: 'Students' }, { n: '500+', l: 'Courses' }, { n: '98%', l: 'Pass Rate' }].map((s) => (
                <div key={s.l} className="brand-stat-pill">
                  <p style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#818cf8' }}>{s.n}</p>
                  <p style={{ margin: 0, fontSize: '.72rem', color: '#475569', fontWeight: 500 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FORM PANEL ── */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            {/* Mobile logo */}
            <div className="d-lg-none text-center" style={{ marginBottom: '1.75rem' }}>
              <div style={{ width: 60, height: 60, borderRadius: 15, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .875rem' }}>
                <i className="bi bi-mortarboard-fill" style={{ fontSize: '1.6rem', color: '#fff' }}></i>
              </div>
              <h2 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.4rem', margin: 0 }}>AcademicAxis</h2>
              <p style={{ color: '#475569', fontSize: '.8rem', margin: '.2rem 0 0' }}>Create your free account</p>
            </div>

            <div className="auth-card">
              <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f1f5f9', margin: '0 0 .2rem' }}>Create account</h2>
              <p style={{ color: '#475569', fontSize: '.83rem', margin: '0 0 1.4rem' }}>Fill in your details to get started</p>

              {error && (
                <div className="auth-alert">
                  <i className="bi bi-exclamation-triangle-fill" style={{ flexShrink: 0, marginTop: 1 }}></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Role */}
                <div className="auth-field-group">
                  <label className="auth-label">I am a</label>
                  <div className="role-pills">
                    {roleConfig.map((r) => (
                      <button key={r.value} type="button"
                        className={`role-pill ${formData.role === r.value ? 'selected' : ''}`}
                        onClick={() => !loading && setFormData({ ...formData, role: r.value })}
                        disabled={loading}>
                        <i className={`bi ${r.icon}`}></i>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="name">Full name</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-person-fill input-icon"></i>
                    <input className="auth-input" type="text" id="name" name="name"
                      autoComplete="name" autoFocus placeholder="Jane Doe"
                      value={formData.name} onChange={handleChange} disabled={loading} />
                  </div>
                </div>

                {/* Email */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="email">Email address</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-envelope-fill input-icon"></i>
                    <input className="auth-input" type="email" id="email" name="email"
                      autoComplete="email" placeholder="you@example.com"
                      value={formData.email} onChange={handleChange} disabled={loading} />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="password">Password</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-lock-fill input-icon"></i>
                    <input className="auth-input"
                      type={showPassword ? 'text' : 'password'}
                      id="password" name="password" autoComplete="new-password"
                      placeholder="Min. 6 characters"
                      value={formData.password} onChange={handleChange}
                      disabled={loading} style={{ paddingRight: 40 }} />
                    <button type="button" className="auth-input-eye" onClick={() => setShowPassword(!showPassword)}>
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '.95rem' }}></i>
                    </button>
                  </div>
                  {strength && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <div className="pw-bar-wrap" style={{ flex: 1 }}>
                        <div className="pw-bar" style={{ width: strength.pct, background: strength.color }}></div>
                      </div>
                      <span style={{ fontSize: '.7rem', fontWeight: 700, color: strength.color, whiteSpace: 'nowrap' }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="auth-field-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="auth-label" htmlFor="confirmPassword">Confirm password</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-shield-lock-fill input-icon"></i>
                    <input className="auth-input"
                      type={showConfirm ? 'text' : 'password'}
                      id="confirmPassword" name="confirmPassword" autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={formData.confirmPassword} onChange={handleChange}
                      disabled={loading}
                      style={{ paddingRight: 40, borderColor: pwMismatch ? '#ef4444' : pwMatch ? '#22c55e' : undefined }} />
                    <button type="button" className="auth-input-eye" onClick={() => setShowConfirm(!showConfirm)}>
                      <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '.95rem' }}></i>
                    </button>
                  </div>
                  {pwMismatch && (
                    <p className="field-hint" style={{ color: '#f87171' }}>
                      <i className="bi bi-x-circle-fill"></i>Passwords do not match
                    </p>
                  )}
                  {pwMatch && (
                    <p className="field-hint" style={{ color: '#4ade80' }}>
                      <i className="bi bi-check-circle-fill"></i>Passwords match
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginBottom: 10 }}>
                  {loading
                    ? <><div className="spin-sm"></div> Creating account…</>
                    : <><i className="bi bi-person-check-fill"></i> Register</>
                  }
                </button>

                {/* Login link — uses navigate as in original */}
                <button
                  type="button"
                  className="auth-btn-outline"
                  onClick={() => navigate('/login')}
                  disabled={loading}
                >
                  <i className="bi bi-box-arrow-in-right"></i>
                  Already have an account? Login
                </button>
              </form>
            </div>

            <p className="auth-footer">© 2025 AcademicAxis. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;