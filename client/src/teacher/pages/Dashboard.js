import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import axios from 'axios';
import ExamManagement from './ExamManagement';
import QuestionManagement from './QuestionManagement';
import StudentEnrollment from './StudentEnrollment';
import CourseManagement from './CourseManagement';
import StudentResults from './StudentResults';
import ExamMonitoring from './ExamMonitoring';

const BootstrapLoader = () => {
  useEffect(() => {
    if (!document.getElementById('bs-css')) {
      const link = document.createElement('link');
      link.id = 'bs-css'; link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('bs-icons')) {
      const link2 = document.createElement('link');
      link2.id = 'bs-icons'; link2.rel = 'stylesheet';
      link2.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
      document.head.appendChild(link2);
    }
    if (!document.getElementById('bs-js')) {
      const script = document.createElement('script');
      script.id = 'bs-js';
      script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js';
      document.body.appendChild(script);
    }
    if (!document.getElementById('teacher-portal-style')) {
      const style = document.createElement('style');
      style.id = 'teacher-portal-style';
      style.textContent = `
        :root {
          --teacher-primary: #0369a1;
          --teacher-sidebar-bg: #0c1a2e;
          --teacher-bg: #f0f6ff;
          --teacher-card-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.05);
          --teacher-radius: .75rem;
        }
        body { background: var(--teacher-bg) !important; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .teacher-sidebar {
          background: var(--teacher-sidebar-bg);
          width: 260px; min-height: 100vh;
          position: fixed; top: 0; left: 0; z-index: 1045;
          overflow-y: auto; display: flex; flex-direction: column;
          transition: transform .25s ease;
        }
        .teacher-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 8px;
          color: #7dd3fc; text-decoration: none;
          font-size: .875rem; font-weight: 500;
          transition: background .15s, color .15s; margin-bottom: 2px;
        }
        .teacher-nav-link:hover { background: rgba(255,255,255,.07); color: #e0f2fe; }
        .teacher-nav-link.active { background: var(--teacher-primary); color: #fff; }
        .teacher-section-label {
          color: #4b5e78; font-size: .65rem; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          padding: 0 14px; margin: 10px 0 4px;
        }
        .teacher-topbar {
          background: #fff; border-bottom: 1px solid #e0eaf5;
          height: 64px; position: sticky; top: 0; z-index: 1030;
          display: flex; align-items: center; padding: 0 1.5rem; gap: 12px;
        }
        .teacher-main { margin-left: 260px; min-height: 100vh; }
        @media (max-width: 991px) {
          .teacher-main { margin-left: 0; }
          .teacher-sidebar { transform: translateX(-100%); }
          .teacher-sidebar.show { transform: translateX(0); }
        }
        .teacher-card {
          background: #fff; border: 1px solid #e0eaf5;
          border-radius: var(--teacher-radius);
          box-shadow: var(--teacher-card-shadow);
        }
        .teacher-card-header {
          padding: 1rem 1.5rem; border-bottom: 1px solid #f0f6ff;
          display: flex; align-items: center; gap: 10px;
        }
        .teacher-stat-card {
          background: #fff; border: 1px solid #e0eaf5;
          border-radius: var(--teacher-radius);
          padding: 1.25rem 1.5rem;
          box-shadow: var(--teacher-card-shadow);
          transition: transform .2s, box-shadow .2s;
        }
        .teacher-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(0,0,0,.09); }
        .teacher-logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 8px;
          color: #f87171; background: none; border: none;
          font-size: .875rem; font-weight: 500;
          width: 100%; cursor: pointer; transition: background .15s;
        }
        .teacher-logout-btn:hover { background: rgba(248,113,113,.1); }
        .teacher-topbar-btn {
          background: #f0f6ff; border: 1px solid #e0eaf5;
          border-radius: 8px; padding: 6px 10px; cursor: pointer;
          display: flex; align-items: center; font-size: 1.25rem;
          color: #475569; transition: background .15s;
        }
        .teacher-topbar-btn:hover { background: #dbeafe; }
        .teacher-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--teacher-primary); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: .85rem; flex-shrink: 0;
        }
        .teacher-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.45); z-index: 1044;
        }
        .page-header-teacher { padding: 1.75rem 1.5rem 0; }
        .page-title-teacher { font-size: 1.35rem; font-weight: 700; color: #0c1a2e; margin: 0; }
        .page-subtitle-teacher { font-size: .875rem; color: #5a7a9e; margin: .25rem 0 0; }
        .content-area-teacher { padding: 1.5rem; }
        .teacher-welcome-card {
          background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
          border-radius: var(--teacher-radius); padding: 2.5rem; color: #fff;
          position: relative; overflow: hidden;
        }
        .teacher-welcome-card::after {
          content: ''; position: absolute; right: -40px; top: -40px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,.07);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  return null;
};

const navItems = [
  { text: 'Dashboard', icon: 'bi-speedometer2', to: '/teacher' },
  { text: 'Exam Management', icon: 'bi-pencil-square', to: '/teacher/exams' },
  { text: 'Course Management', icon: 'bi-journal-bookmark-fill', to: '/teacher/courses' },
  { text: 'Student Results', icon: 'bi-bar-chart-line-fill', to: '/teacher/results' },
  { text: 'Exam Monitoring', icon: 'bi-display', to: '/teacher/exams/monitor' },
];

const TeacherDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({ totalCourses: 0, totalExams: 0, totalStudents: 0 });
  const { user, logout, getAuthHeader } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/statistics`, { headers: getAuthHeader() });
        const { totalCourses, totalExams, totalStudents } = response.data;
        setStats({ totalCourses, totalExams, totalStudents });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };
    if (user && user.role === 'teacher') fetchStats();
  }, [getAuthHeader, user]);

  const handleLogout = () => logout();

  const isActive = (path) =>
    path === '/teacher'
      ? location.pathname === '/teacher'
      : location.pathname.startsWith(path);

  const currentPage = navItems.find(n => isActive(n.to))?.text || 'Dashboard';

  if (!user || user.role !== 'teacher') return <Navigate to="/login" />;

  return (
    <>
      <BootstrapLoader />
      {drawerOpen && <div className="teacher-overlay d-lg-none" onClick={() => setDrawerOpen(false)} />}

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f6ff' }}>
        {/* SIDEBAR */}
        <aside className={`teacher-sidebar ${drawerOpen ? 'show' : ''}`}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '1rem' }}></i>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e0f2fe' }}>AcademicAxis</span>
          </div>

          <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="teacher-avatar">{user?.name?.charAt(0).toUpperCase() || 'T'}</div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '.85rem', color: '#e0f2fe', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Teacher'}
                </p>
                <p style={{ margin: 0, fontSize: '.7rem', color: '#4b5e78' }}>Educator</p>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '1rem .875rem' }}>
            <p className="teacher-section-label">Navigation</p>
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setDrawerOpen(false)}
                className={`teacher-nav-link ${isActive(item.to) ? 'active' : ''}`}>
                <i className={`bi ${item.icon}`} style={{ fontSize: '1.1rem', flexShrink: 0 }}></i>
                <span>{item.text}</span>
              </Link>
            ))}
          </nav>

          <div style={{ padding: '.875rem .875rem 1.25rem', borderTop: '1px solid rgba(255,255,255,.05)' }}>
            <button className="teacher-logout-btn" onClick={handleLogout}>
              <i className="bi bi-box-arrow-left" style={{ fontSize: '1.1rem' }}></i>
              Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="teacher-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="teacher-topbar">
            <button className="teacher-topbar-btn d-lg-none" onClick={() => setDrawerOpen(!drawerOpen)}>
              <i className="bi bi-list"></i>
            </button>
            <nav aria-label="breadcrumb" className="d-none d-md-block">
              <ol className="breadcrumb mb-0" style={{ fontSize: '.8rem' }}>
                <li className="breadcrumb-item"><span style={{ color: '#5a7a9e' }}>AcademicAxis</span></li>
                <li className="breadcrumb-item active" style={{ color: '#0c1a2e', fontWeight: 600 }}>{currentPage}</li>
              </ol>
            </nav>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '.75rem', fontWeight: 600, padding: '5px 14px', borderRadius: '50rem' }}>
                <i className="bi bi-book-fill me-1"></i>Teacher Portal
              </span>
              <div className="teacher-avatar">{user?.name?.charAt(0).toUpperCase() || 'T'}</div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<TeacherDashboardHome user={user} stats={stats} />} />
              <Route path="/exams" element={<ExamManagement />} />
              <Route path="/exams/:examId/questions" element={<QuestionManagement />} />
              <Route path="/exams/:examId/students" element={<StudentEnrollment />} />
              <Route path="/courses" element={<CourseManagement />} />
              <Route path="/results" element={<StudentResults />} />
              <Route path="/results/:examId" element={<StudentResults />} />
              <Route path="/exams/:examId/monitor" element={<ExamMonitoring />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

const statConfigs = [
  { key: 'totalCourses', label: 'Total Courses', icon: 'bi-journal-bookmark-fill', bg: '#dbeafe', color: '#1d4ed8' },
  { key: 'totalExams', label: 'Total Exams', icon: 'bi-pencil-square', bg: '#ede9fe', color: '#5b21b6' },
  { key: 'totalStudents', label: 'Total Students', icon: 'bi-people-fill', bg: '#dcfce7', color: '#15803d' },
];

const TeacherDashboardHome = ({ user, stats }) => (
  <>
    <div className="page-header-teacher">
      <h1 className="page-title-teacher">Teacher Dashboard</h1>
      <p className="page-subtitle-teacher">Your teaching overview at a glance.</p>
    </div>
    <div className="content-area-teacher">
      <div className="teacher-welcome-card mb-4">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ margin: '0 0 4px', fontSize: '.78rem', fontWeight: 600, opacity: .75, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Welcome back
          </p>
          <h2 style={{ margin: '0 0 .5rem', fontWeight: 700, fontSize: '1.6rem' }}>
            {user?.name || 'Teacher'} 👋
          </h2>
          <p style={{ margin: 0, opacity: .8, fontSize: '.875rem', maxWidth: 480 }}>
            Manage your exams, courses, and track student performance from one place.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {statConfigs.map((cfg) => (
          <div key={cfg.key} className="col-sm-6 col-lg-4">
            <div className="teacher-stat-card d-flex align-items-center gap-3">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`bi ${cfg.icon}`} style={{ fontSize: '1.25rem', color: cfg.color }}></i>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '.68rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#5a7a9e' }}>{cfg.label}</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0c1a2e', lineHeight: 1.2 }}>{stats[cfg.key] ?? 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0c1a2e', marginBottom: '1rem' }}>Quick Links</h2>
      <div className="row g-3">
        {[
          { label: 'Manage Exams', icon: 'bi-pencil-square', to: '/teacher/exams', bg: '#ede9fe', color: '#5b21b6', desc: 'Create and edit your exams' },
          { label: 'Manage Courses', icon: 'bi-journal-bookmark-fill', to: '/teacher/courses', bg: '#dbeafe', color: '#1d4ed8', desc: 'Organise your course content' },
          { label: 'Student Results', icon: 'bi-bar-chart-line-fill', to: '/teacher/results', bg: '#dcfce7', color: '#15803d', desc: 'Review student performance' },
          { label: 'Exam Monitoring', icon: 'bi-display', to: '/teacher/exams/monitor', bg: '#fef9c3', color: '#a16207', desc: 'Monitor live exam sessions' },
        ].map((ql) => (
          <div key={ql.to} className="col-sm-6 col-xl-3">
            <Link to={ql.to} style={{ textDecoration: 'none' }}>
              <div className="teacher-stat-card d-flex align-items-start gap-3">
                <div style={{ width: 44, height: 44, borderRadius: 10, background: ql.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`bi ${ql.icon}`} style={{ fontSize: '1.15rem', color: ql.color }}></i>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#0c1a2e', fontSize: '.9rem' }}>{ql.label}</p>
                  <p style={{ margin: 0, fontSize: '.75rem', color: '#5a7a9e', marginTop: 2 }}>{ql.desc}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default TeacherDashboard;