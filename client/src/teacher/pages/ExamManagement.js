import React, { useState, useEffect } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    startTime: "",
    endTime: "",
  });

  const { getAuthHeader } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleCloseDialog(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/exams/teacher`,
        { headers: getAuthHeader() }
      );
      setExams(response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/teacher/courses`,
        { headers: getAuthHeader() }
      );
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleOpenDialog = (exam = null) => {
    if (exam) {
      setSelectedExam(exam);
      setFormData({
        title: exam.title,
        description: exam.description,
        courseId: exam.course._id,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        startTime: exam.startTime.split("T")[0],
        endTime: exam.endTime.split("T")[0],
      });
    } else {
      setSelectedExam(null);
      setFormData({
        title: "",
        description: "",
        courseId: "",
        duration: 60,
        totalMarks: 100,
        passingMarks: 40,
        startTime: "",
        endTime: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedExam(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const headers = getAuthHeader();
      const formattedData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };
      if (selectedExam) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/exams/${selectedExam._id}`,
          formattedData,
          { headers }
        );
      } else {
        if (!formData.courseId) {
          alert("Please select a course");
          setSubmitting(false);
          return;
        }
        await axios.post(`${process.env.REACT_APP_API_URL}/api/exams`, formattedData, { headers });
      }
      fetchExams();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving exam:", error);
      alert(`Failed to save exam: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        setDeletingId(examId);
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/exams/${examId}`, {
          headers: getAuthHeader(),
        });
        fetchExams();
      } catch (error) {
        console.error("Error deleting exam:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleManageQuestions = (examId) => navigate(`/teacher/exams/${examId}/questions`);
  const handleManageStudents  = (examId) => navigate(`/teacher/exams/${examId}/students`);
  const handleViewResults     = (examId) => navigate(`/teacher/results/${examId}`);

  // Shared field style helpers
  const fieldStyle = {
    width: "100%",
    border: "1px solid #e0eaf5",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: ".875rem",
    background: "#f0f6ff",
    outline: "none",
    fontFamily: "inherit",
    color: "#0c1a2e",
    transition: "border-color .15s, box-shadow .15s",
  };
  const onFocus = (e) => {
    e.target.style.borderColor = "#0369a1";
    e.target.style.boxShadow = "0 0 0 3px rgba(3,105,161,.1)";
    e.target.style.background = "#fff";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = "#e0eaf5";
    e.target.style.boxShadow = "none";
    e.target.style.background = "#f0f6ff";
  };

  const Label = ({ children }) => (
    <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "#5a7a9e", marginBottom: 5 }}>
      {children} <span style={{ color: "#ef4444" }}>*</span>
    </label>
  );

  return (
    <>
      {/* Page Header */}
      <div className="page-header-teacher">
        <h1 className="page-title-teacher">Exam Management</h1>
        <p className="page-subtitle-teacher">Create, edit, and manage your exams and student assignments.</p>
      </div>

      <div className="content-area-teacher">
        {/* Top action row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: ".8rem", color: "#5a7a9e" }}>
            <strong style={{ color: "#0c1a2e" }}>{exams.length}</strong> exam{exams.length !== 1 ? "s" : ""} total
          </span>
          <button
            className="admin-btn admin-btn-primary"
            style={{ background: "#0369a1" }}
            onClick={() => handleOpenDialog()}
          >
            <i className="bi bi-plus-lg"></i>
            Create New Exam
          </button>
        </div>

        {/* Empty state */}
        {exams.length === 0 ? (
          <div className="teacher-card text-center py-5">
            <i className="bi bi-pencil-square" style={{ fontSize: "2.5rem", color: "#bfdbf7", display: "block", marginBottom: "1rem" }}></i>
            <p style={{ fontWeight: 600, color: "#5a7a9e", margin: 0 }}>No exams yet</p>
            <p style={{ fontSize: ".8rem", color: "#7dd3fc", margin: ".25rem 0 .75rem" }}>
              Create your first exam to get started.
            </p>
            <button className="admin-btn admin-btn-primary" style={{ background: "#0369a1" }} onClick={() => handleOpenDialog()}>
              <i className="bi bi-plus-lg"></i>Create Exam
            </button>
          </div>
        ) : (
          <div className="teacher-card" style={{ overflow: "hidden" }}>
            <div className="teacher-card-header">
              <i className="bi bi-pencil-square" style={{ color: "#0369a1", fontSize: "1.1rem" }}></i>
              <span style={{ fontWeight: 700, fontSize: ".95rem", color: "#0c1a2e" }}>All Exams</span>
              <span style={{ marginLeft: "auto", background: "#dbeafe", color: "#1e40af", fontSize: ".7rem", fontWeight: 700, padding: ".3em .85em", borderRadius: "50rem" }}>
                {exams.length} total
              </span>
            </div>
            <div className="table-responsive">
              <table className="admin-table w-100">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: "1.5rem" }}>Title</th>
                    <th>Course</th>
                    <th>Duration</th>
                    <th>Total Marks</th>
                    <th>Passing</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th style={{ paddingRight: "1.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam._id}>
                      <td style={{ paddingLeft: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <i className="bi bi-file-earmark-text-fill" style={{ color: "#5b21b6", fontSize: ".9rem" }}></i>
                          </div>
                          <span style={{ fontWeight: 600, color: "#0c1a2e" }}>{exam.title}</span>
                        </div>
                      </td>
                      <td style={{ color: "#5a7a9e" }}>{exam.course?.name || "N/A"}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#5a7a9e" }}>
                          <i className="bi bi-clock" style={{ fontSize: ".8rem" }}></i>
                          {exam.duration} min
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "#0c1a2e" }}>{exam.totalMarks}</td>
                      <td>
                        <span style={{ background: "#dcfce7", color: "#15803d", fontSize: ".7rem", fontWeight: 700, padding: ".3em .75em", borderRadius: "50rem" }}>
                          {exam.passingMarks}
                        </span>
                      </td>
                      <td style={{ color: "#5a7a9e", fontSize: ".8rem", whiteSpace: "nowrap" }}>
                        {new Date(exam.startTime).toLocaleDateString()}
                      </td>
                      <td style={{ color: "#5a7a9e", fontSize: ".8rem", whiteSpace: "nowrap" }}>
                        {new Date(exam.endTime).toLocaleDateString()}
                      </td>
                      <td style={{ paddingRight: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "nowrap" }}>
                          {/* Manage Questions */}
                          <button
                            className="admin-btn"
                            style={{ background: "#dbeafe", color: "#1d4ed8", padding: "6px 10px" }}
                            onClick={() => handleManageQuestions(exam._id)}
                            title="Manage Questions"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          {/* Manage Students */}
                          <button
                            className="admin-btn"
                            style={{ background: "#f0fdf4", color: "#15803d", padding: "6px 10px" }}
                            onClick={() => handleManageStudents(exam._id)}
                            title="Manage Students"
                          >
                            <i className="bi bi-person-plus-fill"></i>
                          </button>
                          {/* View Results */}
                          <button
                            className="admin-btn"
                            style={{ background: "#ede9fe", color: "#5b21b6", padding: "6px 10px" }}
                            onClick={() => handleViewResults(exam._id)}
                            title="View Results"
                          >
                            <i className="bi bi-bar-chart-line-fill"></i>
                          </button>
                          {/* Edit */}
                          <button
                            className="admin-btn"
                            style={{ background: "#fef9c3", color: "#a16207", padding: "6px 10px" }}
                            onClick={() => handleOpenDialog(exam)}
                            title="Edit Exam"
                          >
                            <i className="bi bi-gear-fill"></i>
                          </button>
                          {/* Delete */}
                          <button
                            className="admin-btn admin-btn-danger"
                            style={{ padding: "6px 10px" }}
                            onClick={() => handleDelete(exam._id)}
                            disabled={deletingId === exam._id}
                            title="Delete Exam"
                          >
                            {deletingId === exam._id
                              ? <span className="spinner-border spinner-border-sm"></span>
                              : <i className="bi bi-trash3-fill"></i>
                            }
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
          <div className="admin-modal-box" style={{ maxWidth: 640 }}>
            {/* Modal header */}
            <div className="admin-modal-header">
              <div>
                <h5 style={{ fontWeight: 700, color: "#0c1a2e", margin: 0 }}>
                  {selectedExam ? "Edit Exam" : "Create New Exam"}
                </h5>
                <p style={{ fontSize: ".8rem", color: "#5a7a9e", margin: ".2rem 0 0" }}>
                  {selectedExam ? "Update the exam details below." : "Fill in the details to create a new exam."}
                </p>
              </div>
              <button
                style={{ background: "#f0f6ff", border: "1px solid #e0eaf5", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#475569" }}
                onClick={handleCloseDialog}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "65vh", overflowY: "auto" }}>
              {/* Title */}
              <div>
                <Label>Title</Label>
                <input
                  type="text" name="title"
                  value={formData.title} onChange={handleInputChange}
                  placeholder="e.g. Mid-term Mathematics Exam"
                  style={fieldStyle} onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <textarea
                  name="description" rows={3}
                  value={formData.description} onChange={handleInputChange}
                  placeholder="Brief description of this exam…"
                  style={{ ...fieldStyle, resize: "vertical" }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* Course */}
              <div>
                <Label>Course</Label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  style={{ ...fieldStyle, appearance: "none", cursor: "pointer" }}
                  onFocus={onFocus} onBlur={onBlur}
                >
                  <option value="">— Select a course —</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              </div>

              {/* Numbers row */}
              <div className="row g-3">
                <div className="col-sm-4">
                  <Label>Duration (min)</Label>
                  <input
                    type="number" name="duration"
                    value={formData.duration} onChange={handleInputChange}
                    style={fieldStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
                <div className="col-sm-4">
                  <Label>Total Marks</Label>
                  <input
                    type="number" name="totalMarks"
                    value={formData.totalMarks} onChange={handleInputChange}
                    style={fieldStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
                <div className="col-sm-4">
                  <Label>Passing Marks</Label>
                  <input
                    type="number" name="passingMarks"
                    value={formData.passingMarks} onChange={handleInputChange}
                    style={fieldStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
              </div>

              {/* Dates row */}
              <div className="row g-3">
                <div className="col-sm-6">
                  <Label>Start Date</Label>
                  <input
                    type="date" name="startTime"
                    value={formData.startTime} onChange={handleInputChange}
                    style={fieldStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
                <div className="col-sm-6">
                  <Label>End Date</Label>
                  <input
                    type="date" name="endTime"
                    value={formData.endTime} onChange={handleInputChange}
                    style={fieldStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f0f6ff", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                className="admin-btn admin-btn-outline"
                style={{ borderColor: "#e0eaf5", color: "#5a7a9e" }}
                onClick={handleCloseDialog}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary"
                style={{ background: "#0369a1" }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? <><span className="spinner-border spinner-border-sm"></span> Saving…</>
                  : <><i className={`bi ${selectedExam ? "bi-check-lg" : "bi-plus-lg"}`}></i> {selectedExam ? "Update" : "Create"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamManagement;