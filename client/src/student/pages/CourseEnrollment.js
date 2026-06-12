import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../shared/context/AuthContext";
import Modal from "bootstrap/js/dist/modal";

const API_URL = process.env.REACT_APP_API_URL;

const CourseEnrollment = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    if (!API_URL) {
      setError("API URL is not configured. Please contact the administrator.");
      setLoading(false);
      return;
    }
    fetchData();
  }, []);

  useEffect(() => {
    const el = document.getElementById("teacherModal");
    if (el) {
      if (showTeacherModal) {
        const modal = Modal.getOrCreateInstance(el);
        modal.show();
      } else {
        const modal = Modal.getInstance(el);
        if (modal) modal.hide();
      }
    }
  }, [showTeacherModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const teacherRes = await axios.get(`${API_URL}/api/student/my-teacher`, {
        headers: getAuthHeader(),
      });
      if (teacherRes.data && !teacherRes.data.message) {
        setSelectedTeacher(teacherRes.data);
        setSelectedTeacherId(teacherRes.data._id);
      } else {
        setSelectedTeacher(null);
        setSelectedTeacherId("");
        setShowTeacherModal(true);
      }

      const teachersRes = await axios.get(`${API_URL}/api/student/available-teachers`, {
        headers: getAuthHeader(),
      });
      setTeachers(teachersRes.data);

      const [availableRes, enrolledRes] = await Promise.all([
        axios.get(`${API_URL}/api/student/available-courses`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/api/student/enrolled-courses`, { headers: getAuthHeader() }),
      ]);

      if (availableRes.data.message) {
        setShowTeacherModal(true);
      } else {
        setAvailableCourses(availableRes.data);
      }
      setEnrolledCourses(enrolledRes.data);
      setLoading(false);
    } catch (err) {
      let msg = err.response?.data?.message || err.message;
      if (err.code === "ECONNABORTED") msg = "Request timed out. Please try again.";
      else if (err.message.includes("Network Error"))
        msg = "Unable to connect to the server. Check your connection.";
      setError(msg || "Failed to fetch data.");
      setLoading(false);
    }
  };

  const notify = (type, msg) => {
    if (type === "success") setSuccess(msg);
    else setError(msg);
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3500);
  };

  const handleSelectTeacher = async (teacherId) => {
    try {
      await axios.post(
        `${API_URL}/api/student/select-teacher/${teacherId}`,
        {},
        { headers: getAuthHeader() }
      );
      notify("success", "Teacher selected successfully!");
      setShowTeacherModal(false);
      fetchData();
    } catch (err) {
      notify("error", err.response?.data?.message || "Failed to select teacher.");
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
      notify("success", "Teacher updated successfully!");
      fetchData();
    } catch (err) {
      notify("error", err.response?.data?.message || "Failed to update teacher.");
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
      notify("success", "Successfully enrolled in the course!");
      fetchData();
    } catch (err) {
      notify("error", err.response?.data?.message || "Failed to enroll.");
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading)
    return (
      <div style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto .75rem" }}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: "#64748b", fontSize: ".875rem", margin: 0 }}>Loading courses…</p>
        </div>
      </div>
    );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Course Enrollment</h1>
        <p className="page-subtitle mb-0">Select a teacher and enroll in their offered courses.</p>
      </div>

      <div className="content-area">
        {/* Toast / Alert */}
        {(error || success) && (
          <div
            style={{
              background: success ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${success ? "#bbf7d0" : "#fecaca"}`,
              borderRadius: 10,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: ".875rem",
              color: success ? "#15803d" : "#b91c1c",
              marginBottom: "1.5rem",
            }}
          >
            <i className={`bi ${success ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
            <span style={{ flex: 1 }}>{success || error}</span>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "1rem" }}
              onClick={() => { setSuccess(""); setError(""); }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Teacher Selector Card */}
        <div className="portal-card mb-4">
          <div className="portal-card-header">
            <i className="bi bi-person-badge" style={{ color: "#2563eb", fontSize: "1.1rem" }}></i>
            <span style={{ fontWeight: 700, fontSize: ".95rem", color: "#0f172a" }}>Assigned Teacher</span>
          </div>
          <div style={{ padding: "1.25rem 1.5rem" }}>
            <div className="row g-4 align-items-center">
              {/* Current teacher */}
              <div className="col-md-6">
                {selectedTeacher ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 50, height: 50,
                        borderRadius: "50%",
                        background: "#2563eb",
                        color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: "1.1rem",
                        flexShrink: 0,
                      }}
                    >
                      {selectedTeacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{selectedTeacher.name}</p>
                      <p style={{ margin: 0, fontSize: ".8rem", color: "#64748b" }}>{selectedTeacher.email}</p>
                    </div>
                    <span style={{ background: "#dcfce7", color: "#15803d", fontSize: ".7rem", fontWeight: 700, padding: ".3em .85em", borderRadius: "50rem", marginLeft: 4 }}>
                      Active
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#94a3b8" }}>
                    <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bi bi-person-x" style={{ fontSize: "1.3rem" }}></i>
                    </div>
                    <span style={{ fontSize: ".875rem" }}>No teacher selected yet.</span>
                  </div>
                )}
              </div>

              {/* Change teacher */}
              <div className="col-md-6">
                <label
                  htmlFor="teacherSelect"
                  style={{ display: "block", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}
                >
                  Change Teacher
                </label>
                <select
                  id="teacherSelect"
                  className="form-select form-select-sm"
                  value={selectedTeacherId}
                  onChange={handleTeacherChange}
                  style={{ borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", height: 40, fontSize: ".875rem" }}
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
          </div>
        </div>

        {/* Available Courses */}
        <div className="mb-4">
          <div style={{ marginBottom: "1rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", margin: 0 }}>Available Courses</h2>
            <p style={{ fontSize: ".8rem", color: "#64748b", margin: 0 }}>
              {availableCourses.length} course{availableCourses.length !== 1 ? "s" : ""} offered by your teacher
            </p>
          </div>

          {availableCourses.length > 0 ? (
            <div className="row g-3">
              {availableCourses.map((course) => (
                <div key={course._id} className="col-sm-6 col-xl-4">
                  <div
                    className="portal-card h-100"
                    style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
                  >
                    <div style={{ height: 4, background: "linear-gradient(90deg,#2563eb,#60a5fa)" }}></div>
                    <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "1rem" }}>
                        <div
                          style={{
                            width: 44, height: 44,
                            borderRadius: 10,
                            background: "#dbeafe",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <i className="bi bi-journal-code" style={{ color: "#2563eb", fontSize: "1.2rem" }}></i>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: ".95rem", lineHeight: 1.3 }}>
                            {course.name}
                          </p>
                          <p style={{ margin: 0, fontSize: ".78rem", color: "#64748b", marginTop: 2 }}>
                            <i className="bi bi-person me-1"></i>
                            {course.teacher?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <p style={{ fontSize: ".8rem", color: "#64748b", flex: 1, lineHeight: 1.6, marginBottom: "1rem" }}>
                        {course.description || "No description available."}
                      </p>
                      <button
                        className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                        style={{ borderRadius: 8, fontWeight: 600, height: 38 }}
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrollingId === course._id}
                      >
                        {enrollingId === course._id ? (
                          <>
                            <span className="spinner-border spinner-border-sm"></span>
                            Enrolling…
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-circle"></i>
                            Enroll Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="portal-card text-center py-5">
              <i className="bi bi-journals" style={{ fontSize: "2.5rem", color: "#cbd5e1", display: "block", marginBottom: "1rem" }}></i>
              <p style={{ fontWeight: 600, color: "#64748b", margin: 0 }}>No courses available</p>
              <p style={{ fontSize: ".8rem", color: "#94a3b8", margin: ".25rem 0 0" }}>
                Select a teacher to see their courses.
              </p>
            </div>
          )}
        </div>

        {/* Enrolled Courses */}
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", margin: 0 }}>My Enrolled Courses</h2>
            <p style={{ fontSize: ".8rem", color: "#64748b", margin: 0 }}>
              {enrolledCourses.length} course{enrolledCourses.length !== 1 ? "s" : ""} in progress
            </p>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="row g-3">
              {enrolledCourses.map((course) => (
                <div key={course._id} className="col-sm-6 col-xl-4">
                  <div className="portal-card h-100" style={{ overflow: "hidden" }}>
                    <div style={{ height: 4, background: "linear-gradient(90deg,#16a34a,#4ade80)" }}></div>
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "1rem" }}>
                        <div
                          style={{
                            width: 44, height: 44,
                            borderRadius: 10,
                            background: "#dcfce7",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <i className="bi bi-bookmark-check-fill" style={{ color: "#16a34a", fontSize: "1.2rem" }}></i>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: ".95rem", lineHeight: 1.3 }}>
                            {course.name}
                          </p>
                          <p style={{ margin: 0, fontSize: ".78rem", color: "#64748b", marginTop: 2 }}>
                            <i className="bi bi-person me-1"></i>
                            {course.teacher?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <p style={{ fontSize: ".8rem", color: "#64748b", lineHeight: 1.6, marginBottom: "1rem" }}>
                        {course.description || "No description available."}
                      </p>
                      <span style={{ background: "#dcfce7", color: "#15803d", fontSize: ".7rem", fontWeight: 700, padding: ".35em .9em", borderRadius: "50rem" }}>
                        <i className="bi bi-check2-circle me-1"></i>Enrolled
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="portal-card text-center py-5">
              <i className="bi bi-collection" style={{ fontSize: "2.5rem", color: "#cbd5e1", display: "block", marginBottom: "1rem" }}></i>
              <p style={{ fontWeight: 600, color: "#64748b", margin: 0 }}>No enrolled courses</p>
              <p style={{ fontSize: ".8rem", color: "#94a3b8", margin: ".25rem 0 0" }}>
                Browse available courses above to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Teacher Selection Modal */}
      <div
        className="modal fade"
        id="teacherModal"
        tabIndex="-1"
        aria-labelledby="teacherModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
            <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h5 className="modal-title fw-bold" id="teacherModalLabel" style={{ color: "#0f172a", margin: 0 }}>
                    Choose Your Teacher
                  </h5>
                  <p style={{ fontSize: ".8rem", color: "#64748b", margin: ".25rem 0 0" }}>
                    Select a teacher to access their courses.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTeacherModal(false)}
                  aria-label="Close"
                ></button>
              </div>
            </div>
            <div style={{ padding: "1rem 1.5rem 1.5rem" }}>
              {teachers.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-person-x" style={{ fontSize: "2.5rem", color: "#cbd5e1", display: "block", marginBottom: ".75rem" }}></i>
                  <p style={{ color: "#64748b", fontSize: ".875rem", margin: 0 }}>No teachers available at this time.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {teachers.map((teacher) => (
                    <button
                      key={teacher._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "border-color .15s, background .15s",
                        width: "100%",
                      }}
                      onClick={() => handleSelectTeacher(teacher._id)}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                    >
                      <div
                        style={{
                          width: 42, height: 42,
                          borderRadius: "50%",
                          background: "#2563eb",
                          color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: "1rem",
                          flexShrink: 0,
                        }}
                      >
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: ".9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {teacher.name}
                        </p>
                        <p style={{ margin: 0, fontSize: ".75rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {teacher.email}
                        </p>
                      </div>
                      <i className="bi bi-arrow-right-circle" style={{ color: "#2563eb", fontSize: "1.1rem", flexShrink: 0 }}></i>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollment;