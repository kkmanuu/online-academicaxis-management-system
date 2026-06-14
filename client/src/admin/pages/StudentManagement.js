import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../shared/context/AuthContext";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [studentResults, setStudentResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;
  const { getAuthHeader } = useAuth();

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleCloseDialog(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/students`, { headers: getAuthHeader() });
      console.log("Students fetched:", response.data);
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students. Please try again.");
      setLoading(false);
    }
  };

  const fetchStudentResults = async (studentId) => {
    try {
      setLoadingResults(true);
      const response = await axios.get(`${API_URL}/api/admin/students/${studentId}/results`, { headers: getAuthHeader() });
      console.log("Student results fetched:", response.data);
      setStudentResults(response.data);
      setLoadingResults(false);
    } catch (error) {
      console.error("Error fetching student results:", error);
      setError("Failed to load student results. Please try again.");
      setLoadingResults(false);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleViewResults = (student) => {
    setSelectedStudent(student);
    fetchStudentResults(student._id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setStudentResults([]);
  };

  const handleToggleBlock = async (student) => {
    try {
      setTogglingId(student._id);
      const response = await axios.put(
        `${API_URL}/api/admin/users/${student._id}/block`, {},
        { headers: getAuthHeader() }
      );
      setStudents(students.map((s) => s._id === student._id ? { ...s, isBlocked: !s.isBlocked } : s));
      console.log("Student block status updated:", response.data);
    } catch (error) {
      console.error("Error updating student block status:", error);
      setError("Failed to update student status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(searchLower)) ||
      (student.email && student.email.toLowerCase().includes(searchLower))
    );
  });

  if (loading)
    return (
      <div style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto .75rem" }}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: "#64748b", fontSize: ".875rem", margin: 0 }}>Loading students…</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="page-header-admin">
        <h1 className="page-title-admin">Student Management</h1>
        <p className="page-subtitle-admin">View, search, and manage all registered students.</p>
      </div>

      <div className="content-area-admin">
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontSize: ".875rem", color: "#b91c1c", marginBottom: "1.5rem" }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span style={{ flex: 1 }}>{error}</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c" }} onClick={() => setError("")}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Search bar */}
        <div className="admin-card mb-4" style={{ padding: "1.25rem 1.5rem" }}>
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="admin-search-wrap">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search by name or email…"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <span style={{ fontSize: ".8rem", color: "#64748b" }}>
                Showing <strong style={{ color: "#0f172a" }}>{filteredStudents.length}</strong> of {students.length} students
              </span>
            </div>
          </div>
        </div>

        {/* Students table */}
        {filteredStudents.length === 0 ? (
          <div className="admin-card text-center py-5">
            <i className="bi bi-person-x" style={{ fontSize: "2.5rem", color: "#cbd5e1", display: "block", marginBottom: "1rem" }}></i>
            <p style={{ fontWeight: 600, color: "#64748b", margin: 0 }}>No students found</p>
            <p style={{ fontSize: ".8rem", color: "#94a3b8", margin: ".25rem 0 0" }}>Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="admin-card" style={{ overflow: "hidden" }}>
            <div className="admin-card-header">
              <i className="bi bi-people-fill" style={{ color: "#4f46e5", fontSize: "1.1rem" }}></i>
              <span style={{ fontWeight: 700, fontSize: ".95rem", color: "#0f172a" }}>All Students</span>
              <span style={{ marginLeft: "auto", background: "#ede9fe", color: "#5b21b6", fontSize: ".7rem", fontWeight: 700, padding: ".3em .85em", borderRadius: "50rem" }}>
                {filteredStudents.length} total
              </span>
            </div>
            <div className="table-responsive">
              <table className="admin-table w-100">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: "1.5rem" }}>Student</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th style={{ paddingRight: "1.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td style={{ paddingLeft: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: student.isBlocked ? "#fee2e2" : "#ede9fe", color: student.isBlocked ? "#b91c1c" : "#5b21b6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: ".85rem", flexShrink: 0 }}>
                            {student.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{student.name}</span>
                        </div>
                      </td>
                      <td style={{ color: "#64748b" }}>{student.email}</td>
                      <td>
                        <span className={`admin-badge ${student.isBlocked ? "badge-blocked" : "badge-active"}`}>
                          <i className={`bi ${student.isBlocked ? "bi-slash-circle" : "bi-check-circle"} me-1`}></i>
                          {student.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td style={{ paddingRight: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button className="admin-btn admin-btn-outline" onClick={() => handleViewResults(student)}>
                            <i className="bi bi-eye"></i>Results
                          </button>
                          <button
                            className={`admin-btn ${student.isBlocked ? "admin-btn-success" : "admin-btn-danger"}`}
                            onClick={() => handleToggleBlock(student)}
                            disabled={togglingId === student._id}
                          >
                            {togglingId === student._id
                              ? <span className="spinner-border spinner-border-sm"></span>
                              : <i className={`bi ${student.isBlocked ? "bi-check-circle" : "bi-slash-circle"}`}></i>
                            }
                            {student.isBlocked ? "Unblock" : "Block"}
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

      {/* Results Modal */}
      {openDialog && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseDialog(); }}
        >
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <div>
                <h5 style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>Exam Results</h5>
                <p style={{ fontSize: ".8rem", color: "#64748b", margin: ".2rem 0 0" }}>
                  {selectedStudent?.name} — {studentResults.length} result{studentResults.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#475569" }} onClick={handleCloseDialog}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div style={{ padding: 0 }}>
              {loadingResults ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem" }}>
                  <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
              ) : studentResults.length === 0 ? (
                <div className="text-center" style={{ padding: "3rem" }}>
                  <i className="bi bi-bar-chart-x" style={{ fontSize: "2.5rem", color: "#cbd5e1", display: "block", marginBottom: "1rem" }}></i>
                  <p style={{ color: "#64748b", margin: 0 }}>No results found for this student.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table w-100">
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: "1.5rem" }}>Exam</th>
                        <th>Course</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th style={{ paddingRight: "1.5rem" }}>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentResults.map((result) => (
                        <tr key={result._id}>
                          <td style={{ paddingLeft: "1.5rem", fontWeight: 600, color: "#0f172a" }}>{result.exam ? result.exam.title : "Unknown"}</td>
                          <td style={{ color: "#64748b" }}>{result.exam && result.exam.course ? result.exam.course.name : "Unknown"}</td>
                          <td style={{ fontWeight: 600 }}>{result.percentage.toFixed(2)}%</td>
                          <td>
                            <span className={`admin-badge ${result.status === "pass" ? "badge-pass" : "badge-fail"}`}>
                              {result.status === "pass" ? "Pass" : "Fail"}
                            </span>
                          </td>
                          <td style={{ color: "#64748b", fontSize: ".8rem", paddingRight: "1.5rem" }}>
                            {new Date(result.submittedAt).toLocaleDateString()} {new Date(result.submittedAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
              <button className="admin-btn admin-btn-outline" onClick={handleCloseDialog}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentManagement;