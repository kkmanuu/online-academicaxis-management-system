import React, { useState, useEffect } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleCloseDialog(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/teacher/courses`, { headers: getAuthHeader() });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      notify("error", "Failed to fetch courses");
    }
  };

  const notify = (type, msg) => {
    if (type === "success") setSuccess(msg);
    else setError(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setSelectedCourse(course);
      setFormData({ name: course.name, description: course.description });
    } else {
      setSelectedCourse(null);
      setFormData({ name: "", description: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
    setFormData({ name: "", description: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (selectedCourse) {
        await axios.put(`${API_URL}/api/teacher/courses/${selectedCourse._id}`, formData, { headers: getAuthHeader() });
        notify("success", "Course updated successfully");
      } else {
        await axios.post(`${API_URL}/api/teacher/courses`, formData, { headers: getAuthHeader() });
        notify("success", "Course created successfully");
      }
      handleCloseDialog();
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      notify("error", error.response?.data?.message || "Error saving course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        setDeletingId(courseId);
        await axios.delete(`${API_URL}/api/teacher/courses/${courseId}`, { headers: getAuthHeader() });
        notify("success", "Course deleted successfully");
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        notify("error", error.response?.data?.message || "Error deleting course");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <>
      <div className="page-header-teacher">
        <h1 className="page-title-teacher">Course Management</h1>
        <p className="page-subtitle-teacher">Create and manage your courses for enrolled students.</p>
      </div>

      <div className="content-area-teacher">
        {/* Alerts */}
        {(error || success) && (
          <div style={{
            background: success ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${success ? "#bbf7d0" : "#fecaca"}`,
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 10,
            fontSize: ".875rem", color: success ? "#15803d" : "#b91c1c",
            marginBottom: "1.5rem"
          }}>
            <i className={`bi ${success ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
            <span style={{ flex: 1 }}>{success || error}</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
              onClick={() => { setSuccess(""); setError(""); }}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10 }}>
          <div>
            <span style={{ fontSize: ".8rem", color: "#5a7a9e" }}>
              <strong style={{ color: "#0c1a2e" }}>{courses.length}</strong> course{courses.length !== 1 ? "s" : ""} total
            </span>
          </div>
          <button
            className="admin-btn admin-btn-primary"
            style={{ background: "#0369a1" }}
            onClick={() => handleOpenDialog()}
          >
            <i className="bi bi-plus-lg"></i>
            Add New Course
          </button>
        </div>

        {/* Courses table */}
        {courses.length === 0 ? (
          <div className="teacher-card text-center py-5">
            <i className="bi bi-journal-x" style={{ fontSize: "2.5rem", color: "#bfdbf7", display: "block", marginBottom: "1rem" }}></i>
            <p style={{ fontWeight: 600, color: "#5a7a9e", margin: 0 }}>No courses yet</p>
            <p style={{ fontSize: ".8rem", color: "#7dd3fc", margin: ".25rem 0 .75rem" }}>
              Create your first course to get started.
            </p>
            <button className="admin-btn admin-btn-primary" style={{ background: "#0369a1" }} onClick={() => handleOpenDialog()}>
              <i className="bi bi-plus-lg"></i>Add Course
            </button>
          </div>
        ) : (
          <div className="teacher-card" style={{ overflow: "hidden" }}>
            <div className="teacher-card-header">
              <i className="bi bi-journal-bookmark-fill" style={{ color: "#0369a1", fontSize: "1.1rem" }}></i>
              <span style={{ fontWeight: 700, fontSize: ".95rem", color: "#0c1a2e" }}>All Courses</span>
              <span style={{ marginLeft: "auto", background: "#dbeafe", color: "#1e40af", fontSize: ".7rem", fontWeight: 700, padding: ".3em .85em", borderRadius: "50rem" }}>
                {courses.length} total
              </span>
            </div>
            <div className="table-responsive">
              <table className="admin-table w-100">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: "1.5rem" }}>Course</th>
                    <th>Description</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th style={{ paddingRight: "1.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td style={{ paddingLeft: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <i className="bi bi-journal-code" style={{ color: "#1d4ed8", fontSize: "1rem" }}></i>
                          </div>
                          <span style={{ fontWeight: 600, color: "#0c1a2e" }}>{course.name}</span>
                        </div>
                      </td>
                      <td style={{ color: "#5a7a9e", maxWidth: 260 }}>
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {course.description || "—"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <i className="bi bi-people-fill" style={{ color: "#0369a1", fontSize: ".85rem" }}></i>
                          <span style={{ fontWeight: 600, color: "#0c1a2e" }}>{course.students?.length || 0}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: ".7rem", fontWeight: 700, padding: ".3em .85em", borderRadius: "50rem",
                          background: course.isActive ? "#dcfce7" : "#f1f5f9",
                          color: course.isActive ? "#15803d" : "#64748b"
                        }}>
                          {course.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ paddingRight: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button
                            className="admin-btn"
                            style={{ background: "#dbeafe", color: "#1d4ed8" }}
                            onClick={() => handleOpenDialog(course)}
                          >
                            <i className="bi bi-pencil-fill"></i>Edit
                          </button>
                          <button
                            className="admin-btn admin-btn-danger"
                            onClick={() => handleDelete(course._id)}
                            disabled={deletingId === course._id}
                          >
                            {deletingId === course._id
                              ? <span className="spinner-border spinner-border-sm"></span>
                              : <i className="bi bi-trash3-fill"></i>
                            }
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {openDialog && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseDialog(); }}
        >
          <div className="admin-modal-box" style={{ maxWidth: 520 }}>
            <div className="admin-modal-header">
              <div>
                <h5 style={{ fontWeight: 700, color: "#0c1a2e", margin: 0 }}>
                  {selectedCourse ? "Edit Course" : "Add New Course"}
                </h5>
                <p style={{ fontSize: ".8rem", color: "#5a7a9e", margin: ".2rem 0 0" }}>
                  {selectedCourse ? "Update the course details below." : "Fill in the details to create a new course."}
                </p>
              </div>
              <button
                style={{ background: "#f0f6ff", border: "1px solid #e0eaf5", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#475569" }}
                onClick={handleCloseDialog}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#5a7a9e", marginBottom: 6 }}>
                  Course Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Introduction to Mathematics"
                  style={{ width: "100%", border: "1px solid #e0eaf5", borderRadius: 8, padding: "10px 14px", fontSize: ".875rem", background: "#f0f6ff", outline: "none", transition: "border-color .15s" }}
                  onFocus={e => { e.target.style.borderColor = "#0369a1"; e.target.style.boxShadow = "0 0 0 3px rgba(3,105,161,.1)"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = "#e0eaf5"; e.target.style.boxShadow = "none"; e.target.style.background = "#f0f6ff"; }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#5a7a9e", marginBottom: 6 }}>
                  Description <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe what students will learn in this course…"
                  style={{ width: "100%", border: "1px solid #e0eaf5", borderRadius: 8, padding: "10px 14px", fontSize: ".875rem", background: "#f0f6ff", outline: "none", resize: "vertical", transition: "border-color .15s", fontFamily: "inherit" }}
                  onFocus={e => { e.target.style.borderColor = "#0369a1"; e.target.style.boxShadow = "0 0 0 3px rgba(3,105,161,.1)"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = "#e0eaf5"; e.target.style.boxShadow = "none"; e.target.style.background = "#f0f6ff"; }}
                />
              </div>
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f0f6ff", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="admin-btn admin-btn-outline" style={{ borderColor: "#e0eaf5", color: "#5a7a9e" }} onClick={handleCloseDialog}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary"
                style={{ background: "#0369a1" }}
                onClick={handleSubmit}
                disabled={submitting || !formData.name || !formData.description}
              >
                {submitting
                  ? <><span className="spinner-border spinner-border-sm"></span> Saving…</>
                  : <><i className={`bi ${selectedCourse ? "bi-check-lg" : "bi-plus-lg"}`}></i> {selectedCourse ? "Update" : "Create"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseManagement;