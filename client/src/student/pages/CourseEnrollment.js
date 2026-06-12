import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../shared/context/AuthContext";
import {
  useBootstrap,
  Notify,
  PageHeader,
  SectionCard,
  EmptyState,
  PortalLoader,
} from "../../shared/useBootstrap";

const API_URL = process.env.REACT_APP_API_URL;

/* ── Course card ─────────────────────────────────────────────────────── */
const CourseCard = ({ course, onEnroll, enrollingId, enrolled = false }) => {
  const accent = enrolled
    ? { top: "#10b981", iconBg: "#dcfce7", iconColor: "#15803d", icon: "bi-bookmark-check-fill" }
    : { top: "#6366f1", iconBg: "#ede9fe", iconColor: "#7c3aed", icon: "bi-journal-code" };
  const loading = enrollingId === course._id;

  return (
    <div
      className="aa-card"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow .2s, transform .2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.transform = "";
      }}
    >
      {/* Accent top bar */}
      <div style={{ height: 4, background: accent.top, flexShrink: 0 }} />

      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Icon + title */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: accent.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className={`bi ${accent.icon}`} style={{ color: accent.iconColor, fontSize: 18 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h6
              style={{
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 3px",
                fontSize: 14,
                lineHeight: 1.35,
              }}
            >
              {course.name}
            </h6>
            <p style={{ color: "#64748b", fontSize: 12.5, margin: 0 }}>
              <i className="bi bi-person" style={{ marginRight: 4 }} />
              {course.teacher?.name || "N/A"}
            </p>
          </div>
        </div>

        <p
          style={{
            color: "#64748b",
            fontSize: 13,
            lineHeight: 1.55,
            flex: 1,
            marginBottom: 16,
          }}
        >
          {course.description || "No description available for this course."}
        </p>

        {enrolled ? (
          <span
            className="aa-badge aa-badge-success"
            style={{ alignSelf: "flex-start" }}
          >
            <i className="bi bi-check2-circle" /> Enrolled
          </span>
        ) : (
          <button
            className="aa-btn aa-btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => onEnroll(course._id)}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "aa-spin .8s linear infinite",
                    flexShrink: 0,
                  }}
                />
                Enrolling…
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle" /> Enroll Now
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Teacher card ─────────────────────────────────────────────────────── */
const TeacherPickerItem = ({ teacher, onSelect }) => (
  <button
    onClick={() => onSelect(teacher._id)}
    style={{
      width: "100%",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      cursor: "pointer",
      transition: "all .15s",
      textAlign: "left",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#ede9fe";
      e.currentTarget.style.borderColor = "#c4b5fd";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#f8fafc";
      e.currentTarget.style.borderColor = "#e2e8f0";
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 16,
        flexShrink: 0,
      }}
    >
      {teacher.name.charAt(0).toUpperCase()}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>
        {teacher.name}
      </div>
      <div style={{ fontSize: 12.5, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {teacher.email}
      </div>
    </div>
    <i className="bi bi-arrow-right-circle" style={{ color: "#6366f1", fontSize: 18, flexShrink: 0 }} />
  </button>
);

/* ── Main component ─────────────────────────────────────────────────── */
const CourseEnrollment = () => {
  useBootstrap();
  const [availableCourses, setAvailableCourses]   = useState([]);
  const [enrolledCourses, setEnrolledCourses]     = useState([]);
  const [teachers, setTeachers]                   = useState([]);
  const [selectedTeacher, setSelectedTeacher]     = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [loading, setLoading]                     = useState(true);
  const [enrollingId, setEnrollingId]             = useState(null);
  const [notify, setNotify]                       = useState({ type: "success", msg: "" });
  const [showModal, setShowModal]                 = useState(false);
  const { getAuthHeader } = useAuth();

  const toast = (type, msg) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify({ type: "success", msg: "" }), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getAuthHeader();

      const [teacherRes, teachersRes] = await Promise.all([
        axios.get(`${API_URL}/api/student/my-teacher`, { headers }),
        axios.get(`${API_URL}/api/student/available-teachers`, { headers }),
      ]);

      if (teacherRes.data && !teacherRes.data.message) {
        setSelectedTeacher(teacherRes.data);
        setSelectedTeacherId(teacherRes.data._id);
      } else {
        setSelectedTeacher(null);
        setSelectedTeacherId("");
        setShowModal(true);
      }
      setTeachers(teachersRes.data);

      const [availRes, enrollRes] = await Promise.all([
        axios.get(`${API_URL}/api/student/available-courses`, { headers }),
        axios.get(`${API_URL}/api/student/enrolled-courses`, { headers }),
      ]);

      if (availRes.data.message) {
        setShowModal(true);
      } else {
        setAvailableCourses(availRes.data);
      }
      setEnrolledCourses(enrollRes.data);
    } catch (err) {
      toast(
        "error",
        err.code === "ECONNABORTED"
          ? "Request timed out — please try again."
          : err.response?.data?.message || "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    if (!API_URL) {
      toast("error", "API URL is not configured.");
      setLoading(false);
      return;
    }
    fetchData();
  }, [fetchData]);

  /* Bootstrap modal imperative control */
  useEffect(() => {
    const el = document.getElementById("teacherPickerModal");
    if (!el) return;
    Promise.resolve().then(() => {
      try {
        const bsModal = window.bootstrap?.Modal?.getOrCreateInstance(el);
        if (showModal) bsModal?.show();
        else bsModal?.hide();
      } catch (_) {}
    });
  }, [showModal]);

  const handleSelectTeacher = async (id) => {
    try {
      await axios.post(
        `${API_URL}/api/student/select-teacher/${id}`,
        {},
        { headers: getAuthHeader() }
      );
      toast("success", "Teacher selected successfully!");
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast("error", err.response?.data?.message || "Failed to select teacher.");
    }
  };

  const handleTeacherChange = async (e) => {
    const id = e.target.value;
    setSelectedTeacherId(id);
    if (!id) return;
    try {
      await axios.post(
        `${API_URL}/api/student/select-teacher/${id}`,
        {},
        { headers: getAuthHeader() }
      );
      toast("success", "Teacher updated!");
      fetchData();
    } catch (err) {
      toast("error", err.response?.data?.message || "Failed to update teacher.");
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      await axios.post(
        `${API_URL}/api/student/enroll/${courseId}`,
        {},
        { headers: getAuthHeader() }
      );
      toast("success", "Enrolled successfully!");
      fetchData();
    } catch (err) {
      toast("error", err.response?.data?.message || "Failed to enroll.");
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) return <PortalLoader label="Loading courses…" />;

  return (
    <div>
      <Notify
        type={notify.type}
        message={notify.msg}
        onClose={() => setNotify({ ...notify, msg: "" })}
      />

      <PageHeader
        title="Course Enrollment"
        subtitle="Select a teacher and enroll in their offered courses."
        action={
          <button
            className="aa-btn aa-btn-ghost aa-btn-sm"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-person-badge" /> Change Teacher
          </button>
        }
      />

      {/* ── Teacher info card ── */}
      <SectionCard
        title="Assigned Teacher"
        icon="bi-person-badge"
        iconColor="#6366f1"
        style={{ marginBottom: 24 }}
      >
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Current teacher */}
          <div style={{ flex: "1 1 220px" }}>
            {selectedTeacher ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {selectedTeacher.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 15 }}>
                    {selectedTeacher.name}
                  </p>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "2px 0 6px" }}>
                    {selectedTeacher.email}
                  </p>
                  <span className="aa-badge aa-badge-success">
                    <i className="bi bi-check-circle-fill" /> Active
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#94a3b8" }}>
                <i className="bi bi-person-x" style={{ fontSize: 28 }} />
                <span style={{ fontSize: 14 }}>No teacher selected yet</span>
              </div>
            )}
          </div>

          {/* Change teacher dropdown */}
          <div style={{ flex: "1 1 220px" }}>
            <label className="aa-label">
              <i className="bi bi-arrow-repeat" style={{ marginRight: 5 }} />
              Change Teacher
            </label>
            <select
              value={selectedTeacherId}
              onChange={handleTeacherChange}
              className="aa-input"
              style={{ cursor: "pointer" }}
            >
              <option value="">— Select a teacher —</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* ── Available courses ── */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <h5 style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 16 }}>
              Available Courses
            </h5>
            <p style={{ color: "#64748b", fontSize: 13, margin: "2px 0 0" }}>
              {availableCourses.length} course{availableCourses.length !== 1 ? "s" : ""} offered by your teacher
            </p>
          </div>
        </div>

        {availableCourses.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: 16,
            }}
          >
            {availableCourses.map((c) => (
              <CourseCard
                key={c._id}
                course={c}
                onEnroll={handleEnroll}
                enrollingId={enrollingId}
              />
            ))}
          </div>
        ) : (
          <div className="aa-card">
            <EmptyState
              icon="bi-journals"
              title="No courses available"
              message="Select a teacher above to see their offered courses."
              action={
                <button
                  className="aa-btn aa-btn-primary aa-btn-sm"
                  onClick={() => setShowModal(true)}
                >
                  <i className="bi bi-person-badge" /> Pick a Teacher
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* ── Enrolled courses ── */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <h5 style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 16 }}>
            My Enrolled Courses
          </h5>
          <p style={{ color: "#64748b", fontSize: 13, margin: "2px 0 0" }}>
            {enrolledCourses.length} course{enrolledCourses.length !== 1 ? "s" : ""} in progress
          </p>
        </div>

        {enrolledCourses.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: 16,
            }}
          >
            {enrolledCourses.map((c) => (
              <CourseCard key={c._id} course={c} enrolled />
            ))}
          </div>
        ) : (
          <div className="aa-card">
            <EmptyState
              icon="bi-collection"
              title="No enrolled courses"
              message="Browse available courses above to get started."
            />
          </div>
        )}
      </div>

      {/* ── Teacher picker modal ── */}
      <div
        className="modal fade aa-modal"
        id="teacherPickerModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 480 }}>
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h5 style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Choose Your Teacher
                </h5>
                <p style={{ color: "#64748b", fontSize: 13, margin: "3px 0 0" }}>
                  Select a teacher to access and enroll in their courses.
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              {teachers.length === 0 ? (
                <EmptyState
                  icon="bi-person-x"
                  title="No teachers available"
                  message="Check back later — no teachers are registered yet."
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {teachers.map((t) => (
                    <TeacherPickerItem key={t._id} teacher={t} onSelect={handleSelectTeacher} />
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="aa-btn aa-btn-ghost aa-btn-sm"
                onClick={() => setShowModal(false)}
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollment;