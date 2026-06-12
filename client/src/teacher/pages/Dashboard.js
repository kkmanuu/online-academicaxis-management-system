import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import axios from "axios";

import {
  useBootstrap,
  PortalLoader,
  Notify,
  StatCard,
  SectionCard,
  EmptyState,
  DashboardShell,
  SidebarShell,
  TopbarShell,
  PageHeader,
} from "./useBootstrap";

import ExamManagement   from "./ExamManagement";
import QuestionManagement from "./QuestionManagement";
import StudentEnrollment  from "./StudentEnrollment";
import CourseManagement   from "./CourseManagement";
import StudentResults     from "./StudentResults";
import ExamMonitoring     from "./ExamMonitoring";

const NAV = [
  { label: "Dashboard",       icon: "bi-speedometer2",         to: "/teacher" },
  { label: "Exam Management", icon: "bi-pencil-square",         to: "/teacher/exams" },
  { label: "Courses",         icon: "bi-journal-bookmark-fill", to: "/teacher/courses" },
  { label: "Student Results", icon: "bi-bar-chart-line-fill",   to: "/teacher/results" },
  { label: "Exam Monitor",    icon: "bi-display",               to: "/teacher/exams/monitor" },
];

/* ── Quick-action card ──────────────────────────────────────────────── */
const QuickCard = ({ icon, iconBg, iconColor, title, desc, to }) => (
  <Link to={to} className="aa-action-card" style={{ textDecoration: "none" }}>
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
      }}
    >
      <i className={`bi ${icon}`} style={{ color: iconColor, fontSize: 20 }} />
    </div>
    <h6 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 4px", fontSize: 14 }}>
      {title}
    </h6>
    <p style={{ color: "#64748b", fontSize: 12.5, margin: 0, lineHeight: 1.45 }}>
      {desc}
    </p>
  </Link>
);

/* ── Activity feed item ─────────────────────────────────────────────── */
const ActivityItem = ({ icon, iconBg, iconColor, title, sub, time }) => (
  <div
    style={{
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
      padding: "12px 20px",
      borderBottom: "1px solid #f8fafc",
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <i className={`bi ${icon}`} style={{ color: iconColor, fontSize: 14 }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 13.5, margin: 0 }}>
        {title}
      </p>
      <p style={{ color: "#94a3b8", fontSize: 12, margin: "2px 0 0" }}>{sub}</p>
    </div>
    <span style={{ fontSize: 11.5, color: "#94a3b8", flexShrink: 0, whiteSpace: "nowrap" }}>
      {time}
    </span>
  </div>
);

/* ── Dashboard home ─────────────────────────────────────────────────── */
const DashboardHome = ({ user, stats }) => {
  const first = user?.name?.split(" ")[0] || "Teacher";
  return (
    <>
      {/* Welcome */}
      <div className="aa-welcome" style={{ marginBottom: 24 }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,.6)", margin: "0 0 4px" }}>
            Teacher Portal
          </p>
          <h4 style={{ fontWeight: 700, color: "#fff", margin: "0 0 6px", fontSize: 22, letterSpacing: "-.4px" }}>
            Hello, {first} 👋
          </h4>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 13, margin: 0 }}>
            You have {stats.totalStudents} students enrolled across {stats.totalCourses} course{stats.totalCourses !== 1 ? "s" : ""}.
          </p>
        </div>
        <div style={{ position: "absolute", right: -30, bottom: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 40, top: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard icon="bi-journal-bookmark-fill" label="Total Courses"  value={stats.totalCourses}  iconBg="#dbeafe" iconColor="#1d4ed8" trend="Your active courses" />
        <StatCard icon="bi-pencil-square"         label="Total Exams"    value={stats.totalExams}    iconBg="#fef3c7" iconColor="#b45309" trend="Published exams" />
        <StatCard icon="bi-people-fill"           label="Total Students" value={stats.totalStudents} iconBg="#dcfce7" iconColor="#15803d" trend="Enrolled students" />
      </div>

      {/* Quick actions */}
      <SectionCard title="Quick Actions" icon="bi-lightning-charge-fill" iconColor="#f59e0b">
        <div
          style={{
            padding: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          <QuickCard icon="bi-plus-square-fill"  iconBg="#ede9fe" iconColor="#7c3aed" title="New Exam"      desc="Create and publish a new exam for your students."  to="/teacher/exams" />
          <QuickCard icon="bi-journal-plus"       iconBg="#dbeafe" iconColor="#1d4ed8" title="New Course"    desc="Set up a new course and start adding content."       to="/teacher/courses" />
          <QuickCard icon="bi-graph-up-arrow"     iconBg="#dcfce7" iconColor="#15803d" title="View Results"  desc="Review student scores and track performance."        to="/teacher/results" />
          <QuickCard icon="bi-display"            iconBg="#fef3c7" iconColor="#b45309" title="Live Monitor"  desc="Watch students take exams in real time."             to="/teacher/exams/monitor" />
        </div>
      </SectionCard>

      {/* Summary row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {/* Performance overview */}
        <SectionCard title="Performance Overview" icon="bi-bar-chart-fill" iconColor="#6366f1">
          <div style={{ padding: 20 }}>
            {[
              { label: "Pass rate",       pct: 74, color: "#10b981" },
              { label: "Course completion", pct: 61, color: "#6366f1" },
              { label: "Avg attendance",  pct: 88, color: "#f59e0b" },
            ].map((row) => (
              <div key={row.label} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.pct}%</span>
                </div>
                <div className="aa-progress">
                  <div className="aa-progress-fill" style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recent activity */}
        <SectionCard title="Recent Activity" icon="bi-activity" iconColor="#f59e0b">
          <ActivityItem icon="bi-person-plus-fill" iconBg="#dcfce7" iconColor="#15803d" title="New student enrolled" sub="Mathematics 101" time="2h ago" />
          <ActivityItem icon="bi-pencil-fill"      iconBg="#dbeafe" iconColor="#1d4ed8" title="Exam submitted"       sub="Mid-term Biology" time="5h ago" />
          <ActivityItem icon="bi-file-earmark-plus" iconBg="#ede9fe" iconColor="#7c3aed" title="Course created"      sub="Advanced Physics" time="1d ago" />
          <ActivityItem icon="bi-check2-all"        iconBg="#fef3c7" iconColor="#b45309" title="Results published"   sub="English Literature" time="2d ago" />
          <div style={{ height: 1 }} />
        </SectionCard>
      </div>
    </>
  );
};

/* ── Main component ─────────────────────────────────────────────────── */
const TeacherDashboard = () => {
  useBootstrap();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalCourses: 0, totalExams: 0, totalStudents: 0 });
  const [error, setError] = useState("");
  const { user, logout, getAuthHeader } = useAuth();
  const location = useLocation();

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/teacher/statistics`,
        { headers: getAuthHeader() }
      );
      setStats({
        totalCourses:  res.data.totalCourses  ?? 0,
        totalExams:    res.data.totalExams    ?? 0,
        totalStudents: res.data.totalStudents ?? 0,
      });
    } catch (e) {
      setError("Could not load statistics.");
    }
  }, [getAuthHeader]);

  useEffect(() => {
    if (user?.role === "teacher") fetchStats();
  }, [fetchStats, user]);

  if (!user || user.role !== "teacher") return <Navigate to="/login" />;

  const isActive = (p) =>
    p === "/teacher"
      ? location.pathname === "/teacher"
      : location.pathname.startsWith(p);

  const navSections = [
    {
      label: "Teacher Portal",
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
      brandSub="Teacher Portal"
      userInitial={user?.name?.charAt(0).toUpperCase() || "T"}
      userName={user?.name || "Teacher"}
      userRole="Teacher"
      navSections={navSections}
      onLogout={logout}
    />
  );

  const topbar = (
    <TopbarShell
      onMenuClick={() => setSidebarOpen((s) => !s)}
      portalLabel="Teacher Dashboard"
      portalColor="#0ea5e9"
    />
  );

  return (
    <DashboardShell
      sidebarOpen={sidebarOpen}
      onOverlayClick={() => setSidebarOpen(false)}
      sidebar={sidebar}
      topbar={topbar}
    >
      {error && <Notify type="error" message={error} onClose={() => setError("")} />}
      <Routes>
        <Route path="/" element={<DashboardHome user={user} stats={stats} />} />
        <Route path="/exams" element={<ExamManagement />} />
        <Route path="/exams/:examId/questions" element={<QuestionManagement />} />
        <Route path="/exams/:examId/students"  element={<StudentEnrollment />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/results" element={<StudentResults />} />
        <Route path="/results/:examId" element={<StudentResults />} />
        <Route path="/exams/:examId/monitor" element={<ExamMonitoring />} />
      </Routes>
    </DashboardShell>
  );
};

export default TeacherDashboard;