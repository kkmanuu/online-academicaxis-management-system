import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import axios from "axios";
import { format, parseISO } from "date-fns";

import {
  useBootstrap,
  PortalLoader,
  Notify,
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
  DashboardShell,
  SidebarShell,
  TopbarShell,
} from "../../shared/useBootstrap";

import CourseEnrollment from "./CourseEnrollment";
import StudentProfile from "../components/StudentProfile";
import ExamInterface from "./ExamInterface";
import AvailableExams from "./AvailableExams";
import MyResults from "./MyResults";

const API_URL = process.env.REACT_APP_API_URL;

/* ── nav definition ─────────────────────────────────────────────────── */
const NAV = [
  { label: "Dashboard",  icon: "bi-speedometer2",         to: "/student" },
  { label: "My Profile", icon: "bi-person-circle",         to: "/student/profile" },
  { label: "Courses",    icon: "bi-journal-bookmark-fill", to: "/student/courses" },
  { label: "Exams",      icon: "bi-pencil-square",         to: "/student/exams" },
  { label: "My Results", icon: "bi-bar-chart-line-fill",   to: "/student/results" },
];

/* ── status badge helper ────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    pass:        "aa-badge aa-badge-success",
    fail:        "aa-badge aa-badge-danger",
    completed:   "aa-badge aa-badge-success",
    in_progress: "aa-badge aa-badge-warning",
    enrolled:    "aa-badge aa-badge-info",
  };
  const cls = map[status] || "aa-badge aa-badge-neutral";
  const label = status ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";
  return <span className={cls}>{label}</span>;
};

/* ── score progress bar ─────────────────────────────────────────────── */
const ScoreBar = ({ pct }) => {
  const color = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="aa-progress" style={{ flex: 1 }}>
        <div
          className="aa-progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 38 }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
};

/* ── dashboard home ─────────────────────────────────────────────────── */
const DashboardHome = ({ user, data }) => {
  const first = user?.name?.split(" ")[0] || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      {/* Welcome banner */}
      <div
        className="aa-welcome"
        style={{ marginBottom: 24 }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              color: "rgba(255,255,255,.6)",
              margin: "0 0 4px",
            }}
          >
            {greeting}
          </p>
          <h4
            style={{
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 6px",
              fontSize: 22,
              letterSpacing: "-.4px",
            }}
          >
            Welcome back, {first} 👋
          </h4>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 13, margin: 0 }}>
            {data.stats.pendingExams > 0
              ? `You have ${data.stats.pendingExams} pending exam${data.stats.pendingExams !== 1 ? "s" : ""} — keep up the great work!`
              : "You're all caught up — great work this semester!"}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            right: -30,
            bottom: -30,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,.05)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            top: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,.04)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon="bi-journal-bookmark-fill"
          label="Enrolled Courses"
          value={data.stats.enrolledCourses ?? 0}
          iconBg="#ede9fe"
          iconColor="#7c3aed"
        />
        <StatCard
          icon="bi-check2-all"
          label="Completed Exams"
          value={data.stats.completedExams ?? 0}
          iconBg="#dcfce7"
          iconColor="#15803d"
        />
        <StatCard
          icon="bi-clock-history"
          label="Pending Exams"
          value={data.stats.pendingExams ?? 0}
          iconBg="#fef3c7"
          iconColor="#b45309"
        />
        <StatCard
          icon="bi-trophy-fill"
          label="Average Score"
          value={
            data.stats.averageScore
              ? `${data.stats.averageScore.toFixed(1)}%`
              : "—"
          }
          iconBg="#dbeafe"
          iconColor="#1d4ed8"
        />
      </div>

      {/* Two-column on large, stacked on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {/* Enrolled courses */}
        <SectionCard
          title="Enrolled Courses"
          icon="bi-journal-bookmark-fill"
          iconColor="#6366f1"
          badge={`${data.courses?.length ?? 0} total`}
          action={
            <Link
              to="/student/courses"
              style={{
                fontSize: 12.5,
                color: "#6366f1",
                fontWeight: 600,
                textDecoration: "none",
                marginLeft: "auto",
              }}
            >
              Manage →
            </Link>
          }
        >
          {data.courses?.length > 0 ? (
            <div className="aa-table-wrap">
              <table className="aa-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Teacher</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courses.map((c) => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>
                        {c.name || "—"}
                      </td>
                      <td>{c.teacher || "—"}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="bi-journal-x"
              title="No courses yet"
              message="Enroll in courses to get started."
              action={
                <Link
                  to="/student/courses"
                  className="aa-btn aa-btn-primary aa-btn-sm"
                  style={{ textDecoration: "none" }}
                >
                  <i className="bi bi-plus-circle" /> Browse Courses
                </Link>
              }
            />
          )}
        </SectionCard>

        {/* Recent results */}
        <SectionCard
          title="Recent Exam Results"
          icon="bi-bar-chart-line-fill"
          iconColor="#10b981"
          badge={`${data.results?.length ?? 0} graded`}
          action={
            <Link
              to="/student/results"
              style={{
                fontSize: 12.5,
                color: "#10b981",
                fontWeight: 600,
                textDecoration: "none",
                marginLeft: "auto",
              }}
            >
              All results →
            </Link>
          }
        >
          {data.results?.length > 0 ? (
            <div className="aa-table-wrap">
              <table className="aa-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.slice(0, 6).map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>
                          {r.exam?.title || "—"}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1 }}>
                          {r.exam?.course?.name || r.course?.name || ""}
                        </div>
                      </td>
                      <td style={{ minWidth: 110 }}>
                        {r.percentage != null ? (
                          <ScoreBar pct={r.percentage} />
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="bi-bar-chart-x"
              title="No results yet"
              message="Complete exams to see your scores here."
            />
          )}
        </SectionCard>
      </div>

      {/* Upcoming exams quick-link */}
      {data.stats.pendingExams > 0 && (
        <div
          style={{
            marginTop: 20,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 14,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <i className="bi bi-alarm-fill" style={{ color: "#b45309", fontSize: 20, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "#92400e", margin: 0, fontSize: 14 }}>
              {data.stats.pendingExams} exam{data.stats.pendingExams !== 1 ? "s" : ""} pending
            </p>
            <p style={{ color: "#b45309", fontSize: 12.5, margin: 0 }}>
              Head to the Exams section to view details and deadlines.
            </p>
          </div>
          <Link
            to="/student/exams"
            className="aa-btn aa-btn-sm"
            style={{
              background: "#f59e0b",
              color: "#fff",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            View Exams <i className="bi bi-arrow-right" />
          </Link>
        </div>
      )}
    </>
  );
};

/* ── Main component ─────────────────────────────────────────────────── */
const StudentDashboard = () => {
  useBootstrap();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    stats: { enrolledCourses: 0, completedExams: 0, pendingExams: 0, averageScore: 0 },
    results: [],
    courses: [],
  });

  const { user, logout, getAuthHeader, isAuthenticated } = useAuth();
  const location = useLocation();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/student/dashboard`, {
        headers: getAuthHeader(),
      });
      setData({
        stats: res.data.stats || data.stats,
        results: res.data.results || [],
        courses: res.data.courses || [],
      });
    } catch (e) {
      const msg =
        e.response?.status === 401
          ? "Session expired — please log in again."
          : e.response?.data?.message || "Failed to load dashboard.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    if (!isAuthenticated()) {
      setError("Please log in to view the dashboard.");
      setLoading(false);
      return;
    }
    fetchData();
  }, [fetchData, isAuthenticated]);

  if (!user || user.role !== "student") return <Navigate to="/login" />;
  if (loading) return <PortalLoader label="Loading your dashboard…" />;

  const isActive = (path) =>
    path === "/student"
      ? location.pathname === "/student"
      : location.pathname.startsWith(path);

  const navSections = [
    {
      label: "Student Portal",
      items: NAV.map((n) => ({
        ...n,
        active: isActive(n.to),
        onClick: () => setSidebarOpen(false),
      })),
    },
  ];

  const sidebar = (
    <SidebarShell
      open={sidebarOpen}
      brandLabel="AcademicAxis"
      brandSub="Student Portal"
      userInitial={user?.name?.charAt(0).toUpperCase() || "S"}
      userName={user?.name || "Student"}
      userRole="Student"
      navSections={navSections}
      onLogout={logout}
    />
  );

  const topbar = (
    <TopbarShell
      onMenuClick={() => setSidebarOpen((s) => !s)}
      portalLabel="Student Dashboard"
      portalColor="#6366f1"
    />
  );

  return (
    <DashboardShell
      sidebarOpen={sidebarOpen}
      onOverlayClick={() => setSidebarOpen(false)}
      sidebar={sidebar}
      topbar={topbar}
    >
      {error && (
        <Notify
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={<DashboardHome user={user} data={data} />}
        />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/exams" element={<AvailableExams />} />
        <Route path="/exams/:examId" element={<ExamInterface />} />
        <Route path="/courses" element={<CourseEnrollment />} />
        <Route path="/results" element={<MyResults />} />
      </Routes>
    </DashboardShell>
  );
};

export default StudentDashboard;