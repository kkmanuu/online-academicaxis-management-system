import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import StudentManagement from './StudentManagement';
import ExamResults from './ExamResults';
import UserManagement from './UserManagement';
import SettingsSidebar from '../../shared/components/SettingsSidebar';

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
    if (!document.getElementById('admin-portal-style')) {
      const style = document.createElement('style');
      style.id = 'admin-portal-style';
      style.textContent = `
        :root {
          --admin-primary: #4f46e5;
          --admin-sidebar-bg: #1e1b4b;
          --admin-bg: #f1f5f9;
          --admin-card-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.05);
          --admin-radius: .75rem;
        }
        body { background: var(--admin-bg) !important; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .admin-sidebar {
          background: var(--admin-sidebar-bg);
          width: 260px; min-height: 100vh;
          position: fixed; top: 0; left: 0; z-index: 1045;
          overflow-y: auto; display: flex; flex-direction: column;
          transition: transform .25s ease;
        }
        .admin-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 8px;
          color: #a5b4fc; text-decoration: none;
          font-size: .875rem; font-weight: 500;
          transition: background .15s, color .15s; margin-bottom: 2px;
        }
        .admin-nav-link:hover { background: rgba(255,255,255,.07); color: #e0e7ff; }
        .admin-nav-link.active { background: var(--admin-primary); color: #fff; }
        .admin-section-label {
          color: #6b7280; font-size: .65rem; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          padding: 0 14px; margin: 10px 0 4px;
        }
        .admin-topbar {
          background: #fff; border-bottom: 1px solid #e2e8f0;
          height: 64px; position: sticky; top: 0; z-index: 1030;
          display: flex; align-items: center; padding: 0 1.5rem; gap: 12px;
        }
        .admin-main { margin-left: 260px; min-height: 100vh; }
        @media (max-width: 991px) {
          .admin-main { margin-left: 0; }
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.show { transform: translateX(0); }
        }
        .admin-card {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: var(--admin-radius);
          box-shadow: var(--admin-card-shadow);
        }
        .admin-card-header {
          padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; gap: 10px;
        }
        .admin-stat-card {
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: var(--admin-radius);
          padding: 1.25rem 1.5rem;
          box-shadow: var(--admin-card-shadow);
          transition: transform .2s, box-shadow .2s;
        }
        .admin-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(0,0,0,.09); }
        .admin-logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 8px;
          color: #f87171; background: none; border: none;
          font-size: .875rem; font-weight: 500;
          width: 100%; cursor: pointer; transition: background .15s;
        }
        .admin-logout-btn:hover { background: rgba(248,113,113,.1); }
        .admin-topbar-btn {
          background: #f1f5f9; border: 1px solid #e2e8f0;
          border-radius: 8px; padding: 6px 10px; cursor: pointer;
          display: flex; align-items: center; font-size: 1.25rem;
          color: #475569; transition: background .15s;
        }
        .admin-topbar-btn:hover { background: #e2e8f0; }
        .admin-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--admin-primary); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: .85rem; flex-shrink: 0;
        }
        .admin-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.45); z-index: 1044;
        }
        .page-header-admin { padding: 1.75rem 1.5rem 0; }
        .page-title-admin { font-size: 1.35rem; font-weight: 700; color: #0f172a; margin: 0; }
        .page-subtitle-admin { font-size: .875rem; color: #64748b; margin: .25rem 0 0; }
        .content-area-admin { padding: 1.5rem; }
        .admin-welcome-card {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border-radius: var(--admin-radius); padding: 2.5rem; color: #fff;
          position: relative; overflow: hidden;
        }
        .admin-welcome-card::after {
          content: ''; position: absolute; right: -40px; top: -40px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,.07);
        }
        .admin-welcome-card::before {
          content: ''; position: absolute; right: 60px; bottom: -60px;
          width: 150px; height: 150px; border-radius: 50%;
          background: rgba(255,255,255,.05);
        }
        .admin-table thead th {
          background: #f8fafc; font-size: .7rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase; color: #64748b;
          padding: .75rem 1rem; border-bottom: 1px solid #e2e8f0; white-space: nowrap;
        }
        .admin-table tbody td {
          padding: .875rem 1rem; border-bottom: 1px solid #f1f5f9;
          vertical-align: middle; font-size: .875rem;
        }
        .admin-table tbody tr:last-child td { border-bottom: none; }
        .admin-table tbody tr:hover td { background: #f8fafc; }
        .admin-badge { font-size: .7rem; font-weight: 600; letter-spacing: .04em; padding: .3em .75em; border-radius: 50rem; }
        .badge-active { background: #dcfce7; color: #15803d; }
        .badge-blocked { background: #fee2e2; color: #b91c1c; }
        .badge-pass { background: #dcfce7; color: #15803d; }
        .badge-fail { background: #fee2e2; color: #b91c1c; }
        .admin-search-input {
          border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 9px 14px 9px 40px; font-size: .875rem;
          width: 100%; background: #f8fafc; outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .admin-search-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.1); background: #fff; }
        .admin-search-wrap { position: relative; }
        .admin-search-wrap .search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; font-size: 1rem; pointer-events: none;
        }
        .admin-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.5);
          z-index: 2000; display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .admin-modal-box {
          background: #fff; border-radius: var(--admin-radius);
          box-shadow: 0 20px 60px rgba(0,0,0,.2);
          width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto;
        }
        .admin-modal-header {
          padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }
        .admin-modal-body { padding: 1.5rem; }
        .admin-modal-footer {
          padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9;
          display: flex; justify-content: flex-end;
        }
        .admin-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px; border-radius: 8px; font-size: .8rem;
          font-weight: 600; cursor: pointer; border: none; transition: opacity .15s, transform .1s;
        }
        .admin-btn:active { transform: scale(.98); }
        .admin-btn-primary { background: #4f46e5; color: #fff; }
        .admin-btn-primary:hover { background: #4338ca; }
        .admin-btn-outline { background: #fff; color: #4f46e5; border: 1px solid #4f46e5; }
        .admin-btn-outline:hover { background: #ede9fe; }
        .admin-btn-danger { background: #fee2e2; color: #b91c1c; }
        .admin-btn-danger:hover { background: #fecaca; }
        .admin-btn-success { background: #dcfce7; color: #15803d; }
        .admin-btn-success:hover { background: #bbf7d0; }
        .admin-select {
          border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 9px 14px; font-size: .875rem;
          background: #f8fafc; outline: none;
          transition: border-color .15s;
        }
        .admin-select:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.1); background: #fff; }
      `;
      document.head.appendChild(style);
    }
  }, []);
  return null;
};

const navItems = [
  { text: 'Dashboard', icon: 'bi-speedometer2', to: '/admin' },
  { text: 'User Management', icon: 'bi-people-fill', to: '/admin/users' },
  { text: 'Student Management', icon: 'bi-person-badge-fill', to: '/admin/students' },
  { text: 'Exam Results', icon: 'bi-bar-chart-line-fill', to: '/admin/results' },
];

const quickLinks = [
  { label: 'Manage Users', icon: 'bi-people-fill', to: '/admin/users', bg: '#ede9fe', iconColor: '#7c3aed', desc: 'Add, edit or remove system users' },
  { label: 'Manage Students', icon: 'bi-person-badge-fill', to: '/admin/students', bg: '#dbeafe', iconColor: '#2563eb', desc: 'View and manage student accounts' },
  { label: 'Exam Results', icon: 'bi-bar-chart-line-fill', to: '/admin/results', bg: '#dcfce7', iconColor: '#16a34a', desc: 'Review and export exam results' },
];

const AdminDashboardHome = ({ user }) => (
  <>
    <div className="page-header-admin">
      <h1 className="page-title-admin">Admin Dashboard</h1>
      <p className="page-subtitle-admin">Manage your institution from one central place.</p>
    </div>
    <div className="content-area-admin">
      <div className="admin-welcome-card mb-4">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ margin: '0 0 4px', fontSize: '.78rem', fontWeight: 600, opacity: .75, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Welcome back
          </p>
          <h2 style={{ margin: '0 0 .5rem', fontWeight: 700, fontSize: '1.6rem' }}>
            {user?.name || 'Administrator'} 👋
          </h2>
          <p style={{ margin: 0, opacity: .8, fontSize: '.875rem', maxWidth: 480 }}>
            Use the navigation menu to manage users, students, and exam results across the institution.
          </p>
        </div>
      </div>

      <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '1rem' }}>Quick Access</h2>
      <div className="row g-3">
        {quickLinks.map((ql) => (
          <div key={ql.to} className="col-sm-6 col-lg-4">
            <Link to={ql.to} style={{ textDecoration: 'none' }}>
              <div className="admin-stat-card d-flex align-items-start gap-3">
                <div style={{ width: 48, height: 48, borderRadius: 12, background: ql.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`bi ${ql.icon}`} style={{ fontSize: '1.25rem', color: ql.iconColor }}></i>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '.95rem' }}>{ql.label}</p>
                  <p style={{ margin: 0, fontSize: '.78rem', color: '#64748b', marginTop: 2 }}>{ql.desc}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </>
);

const AdminDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => logout();
  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  const isActive = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path);

  const currentPage = navItems.find(n => isActive(n.to))?.text || 'Dashboard';

  if (!user || user.role?.toLowerCase() !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <BootstrapLoader />

      {drawerOpen && (
        <div className="admin-overlay d-lg-none" onClick={() => setDrawerOpen(false)} />
      )}

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
        {/* SIDEBAR */}
        <aside className={`admin-sidebar ${drawerOpen ? 'show' : ''}`}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '1rem' }}></i>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e0e7ff' }}>AcademicAxis</span>
          </div>

          <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="admin-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '.85rem', color: '#e0e7ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Admin'}
                </p>
                <p style={{ margin: 0, fontSize: '.7rem', color: '#6b7280' }}>Administrator</p>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '1rem .875rem' }}>
            <p className="admin-section-label">Main Menu</p>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
                className={`admin-nav-link ${isActive(item.to) ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: '1.1rem', flexShrink: 0 }}></i>
                <span>{item.text}</span>
              </Link>
            ))}
            <p className="admin-section-label" style={{ marginTop: 16 }}>System</p>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, color: '#a5b4fc', textDecoration: 'none', fontSize: '.875rem', fontWeight: 500, background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
              onClick={() => { setSettingsOpen(true); setDrawerOpen(false); }}
            >
              <i className="bi bi-gear-fill" style={{ fontSize: '1.1rem' }}></i>
              <span>Settings</span>
            </button>
          </nav>

          <div style={{ padding: '.875rem .875rem 1.25rem', borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <button className="admin-logout-btn" onClick={handleLogout}>
              <i className="bi bi-box-arrow-left" style={{ fontSize: '1.1rem' }}></i>
              Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="admin-topbar">
            <button className="admin-topbar-btn d-lg-none" onClick={() => setDrawerOpen(!drawerOpen)}>
              <i className="bi bi-list"></i>
            </button>
            <nav aria-label="breadcrumb" className="d-none d-md-block">
              <ol className="breadcrumb mb-0" style={{ fontSize: '.8rem' }}>
                <li className="breadcrumb-item"><span style={{ color: '#64748b' }}>AcademicAxis</span></li>
                <li className="breadcrumb-item active" style={{ color: '#0f172a', fontWeight: 600 }}>{currentPage}</li>
              </ol>
            </nav>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="admin-topbar-btn" onClick={() => setSettingsOpen(true)} title="Settings">
                <i className="bi bi-gear" style={{ fontSize: '1.1rem' }}></i>
              </button>
              <span style={{ background: '#ede9fe', color: '#5b21b6', fontSize: '.75rem', fontWeight: 600, padding: '5px 14px', borderRadius: '50rem' }}>
                <i className="bi bi-shield-fill-check me-1"></i>Admin
              </span>
              <div className="admin-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<AdminDashboardHome user={user} />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/results" element={<ExamResults />} />
              <Route path="/settings/profile" element={<div className="content-area-admin"><p>Admin Profile Component</p></div>} />
              <Route path="/settings/password" element={<div className="content-area-admin"><p>Change Password Component</p></div>} />
              <Route path="/settings/notifications" element={<div className="content-area-admin"><p>Notifications Component</p></div>} />
            </Routes>
          </div>
        </div>
      </div>

      <SettingsSidebar
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onThemeToggle={handleThemeToggle}
        isDarkMode={isDarkMode}
      />
    </>
  );
};

export default AdminDashboard;