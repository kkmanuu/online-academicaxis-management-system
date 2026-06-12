import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import axios from "axios";
import CourseEnrollment from "./CourseEnrollment";
import StudentProfile from "../components/StudentProfile";
import ExamInterface from "./ExamInterface";
import AvailableExams from "./AvailableExams";
import MyResults from "./MyResults";
import { format, parseISO } from "date-fns";

const API_URL = process.env.REACT_APP_API_URL;

const BootstrapLoader = () => {
  useEffect(() => {
    if (!document.getElementById("bs-css")) {
      const link = document.createElement("link");
      link.id = "bs-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("bs-icons")) {
      const link2 = document.createElement("link");
      link2.id = "bs-icons";
      link2.rel = "stylesheet";
      link2.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
      document.head.appendChild(link2);
    }
    if (!document.getElementById("bs-js")) {
      const script = document.createElement("script");
      script.id = "bs-js";
      script.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
      document.body.appendChild(script);
    }
    // Inject portal-wide style overrides
    if (!document.getElementById("portal-style")) {
      const style = document.createElement("style");
      style.id = "portal-style";
      style.textContent = `
        :root {
          --portal-primary: #2563eb;
          --portal-primary-dark: #1d4ed8;
          --portal-sidebar-bg: #0f172a;
          --portal-sidebar-text: #94a3b8;
          --portal-sidebar-active: #2563eb;
          --portal-bg: #f1f5f9;
          --portal-card-shadow: 0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.05);
          --portal-radius: .75rem;
        }
        body { background: var(--portal-bg) !important; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .portal-sidebar {
          background: var(--portal-sidebar-bg) !important;
          width: 260px;
          min-height: 100vh;
          position: fixed;
          top: 0; left: 0;
          z-index: 1045;
          overflow-y: auto;
          transition: transform .25s ease;
          display: flex;
          flex-direction: column;
        }
        .portal-sidebar-hidden { transform: translateX(-100%); }
        .portal-sidebar .brand-logo {
          background: var(--portal-primary);
          width: 36px; height: 36px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .portal-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          color: var(--portal-sidebar-text);
          text-decoration: none;
          font-size: .875rem;
          font-weight: 500;
          transition: background .15s, color .15s;
          margin-bottom: 2px;
        }
        .portal-nav-link:hover { background: rgba(255,255,255,.07); color: #e2e8f0; }
        .portal-nav-link.active { background: var(--portal-primary); color: #fff; }
        .portal-nav-link .nav-icon { font-size: 1.1rem; flex-shrink: 0; }
        .portal-section-label {
          color: #475569;
          font-size: .65rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          padding: 0 14px;
          margin: 8px 0 4px;
        }
        .portal-topbar {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          height: 64px;
          position: sticky;
          top: 0;
          z-index: 1030;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
        }
        .portal-main { margin-left: 260px; min-height: 100vh; }
        @media (max-width: 991px) {
          .portal-main { margin-left: 0; }
          .portal-sidebar { transform: translateX(-100%); }
          .portal-sidebar.show { transform: translateX(0); }
        }
        .stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: var(--portal-radius);
          padding: 1.25rem 1.5rem;
          box-shadow: var(--portal-card-shadow);
          transition: transform .2s, box-shadow .2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 24px rgba(0,0,0,.1); }
        .stat-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .portal-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: var(--portal-radius);
          box-shadow: var(--portal-card-shadow);
        }
        .portal-card-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; gap: 10px;
        }
        .portal-table thead th {
          background: #f8fafc;
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #64748b;
          padding: .75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .portal-table tbody td {
          padding: .875rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          font-size: .875rem;
        }
        .portal-table tbody tr:last-child td { border-bottom: none; }
        .portal-table tbody tr:hover td { background: #f8fafc; }
        .portal-badge {
          font-size: .7rem;
          font-weight: 600;
          letter-spacing: .04em;
          padding: .3em .75em;
          border-radius: 50rem;
        }
        .badge-pass { background: #dcfce7; color: #15803d; }
        .badge-fail { background: #fee2e2; color: #b91c1c; }
        .badge-completed { background: #dcfce7; color: #15803d; }
        .badge-in-progress { background: #fef9c3; color: #a16207; }
        .badge-enrolled { background: #dbeafe; color: #1d4ed8; }
        .avatar-circle {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: var(--portal-primary);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          font-size: .95rem;
          flex-shrink: 0;
        }
        .page-header { padding: 1.75rem 1.5rem 0; }
        .page-title { font-size: 1.35rem; font-weight: 700; color: #0f172a; }
        .page-subtitle { font-size: .875rem; color: #64748b; }
        .content-area { padding: 1.5rem; }
        .overlay-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.45);
          z-index: 1044;
        }
        .portal-logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          color: #f87171;
          background: none; border: none;
          font-size: .875rem; font-weight: 500;
          width: 100%;
          cursor: pointer;
          transition: background .15s;
        }
        .portal-logout-btn:hover { background: rgba(248,113,113,.1); }
      `;
      document.head.appendChild(style);
    }
  }, []);
  return null;
};

const navItems = [
  { text: "Dashboard", icon: "bi-speedometer2", to: "/student" },
  { text: "My Profile", icon: "bi-person-circle", to: "/student/profile" },
  { text: "Courses", icon: "bi-journal-bookmark-fill", to: "/student/courses" },
  { text: "Exams", icon: "bi-pencil-square", to: "/student/exams" },
  { text: "My Results", icon: "bi-bar-chart-line-fill", to: "/student/results" },
];

const statConfigs = [
  { key: "enrolledCourses", label: "Enrolled Courses", icon: "bi-book-fill", iconBg: "#dbeafe", iconColor: "#2563eb" },
  { key: "completedExams", label: "Completed Exams", icon: "bi-check2-circle", iconBg: "#dcfce7", iconColor: "#16a34a" },
  { key: "pendingExams", label: "Pending Exams", icon: "bi-clock-history", iconBg: "#fef9c3", iconColor: "#ca8a04" },
  { key: "averageScore", label: "Average Score", icon: "bi-trophy-fill", iconBg: "#f0f9ff", iconColor: "#0284c7" },
];

const StatCard = ({ config, value }) => (
  <div className="col-6 col-xl-3">
    <div className="stat-card d-flex align-items-center gap-3">
      <div className="stat-icon" style={{ background: config.iconBg }}>
        <i className={`bi ${config.icon}`} style={{ color: config.iconColor }}></i>
      </div>
      <div>
        <p className="mb-0" style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b" }}>
          {config.label}
        </p>
        <p className="mb-0" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

const Sidebar = ({ isOpen, onClose, user, logout, isActive }) => (
  <>
    {isOpen && <div className="overlay-backdrop d-lg-none" onClick={onClose} />}
    <aside className={`portal-sidebar ${isOpen ? "show" : ""}`}>
      {/* Brand */}
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <div className="brand-logo">
          <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: "1rem" }}></i>
        </div>
        <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f1f5f9" }}>AcademicAxis</span>
      </div>

      {/* User pill */}
      <div style={{ padding: ".875rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <div className="avatar-circle" style={{ width: 36, height: 36, fontSize: ".85rem", flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase() || "S"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: ".85rem", color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || "Student"}
            </p>
            <p style={{ margin: 0, fontSize: ".7rem", color: "#64748b" }}>Student Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem .875rem" }}>
        <p className="portal-section-label">Navigation</p>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={`portal-nav-link ${isActive(item.to) ? "active" : ""}`}
          >
            <i className={`bi ${item.icon} nav-icon`}></i>
            <span>{item.text}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: ".875rem .875rem 1.25rem", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <button className="portal-logout-btn" onClick={logout}>
          <i className="bi bi-box-arrow-left" style={{ fontSize: "1.1rem" }}></i>
          Sign Out
        </button>
      </div>
    </aside>
  </>
);

const DashboardHome = ({ user, dashboardData }) => (
  <>
    <div className="page-header">
      <h1 className="page-title">
        Welcome back, {user?.name?.split(" ")[0] || "Student"} 👋
      </h1>
      <p className="page-subtitle mb-0">Here's your academic overview for today.</p>
    </div>

    <div className="content-area">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {statConfigs.map((cfg) => (
          <StatCard
            key={cfg.key}
            config={cfg}
            value={
              cfg.key === "averageScore"
                ? dashboardData.stats.averageScore
                  ? `${dashboardData.stats.averageScore.toFixed(1)}%`
                  : "—"
                : dashboardData.stats[cfg.key] ?? 0
            }
          />
        ))}
      </div>

      {/* Enrolled Courses */}
      <div className="portal-card mb-4">
        <div className="portal-card-header">
          <i className="bi bi-journal-bookmark-fill" style={{ color: "#2563eb", fontSize: "1.1rem" }}></i>
          <span style={{ fontWeight: 700, fontSize: ".95rem", color: "#0f172a" }}>Enrolled Courses</span>
        </div>
        {dashboardData.courses?.length > 0 ? (
          <div className="table-responsive">
            <table className="portal-table w-100">
              <thead>
                <tr>
                  <th style={{ paddingLeft: "1.5rem" }}>Course</th>
                  <th>Instructor</th>
                  <th style={{ paddingRight: "1.5rem" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.courses.map((course) => (
                  <tr key={course._id}>
                    <td style={{ paddingLeft: "1.5rem", fontWeight: 600, color: "#0f172a" }}>
                      {course.name || "N/A"}
                    </td>
                    <td style={{ color: "#64748b" }}>{course.teacher || "N/A"}</td>
                    <td style={{ paddingRight: "1.5rem" }}>
                      <span className={`portal-badge ${
                        course.status === "completed" ? "badge-completed"
                        : course.status === "in_progress" ? "badge-in-progress"
                        : "badge-enrolled"
                      }`}>
                        {course.status?.replace("_", " ").toUpperCase() || "ENROLLED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-journal-x" style={{ fontSize: "2.5rem", color: "#cbd5e1", display: "block", marginBottom: "1rem" }}></i>
            <p style={{ color: "#64748b", marginBottom: ".75rem" }}>No enrolled courses yet.</p>
            <Link to="/student/courses" className="btn btn-primary btn-sm rounded-pill px-4">
              Browse Courses
            </Link>
          </div>
        )}
      </div>

      {/* Recent Results */}
      <div className="portal-card">
        <div className="portal-card-header">
          <i className="bi bi-bar-chart-line-fill" style={{ color: "#16a34a", fontSize: "1.1rem" }}></i>
          <span style={{ fontWeight: 700, fontSize: ".95rem", color: "#0f172a" }}>Recent Exam Results</span>
        </div>
        {dashboardData.results?.length > 0 ? (
          <div className="table-responsive">
            <table className="portal-table w-100">
              <thead>
                <tr>
                  <th style={{ paddingLeft: "1.5rem" }}>Exam</th>
                  <th>Course</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th style={{ paddingRight: "1.5rem" }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.results.map((result) => (
                  <tr key={result._id}>
                    <td style={{ paddingLeft: "1.5rem", fontWeight: 600, color: "#0f172a" }}>
                      {result.exam?.title || "N/A"}
                    </td>
                    <td style={{ color: "#64748b" }}>
                      {result.exam?.course?.name || result.course?.name || "N/A"}
                    </td>
                    <td style={{ color: "#64748b" }}>
                      {result.marksObtained || 0} / {result.totalMarks || 0}
                    </td>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>
                      {result.percentage ? result.percentage.toFixed(1) + "%" : "N/A"}
                    </td>
                    <td>
                      <span className={`portal-badge ${result.status === "pass" ? "badge-pass" : "badge-fail"}`}>
                        {result.status ? result.status.charAt(0).toUpperCase() + result.status.slice(1) : "N/A"}
                      </span>
                    </td>
                    <td style={{ color: "#64748b", paddingRight: "1.5rem", fontSize: ".8rem" }}>
                      {result.submittedAt ? format(parseISO(result.submittedAt), "dd MMM yyyy") : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-bar-chart-x" style={{ fontSize: "2.5rem", color: "#cbd5e1", display: "block", marginBottom: "1rem" }}></i>
            <p style={{ color: "#64748b", margin: 0 }}>No results available yet.</p>
          </div>
        )}
      </div>
    </div>
  </>
);

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    stats: { enrolledCourses: 0, completedExams: 0, pendingExams: 0, averageScore: 0 },
    results: [],
    courses: [],
  });
  const { user, logout, getAuthHeader, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      setError("Please log in to view the dashboard.");
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeader();
      const response = await axios.get(`${API_URL}/api/student/dashboard`, { headers });
      setDashboardData({
        stats: response.data.stats || { enrolledCourses: 0, completedExams: 0, pendingExams: 0, averageScore: 0 },
        results: response.data.results || [],
        courses: response.data.courses || [],
      });
      setLoading(false);
    } catch (error) {
      let msg = "Failed to load dashboard data.";
      if (error.response) {
        msg = error.response.data.message || `Error ${error.response.status}`;
        if ([401, 403].includes(error.response.status))
          msg = "Authentication failed. Please log in again.";
      } else if (error.request) {
        msg = "No response from server. Check your connection.";
      }
      setError(msg);
      setLoading(false);
    }
  };

  if (!user || user.role !== "student") return <Navigate to="/login" />;

  if (loading)
    return (
      <>
        <BootstrapLoader />
        <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="text-center">
            <div style={{ width: 48, height: 48, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }}></div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: "#64748b", fontSize: ".875rem", margin: 0 }}>Loading your dashboard…</p>
          </div>
        </div>
      </>
    );

  const isActive = (path) =>
    path === "/student"
      ? location.pathname === "/student"
      : location.pathname.startsWith(path);

  return (
    <>
      <BootstrapLoader />

      <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          logout={logout}
          isActive={isActive}
        />

        <div className="portal-main" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Topbar */}
          <div className="portal-topbar">
            <button
              className="btn btn-sm d-lg-none me-3"
              style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px" }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="bi bi-list" style={{ fontSize: "1.25rem" }}></i>
            </button>
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="d-none d-md-block">
              <ol className="breadcrumb mb-0" style={{ fontSize: ".8rem" }}>
                <li className="breadcrumb-item"><span style={{ color: "#64748b" }}>AcademicAxis</span></li>
                <li className="breadcrumb-item active" style={{ color: "#0f172a", fontWeight: 600 }}>
                  {navItems.find(n => isActive(n.to))?.text || "Dashboard"}
                </li>
              </ol>
            </nav>

            <div className="ms-auto d-flex align-items-center gap-3">
              <span
                style={{
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontSize: ".75rem",
                  fontWeight: 600,
                  padding: "5px 14px",
                  borderRadius: "50rem",
                }}
              >
                <i className="bi bi-mortarboard me-1"></i>Student Portal
              </span>
              <div className="avatar-circle" style={{ width: 34, height: 34, fontSize: ".8rem" }}>
                {user?.name?.charAt(0).toUpperCase() || "S"}
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            {error && (
              <div
                style={{
                  margin: "1rem 1.5rem 0",
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: ".875rem",
                  color: "#b91c1c",
                }}
              >
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span style={{ flex: 1 }}>{error}</span>
                <button style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "1rem" }} onClick={() => setError("")}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            )}

            <Routes>
              <Route path="/" element={<DashboardHome user={user} dashboardData={dashboardData} />} />
              <Route path="/profile" element={<StudentProfile />} />
              <Route path="/exams" element={<AvailableExams />} />
              <Route path="/exams/:examId" element={<ExamInterface />} />
              <Route path="/courses" element={<CourseEnrollment />} />
              <Route path="/results" element={<MyResults />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;