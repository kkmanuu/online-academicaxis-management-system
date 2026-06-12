import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../shared/context/AuthContext";
import {
  useBootstrap,
  Notify,
  PageHeader,
  SectionCard,
  EmptyState,
  ConfirmModal,
  PortalLoader,
} from "./useBootstrap";

const API_URL = process.env.REACT_APP_API_URL;

/* ── Form field wrapper ─────────────────────────────────────────────── */
const Field = ({ label, required, children, error }) => (
  <div style={{ marginBottom: 18 }}>
    <label className="aa-label">
      {label}
      {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: 12, color: "#dc2626", margin: "4px 0 0" }}>
        <i className="bi bi-exclamation-circle" style={{ marginRight: 4 }} />
        {error}
      </p>
    )}
  </div>
);

/* ── Course row (mobile-first) ──────────────────────────────────────── */
const CourseRow = ({ course, onEdit, onDelete, index }) => (
  <tr>
    <td>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: index % 2 === 0 ? "#ede9fe" : "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i
            className="bi bi-journal-code"
            style={{ color: index % 2 === 0 ? "#7c3aed" : "#1d4ed8", fontSize: 14 }}
          />
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 13.5 }}>
            {course.name}
          </span>
        </div>
      </div>
    </td>
    <td
      style={{
        maxWidth: 240,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        color: "#64748b",
        fontSize: 13,
      }}
    >
      {course.description || "—"}
    </td>
    <td>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 13 }}>
        <i className="bi bi-people-fill" style={{ color: "#6366f1" }} />
        {course.students?.length ?? 0}
      </div>
    </td>
    <td>
      <span
        className={`aa-badge ${course.isActive ? "aa-badge-success" : "aa-badge-neutral"}`}
      >
        {course.isActive ? "Active" : "Inactive"}
      </span>
    </td>
    <td>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          className="aa-btn aa-btn-ghost aa-btn-sm"
          onClick={() => onEdit(course)}
          title="Edit"
        >
          <i className="bi bi-pencil" style={{ color: "#6366f1" }} />
          <span className="d-none d-sm-inline">Edit</span>
        </button>
        <button
          className="aa-btn aa-btn-ghost aa-btn-sm"
          onClick={() => onDelete(course._id)}
          title="Delete"
        >
          <i className="bi bi-trash" style={{ color: "#ef4444" }} />
          <span className="d-none d-sm-inline">Delete</span>
        </button>
      </div>
    </td>
  </tr>
);

/* ── Main component ─────────────────────────────────────────────────── */
const CourseManagement = () => {
  useBootstrap();
  const [courses, setCourses]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [deleteId, setDeleteId]         = useState(null);
  const [selected, setSelected]         = useState(null);
  const [formData, setFormData]         = useState({ name: "", description: "" });
  const [formErrors, setFormErrors]     = useState({});
  const [notify, setNotify]             = useState({ type: "success", msg: "" });
  const [search, setSearch]             = useState("");
  const modalRef                        = useRef(null);
  const { getAuthHeader }               = useAuth();

  const toast = useCallback((type, msg) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify({ type: "success", msg: "" }), 3500);
  }, []);

  /* Bootstrap modal control */
  const openModal = useCallback(() => {
    setShowModal(true);
    setTimeout(() => {
      const el = document.getElementById("courseFormModal");
      if (el) window.bootstrap?.Modal?.getOrCreateInstance(el).show();
    }, 50);
  }, []);

  const closeModal = useCallback(() => {
    const el = document.getElementById("courseFormModal");
    if (el) window.bootstrap?.Modal?.getInstance(el)?.hide();
    setShowModal(false);
    setSelected(null);
    setFormData({ name: "", description: "" });
    setFormErrors({});
  }, []);

  const openDeleteModal = useCallback((id) => {
    setDeleteId(id);
    setTimeout(() => {
      const el = document.getElementById("confirmModal");
      if (el) window.bootstrap?.Modal?.getOrCreateInstance(el).show();
    }, 50);
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/teacher/courses`, {
        headers: getAuthHeader(),
      });
      setCourses(res.data);
    } catch (e) {
      toast("error", e.response?.data?.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, toast]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleEdit = (course) => {
    setSelected(course);
    setFormData({ name: course.name, description: course.description });
    openModal();
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim())        errs.name = "Course name is required.";
    if (!formData.description.trim()) errs.description = "Description is required.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      if (selected) {
        await axios.put(
          `${API_URL}/api/teacher/courses/${selected._id}`,
          formData,
          { headers: getAuthHeader() }
        );
        toast("success", "Course updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/teacher/courses`, formData, {
          headers: getAuthHeader(),
        });
        toast("success", "Course created successfully.");
      }
      closeModal();
      fetchCourses();
    } catch (e) {
      toast("error", e.response?.data?.message || "Could not save course.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/api/teacher/courses/${deleteId}`, {
        headers: getAuthHeader(),
      });
      toast("success", "Course deleted.");
      fetchCourses();
    } catch (e) {
      toast("error", e.response?.data?.message || "Could not delete course.");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PortalLoader label="Loading courses…" />;

  return (
    <div>
      <Notify
        type={notify.type}
        message={notify.msg}
        onClose={() => setNotify({ ...notify, msg: "" })}
      />

      <PageHeader
        title="Course Management"
        subtitle={`${courses.length} course${courses.length !== 1 ? "s" : ""} in your portal`}
        action={
          <button
            className="aa-btn aa-btn-primary"
            onClick={() => { setSelected(null); setFormData({ name: "", description: "" }); openModal(); }}
          >
            <i className="bi bi-plus-circle-fill" /> New Course
          </button>
        }
      />

      {/* Search + filter bar */}
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #f1f5f9",
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <i
            className="bi bi-search"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: 15,
            }}
          />
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="aa-input"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <span
          style={{
            fontSize: 13,
            color: "#64748b",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table card */}
      <SectionCard
        title="All Courses"
        icon="bi-journals"
        iconColor="#6366f1"
        badge={`${courses.length} total`}
      >
        {filtered.length > 0 ? (
          <div className="aa-table-wrap">
            <table className="aa-table" style={{ width: "100%", minWidth: 560 }}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Description</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <CourseRow
                    key={c._id}
                    course={c}
                    index={i}
                    onEdit={handleEdit}
                    onDelete={openDeleteModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="bi-journals"
            title={search ? "No matches found" : "No courses yet"}
            message={
              search
                ? "Try a different search term."
                : "Create your first course to get started."
            }
            action={
              !search && (
                <button
                  className="aa-btn aa-btn-primary aa-btn-sm"
                  onClick={() => { setSelected(null); setFormData({ name: "", description: "" }); openModal(); }}
                >
                  <i className="bi bi-plus-circle" /> Create Course
                </button>
              )
            }
          />
        )}
      </SectionCard>

      {/* ── Create / Edit Modal ── */}
      <div
        className="modal fade aa-modal"
        id="courseFormModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 520 }}>
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h5 style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  {selected ? "Edit Course" : "Create New Course"}
                </h5>
                <p style={{ color: "#64748b", fontSize: 13, margin: "3px 0 0" }}>
                  {selected
                    ? "Update the course details below."
                    : "Fill in the details to create a new course."}
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <Field label="Course Name" required error={formErrors.name}>
                <input
                  type="text"
                  className="aa-input"
                  placeholder="e.g. Introduction to Algebra"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  style={formErrors.name ? { borderColor: "#ef4444" } : {}}
                />
              </Field>
              <Field label="Description" required error={formErrors.description}>
                <textarea
                  className="aa-input"
                  placeholder="Describe what this course covers…"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  style={{
                    resize: "vertical",
                    ...(formErrors.description ? { borderColor: "#ef4444" } : {}),
                  }}
                />
              </Field>
            </div>
            <div className="modal-footer">
              <button className="aa-btn aa-btn-ghost aa-btn-sm" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="aa-btn aa-btn-primary aa-btn-sm"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
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
                    Saving…
                  </>
                ) : selected ? (
                  <>
                    <i className="bi bi-check2-circle" /> Update Course
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle" /> Create Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      <ConfirmModal
        id="confirmModal"
        title="Delete Course?"
        message="This will permanently remove the course and all its associated data. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        danger
      />
    </div>
  );
};

export default CourseManagement;