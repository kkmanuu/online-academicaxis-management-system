import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../shared/context/AuthContext";

const ExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const API_URL = process.env.REACT_APP_API_URL;
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    fetchExams();
    fetchAllResults();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleCloseDialog(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/exams`, { headers: getAuthHeader() });
      setExams(response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchAllResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/results`, { headers: getAuthHeader() });
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all results:", error);
      setError("Failed to load results. Please try again.");
      setLoading(false);
    }
  };

  const fetchExamResults = async (examId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/exams/${examId}/results`, { headers: getAuthHeader() });
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      setError("Failed to load exam results. Please try again.");
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleExamChange = (e) => {
    const examId = e.target.value;
    setSelectedExam(examId);
    if (examId === "all" || examId === "") fetchAllResults();
    else fetchExamResults(examId);
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResult(null);
  };

  const filteredResults = results.filter((result) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      result.student?.name?.toLowerCase().includes(searchLower) ||
      result.exam?.title?.toLowerCase().includes(searchLower) ||
      result.exam?.course?.name?.toLowerCase().includes(searchLower);
    const matchesExam = !selectedExam || selectedExam === "all" || result.exam?._id === selectedExam;
    return matchesSearch && matchesExam;
  });

  if (loading)
    return (
      <div style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto .75rem" }}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: "#64748b", fontSize: ".875rem", margin: 0 }}>Loading results…</p>
        </div>
      </div>
    );

  const passCount = filteredResults.filter(r => r.status === "pass").length;
  const failCount = filteredResults.filter(r => r.status !== "pass").length;

  return (
    <>
      <div className="page-header-admin">
        <h1 className="page-title-admin">Exam Results</h1>
        <p className="page-subtitle-admin">Review and analyse all student exam results.</p>
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

        {/* Summary stat strip */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Results", value: filteredResults.length, icon: "bi-clipboard-data-fill", bg: "#ede9fe", color: "#5b21b6" },
            { label: "Passed", value: passCount, icon: "bi-check-circle-fill", bg: "#dcfce7", color: "#15803d" },
            { label: "Failed", value: failCount, icon: "bi-x-circle-fill", bg: "#fee2e2", color: "#b91c1c" },
            { label: "Pass Rate", value: filteredResults.length ? `${((passCount / filteredResults.length) * 100).toFixed(0)}%` : "—", icon: "bi-graph-up-arrow", bg: "#dbeafe", color: "#1d4ed8" },
          ].map((s) => (
            <div key={s.label} className="col-6 col-lg-3">
              <div className="admin-stat-card d-flex align-items-center gap-3">
                <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`bi ${s.icon}`} style={{ fontSize: "1.15rem", color: s.color }}></i>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: ".68rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "#64748b" }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="admin-card mb-4" style={{ padding: "1.25rem 1.5rem" }}>
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="admin-search-wrap">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search by student, exam or course…"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select className="admin-select w-100" value={selectedExam} onChange={handleExamChange}>
                <option value="all">All Exams</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>{exam.title}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <span style={{ fontSize: ".8rem", color: "#64748b" }}>
                <strong style={{ color: "#0f172a" }}>{filteredResults.length}</strong> result{filteredResults.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Results table */}
        {filteredResults.length === 0 ? (
          <div className="admin-card text-center py-5">
            <i className="bi bi-clipboard-x" style={{ fontSize: "2.5rem", color: "#cbd5e1", display: "block", marginBottom: "1rem" }}></i>
            <p style={{ fontWeight: 600, color: "#64748b", margin: 0 }}>No results found</p>
            <p style={{ fontSize: ".8rem", color: "#94a3b8", margin: ".25rem 0 0" }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="admin-card" style={{ overflow: "hidden" }}>
            <div className="admin-card-header">
              <i className="bi bi-bar-chart-line-fill" style={{ color: "#4f46e5", fontSize: "1.1rem" }}></i>
              <span style={{ fontWeight: 700, fontSize: ".95rem", color: "#0f172a" }}>Exam Results</span>
            </div>
            <div className="table-responsive">
              <table className="admin-table w-100">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: "1.5rem" }}>Student</th>
                    <th>Exam</th>
                    <th>Course</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th style={{ paddingRight: "1.5rem" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result._id}>
                      <td style={{ paddingLeft: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ede9fe", color: "#5b21b6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: ".8rem", flexShrink: 0 }}>
                            {result.student?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{result.student?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td style={{ color: "#64748b" }}>{result.exam?.title || "Unknown"}</td>
                      <td style={{ color: "#64748b" }}>{result.exam?.course?.name || "Unknown"}</td>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{(result.percentage || 0).toFixed(2)}%</td>
                      <td>
                        <span className={`admin-badge ${result.status === "pass" ? "badge-pass" : "badge-fail"}`}>
                          {result.status ? result.status.toUpperCase() : "Unknown"}
                        </span>
                      </td>
                      <td style={{ color: "#64748b", fontSize: ".8rem", whiteSpace: "nowrap" }}>
                        {result.submittedAt
                          ? `${new Date(result.submittedAt).toLocaleDateString()} ${new Date(result.submittedAt).toLocaleTimeString()}`
                          : "Unknown"}
                      </td>
                      <td style={{ paddingRight: "1.5rem" }}>
                        <button className="admin-btn admin-btn-outline" onClick={() => handleViewDetails(result)}>
                          <i className="bi bi-eye"></i>View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {openDialog && selectedResult && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseDialog(); }}
        >
          <div className="admin-modal-box" style={{ maxWidth: 560 }}>
            <div className="admin-modal-header">
              <div>
                <h5 style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>Result Details</h5>
                <p style={{ fontSize: ".8rem", color: "#64748b", margin: ".2rem 0 0" }}>Full information for this submission</p>
              </div>
              <button style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#475569" }} onClick={handleCloseDialog}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Student info */}
              <div>
                <p style={{ margin: "0 0 .75rem", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #f1f5f9", paddingBottom: ".5rem" }}>
                  Student Information
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ede9fe", color: "#5b21b6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0 }}>
                    {selectedResult.student?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{selectedResult.student?.name || "Unknown"}</p>
                    <p style={{ margin: 0, fontSize: ".8rem", color: "#64748b" }}>{selectedResult.student?.email || "Unknown"}</p>
                  </div>
                </div>
              </div>

              {/* Exam info */}
              <div>
                <p style={{ margin: "0 0 .75rem", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #f1f5f9", paddingBottom: ".5rem" }}>
                  Exam Information
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Exam Title", value: selectedResult.exam?.title || "Unknown" },
                    { label: "Course", value: selectedResult.exam?.course?.name || "Unknown" },
                    { label: "Teacher", value: selectedResult.exam?.teacher?.name || "Unknown" },
                    { label: "Score", value: `${(selectedResult.percentage || 0).toFixed(2)}%` },
                    { label: "Status", value: selectedResult.status ? selectedResult.status.toUpperCase() : "Unknown", isStatus: true },
                  ].map(({ label, value, isStatus }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: ".875rem" }}>
                      <span style={{ color: "#64748b" }}>{label}</span>
                      {isStatus ? (
                        <span className={`admin-badge ${selectedResult.status === "pass" ? "badge-pass" : "badge-fail"}`}>{value}</span>
                      ) : (
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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

export default ExamResults;