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

// Open/close Bootstrap modal imperatively (uses global bootstrap from CDN)
   useEffect(() => {
     const el = document.getElementById("teacherModal");
     if (el) {
       const modalEl = el;
       if (showTeacherModal) {
         const modal = Modal.getOrCreateInstance(modalEl);
         modal.show();
       } else {
         const modal = Modal.getInstance(modalEl);
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

      const teachersRes = await axios.get(
        `${API_URL}/api/student/available-teachers`,
        { headers: getAuthHeader() }
      );
      setTeachers(teachersRes.data);

      const [availableRes, enrolledRes] = await Promise.all([
        axios.get(`${API_URL}/api/student/available-courses`, {
          headers: getAuthHeader(),
        }),
        axios.get(`${API_URL}/api/student/enrolled-courses`, {
          headers: getAuthHeader(),
        }),
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
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: 40, height: 40 }}></div>
          <p className="text-muted small mb-0">Loading courses…</p>
        </div>
      </div>
    );

  return (
    <div className="p-3 p-md-4">
      {/* Toasts / Alerts */}
      {(error || success) && (
        <div
          className={`alert alert-dismissible border-0 shadow-sm rounded-3 mb-4 d-flex align-items-center gap-2 ${
            success ? "alert-success" : "alert-danger"
          }`}
          role="alert"
        >
          <i className={`bi ${success ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} fs-5`}></i>
          <span>{success || error}</span>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => { setSuccess(""); setError(""); }}
          ></button>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Course Enrollment</h4>
        <p className="text-muted mb-0 small">
          Select a teacher and enroll in their offered courses.
        </p>
      </div>

      {/* ── TEACHER SELECTOR CARD ── */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center g-4">
            {/* Assigned teacher info */}
            <div className="col-md-6">
              <p className="text-muted small text-uppercase fw-semibold mb-2" style={{ letterSpacing: "0.07em" }}>
                <i className="bi bi-person-badge me-1"></i>Assigned Teacher
              </p>
              {selectedTeacher ? (
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                    style={{ width: 48, height: 48, fontSize: 18 }}
                  >
                    {selectedTeacher.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="mb-0 fw-bold text-dark">{selectedTeacher.name}</p>
                    <p className="mb-0 text-muted small">{selectedTeacher.email}</p>
                  </div>
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 ms-1 small">
                    Active
                  </span>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2 text-muted">
                  <div
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48 }}
                  >
                    <i className="bi bi-person-x fs-5 text-secondary"></i>
                  </div>
                  <span className="small">No teacher selected yet.</span>
                </div>
              )}
            </div>

            {/* Select dropdown */}
            <div className="col-md-6">
              <label
                htmlFor="teacherSelect"
                className="form-label text-muted small text-uppercase fw-semibold"
                style={{ letterSpacing: "0.07em" }}
              >
                Change Teacher
              </label>
              <select
                id="teacherSelect"
                className="form-select form-select-sm rounded-2 border-0 bg-light"
                value={selectedTeacherId}
                onChange={handleTeacherChange}
                style={{ height: 40 }}
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

      {/* ── AVAILABLE COURSES ── */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Available Courses</h5>
            <p className="text-muted small mb-0">
              {availableCourses.length} course{availableCourses.length !== 1 ? "s" : ""} offered by your teacher
            </p>
          </div>
        </div>

        {availableCourses.length > 0 ? (
          <div className="row g-3">
            {availableCourses.map((course) => (
              <div key={course._id} className="col-sm-6 col-xl-4">
                <div className="card border-0 shadow-sm h-100">
                  {/* Colored top accent */}
                  <div
                    className="rounded-top"
                    style={{
                      height: 4,
                      background: "linear-gradient(90deg,#4f46e5,#818cf8)",
                    }}
                  ></div>
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2 bg-primary bg-opacity-10 flex-shrink-0"
                        style={{ width: 44, height: 44 }}
                      >
                        <i className="bi bi-journal-code text-primary fs-5"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold text-dark mb-1 lh-sm">
                          {course.name}
                        </h6>
                        <p className="text-muted mb-0 small">
                          <i className="bi bi-person me-1"></i>
                          {course.teacher?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted small flex-grow-1 mb-3 lh-base">
                      {course.description || "No description available."}
                    </p>
                    <button
                      className="btn btn-primary btn-sm w-100 rounded-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleEnroll(course._id)}
                      disabled={enrollingId === course._id}
                      style={{ height: 38 }}
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
          <div className="card border-0 shadow-sm border-dashed">
            <div className="card-body text-center py-5">
              <i className="bi bi-journals fs-1 text-muted opacity-50 d-block mb-2"></i>
              <p className="text-muted mb-1 fw-medium">No courses available</p>
              <p className="text-muted small mb-0">
                Select a teacher to see their courses.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── ENROLLED COURSES ── */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">My Enrolled Courses</h5>
            <p className="text-muted small mb-0">
              {enrolledCourses.length} course{enrolledCourses.length !== 1 ? "s" : ""} in progress
            </p>
          </div>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="row g-3">
            {enrolledCourses.map((course) => (
              <div key={course._id} className="col-sm-6 col-xl-4">
                <div className="card border-0 shadow-sm h-100">
                  <div
                    className="rounded-top"
                    style={{
                      height: 4,
                      background: "linear-gradient(90deg,#10b981,#34d399)",
                    }}
                  ></div>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2 bg-success bg-opacity-10 flex-shrink-0"
                        style={{ width: 44, height: 44 }}
                      >
                        <i className="bi bi-bookmark-check-fill text-success fs-5"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-1 lh-sm">
                          {course.name}
                        </h6>
                        <p className="text-muted mb-0 small">
                          <i className="bi bi-person me-1"></i>
                          {course.teacher?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted small mb-3 lh-base">
                      {course.description || "No description available."}
                    </p>
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 small fw-semibold">
                      <i className="bi bi-check2-circle me-1"></i>Enrolled
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-collection fs-1 text-muted opacity-50 d-block mb-2"></i>
              <p className="text-muted mb-1 fw-medium">No enrolled courses</p>
              <p className="text-muted small mb-0">
                Browse available courses above to get started.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── TEACHER SELECTION MODAL ── */}
      <div
        className="modal fade"
        id="teacherModal"
        tabIndex="-1"
        aria-labelledby="teacherModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-0 pb-0 px-4 pt-4">
              <div>
                <h5 className="modal-title fw-bold text-dark" id="teacherModalLabel">
                  Choose Your Teacher
                </h5>
                <p className="text-muted small mb-0">
                  Select a teacher to access their courses.
                </p>
              </div>
              <button
                type="button"
                className="btn-close ms-auto"
                onClick={() => setShowTeacherModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body px-4 pt-3 pb-4">
              {teachers.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-person-x fs-1 text-muted opacity-50 d-block mb-2"></i>
                  <p className="text-muted small mb-0">No teachers available at this time.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {teachers.map((teacher) => (
                    <button
                      key={teacher._id}
                      className="btn btn-light text-start d-flex align-items-center gap-3 rounded-3 border p-3"
                      style={{ transition: "all .15s" }}
                      onClick={() => handleSelectTeacher(teacher._id)}
                    >
                      <div
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                        style={{ width: 42, height: 42, fontSize: 16 }}
                      >
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <p className="mb-0 fw-semibold text-dark text-truncate">
                          {teacher.name}
                        </p>
                        <p className="mb-0 text-muted small text-truncate">
                          {teacher.email}
                        </p>
                      </div>
                      <i className="bi bi-arrow-right-circle text-primary fs-5 flex-shrink-0"></i>
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