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

// Inline Bootstrap CDN injection (if not already in index.html)
const BootstrapLoader = () => {
  useEffect(() => {
    if (!document.getElementById("bs-css")) {
      const link = document.createElement("link");
      link.id = "bs-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("bs-icons")) {
      const link2 = document.createElement("link");
      link2.id = "bs-icons";
      link2.rel = "stylesheet";
      link2.href =
        "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
      document.head.appendChild(link2);
    }
    if (!document.getElementById("bs-js")) {
      const script = document.createElement("script");
      script.id = "bs-js";
      script.src =
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
      document.body.appendChild(script);
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

const StatCard = ({ icon, label, value, colorClass, bgClass }) => (
  <div className="col-sm-6 col-xl-3">
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3 p-4">
        <div
          className={`d-flex align-items-center justify-content-center rounded-3 ${bgClass}`}
          style={{ width: 56, height: 56, flexShrink: 0 }}
        >
          <i className={`bi ${icon} fs-4 ${colorClass}`}></i>
        </div>
        <div>
          <p className="text-muted small mb-1 fw-semibold text-uppercase ls-1">
            {label}
          </p>
          <h4 className="fw-bold mb-0 text-dark">{value}</h4>
        </div>
      </div>
    </div>
  </div>
);

const SidebarLink = ({ item, isActive, onClick }) => (
  <li className="nav-item mb-1">
    <Link
      to={item.to}
      onClick={onClick}
      className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 fw-medium ${
        isActive
          ? "active text-white"
          : "text-secondary"
      }`}
      style={
        isActive
          ? { background: "linear-gradient(90deg,#4f46e5,#6366f1)" }
          : {}
      }
    >
      <i className={`bi ${item.icon} fs-5`}></i>
      <span>{item.text}</span>
    </Link>
  </li>
);

const DashboardHome = ({ user, dashboardData }) => (
  <div className="p-3 p-md-4">
    {/* Page header */}
    <div className="mb-4">
      <h4 className="fw-bold text-dark mb-1">
        Welcome back, {user?.name?.split(" ")[0] || "Student"} 👋
      </h4>
      <p className="text-muted mb-0 small">
        Here's what's happening with your academics today.
      </p>
    </div>

    {/* Stats */}
    <div className="row g-3 mb-4">
      <StatCard
        icon="bi-book-fill"
        label="Enrolled Courses"
        value={dashboardData.stats.enrolledCourses || 0}
        colorClass="text-primary"
        bgClass="bg-primary bg-opacity-10"
      />
      <StatCard
        icon="bi-check2-circle"
        label="Completed Exams"
        value={dashboardData.stats.completedExams || 0}
        colorClass="text-success"
        bgClass="bg-success bg-opacity-10"
      />
      <StatCard
        icon="bi-clock-history"
        label="Pending Exams"
        value={dashboardData.stats.pendingExams || 0}
        colorClass="text-warning"
        bgClass="bg-warning bg-opacity-10"
      />
      <StatCard
        icon="bi-trophy-fill"
        label="Average Score"
        value={
          dashboardData.stats.averageScore
            ? `${dashboardData.stats.averageScore.toFixed(1)}%`
            : "N/A"
        }
        colorClass="text-info"
        bgClass="bg-info bg-opacity-10"
      />
    </div>

    {/* Enrolled Courses Table */}
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center gap-2">
        <i className="bi bi-journal-bookmark-fill text-primary"></i>
        <h6 className="mb-0 fw-bold text-dark">Enrolled Courses</h6>
      </div>
      <div className="card-body p-0">
        {dashboardData.courses?.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 text-muted small text-uppercase fw-semibold">
                    Course Name
                  </th>
                  <th className="text-muted small text-uppercase fw-semibold">
                    Teacher
                  </th>
                  <th className="text-muted small text-uppercase fw-semibold pe-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.courses.map((course) => (
                  <tr key={course._id}>
                    <td className="ps-4 fw-medium text-dark">
                      {course.name || "N/A"}
                    </td>
                    <td className="text-muted">{course.teacher || "N/A"}</td>
                    <td className="pe-4">
                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          course.status === "completed"
                            ? "bg-success bg-opacity-10 text-success"
                            : course.status === "in_progress"
                            ? "bg-warning bg-opacity-10 text-warning"
                            : "bg-secondary bg-opacity-10 text-secondary"
                        }`}
                      >
                        {course.status?.replace("_", " ").toUpperCase() ||
                          "ENROLLED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-journal-x fs-1 text-muted opacity-50 d-block mb-2"></i>
            <p className="text-muted mb-0">No enrolled courses yet.</p>
            <Link
              to="/student/courses"
              className="btn btn-sm btn-primary mt-3 rounded-pill px-4"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>

    {/* Recent Results Table */}
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center gap-2">
        <i className="bi bi-bar-chart-line-fill text-success"></i>
        <h6 className="mb-0 fw-bold text-dark">Recent Exam Results</h6>
      </div>
      <div className="card-body p-0">
        {dashboardData.results?.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 text-muted small text-uppercase fw-semibold">
                    Exam
                  </th>
                  <th className="text-muted small text-uppercase fw-semibold">
                    Course
                  </th>
                  <th className="text-muted small text-uppercase fw-semibold">
                    Score
                  </th>
                  <th className="text-muted small text-uppercase fw-semibold">
                    %
                  </th>
                  <th className="text-muted small text-uppercase fw-semibold">
                    Status
                  </th>
                  <th className="text-muted small text-uppercase fw-semibold pe-4">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.results.map((result) => (
                  <tr key={result._id}>
                    <td className="ps-4 fw-medium text-dark">
                      {result.exam?.title || "N/A"}
                    </td>
                    <td className="text-muted">
                      {result.exam?.course?.name ||
                        result.course?.name ||
                        "N/A"}
                    </td>
                    <td className="text-muted">
                      {result.marksObtained || 0} / {result.totalMarks || 0}
                    </td>
                    <td className="fw-semibold">
                      {result.percentage
                        ? result.percentage.toFixed(1) + "%"
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          result.status === "pass"
                            ? "bg-success bg-opacity-10 text-success"
                            : "bg-danger bg-opacity-10 text-danger"
                        }`}
                      >
                        {result.status
                          ? result.status.charAt(0).toUpperCase() +
                            result.status.slice(1)
                          : "N/A"}
                      </span>
                    </td>
                    <td className="text-muted pe-4 small">
                      {result.submittedAt
                        ? format(parseISO(result.submittedAt), "dd MMM yyyy")
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-bar-chart-x fs-1 text-muted opacity-50 d-block mb-2"></i>
            <p className="text-muted mb-0">No results available yet.</p>
          </div>
        )}
      </div>
    </div>
  </div>
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
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: 48, height: 48 }}></div>
          <p className="text-muted small">Loading your dashboard…</p>
        </div>
      </div>
    );

  const isActive = (path) =>
    path === "/student"
      ? location.pathname === "/student"
      : location.pathname.startsWith(path);

  return (
    <>
      <BootstrapLoader />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="d-flex" style={{ minHeight: "100vh", background: "#f8f9fc" }}>
        {/* ── SIDEBAR ── */}
        <aside
          className={`d-flex flex-column bg-white border-end shadow-sm ${
            sidebarOpen ? "d-flex" : "d-none d-lg-flex"
          }`}
          style={{
            width: 260,
            minHeight: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1045,
            overflowY: "auto",
          }}
        >
          {/* Brand */}
          <div
            className="d-flex align-items-center gap-2 px-4 py-3 border-bottom"
            style={{ minHeight: 64 }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-2 bg-primary"
              style={{ width: 36, height: 36 }}
            >
              <i className="bi bi-mortarboard-fill text-white fs-6"></i>
            </div>
            <span className="fw-bold fs-5 text-dark">AcademicAxis</span>
          </div>

          {/* User pill */}
          <div className="px-3 py-3 border-bottom">
            <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-light">
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: 38, height: 38, fontSize: 15, flexShrink: 0 }}
              >
                {user?.name?.charAt(0).toUpperCase() || "S"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p className="mb-0 fw-semibold text-dark small text-truncate">
                  {user?.name || "Student"}
                </p>
                <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                  Student
                </p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-grow-1 px-3 py-3">
            <p className="text-muted text-uppercase fw-semibold mb-2 ps-1" style={{ fontSize: 10, letterSpacing: "0.08em" }}>
              Main Menu
            </p>
            <ul className="nav flex-column gap-1">
              {navItems.map((item) => (
                <SidebarLink
                  key={item.to}
                  item={item}
                  isActive={isActive(item.to)}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="px-3 py-3 border-top">
            <button
              onClick={logout}
              className="btn btn-light w-100 d-flex align-items-center gap-2 text-danger fw-medium rounded-2"
            >
              <i className="bi bi-box-arrow-left"></i>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div
          className="flex-grow-1 d-flex flex-column"
          style={{ marginLeft: 0, marginLeft: "var(--sidebar-offset, 0)" }}
        >
          {/* Top Navbar */}
          <nav
            className="navbar bg-white border-bottom shadow-sm px-3 px-md-4"
            style={{
              height: 64,
              position: "sticky",
              top: 0,
              zIndex: 1030,
              marginLeft: 0,
            }}
          >
            <div className="d-flex align-items-center gap-3 w-100">
              <button
                className="btn btn-light btn-sm d-lg-none rounded-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <i className="bi bi-list fs-5"></i>
              </button>
              {/* spacer for desktop sidebar */}
              <div className="d-none d-lg-block" style={{ width: 260 }}></div>

              <div className="d-flex align-items-center gap-2 ms-auto">
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 small fw-semibold">
                  <i className="bi bi-mortarboard me-1"></i>Student Portal
                </span>
              </div>
            </div>
          </nav>

          {/* Page body — offset for sidebar on large screens */}
          <div
            className="flex-grow-1"
            style={{ marginLeft: 0 }}
          >
            {/* On large screens, push content right of sidebar */}
            <style>{`
              @media (min-width: 992px) {
                .sidebar-offset { margin-left: 260px !important; }
              }
            `}</style>
            <div className="sidebar-offset">
              {error && (
                <div className="alert alert-danger alert-dismissible mx-3 mx-md-4 mt-3 rounded-3 border-0 shadow-sm" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
              )}

              <Routes>
                <Route
                  path="/"
                  element={
                    <DashboardHome user={user} dashboardData={dashboardData} />
                  }
                />
                <Route path="/profile" element={<StudentProfile />} />
                <Route path="/exams" element={<AvailableExams />} />
                <Route path="/exams/:examId" element={<ExamInterface />} />
                <Route path="/courses" element={<CourseEnrollment />} />
                <Route path="/results" element={<MyResults />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;