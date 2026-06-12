/**
 * useBootstrap — injects Bootstrap 5 CSS + Icons + JS once into the document.
 * Import and call inside any dashboard component.
 *
 * Also exports:
 *   PortalLoader  – loading screen shared by every portal
 *   Notify        – alert banner (success / error / warning / info)
 *   PageHeader    – consistent page-level heading + breadcrumb
 *   StatCard      – KPI summary card
 *   SectionCard   – white card wrapper with optional header
 *   EmptyState    – empty-data placeholder
 *   ConfirmModal  – reusable delete-confirm modal (id="confirmModal")
 */

import { useEffect } from "react";
import React from "react";

/* ── CDN injection ─────────────────────────────────────────────────── */
export function useBootstrap() {
  useEffect(() => {
    const head = document.head;
    const body = document.body;

    const addLink = (id, href) => {
      if (!document.getElementById(id)) {
        const el = document.createElement("link");
        el.id = id;
        el.rel = "stylesheet";
        el.href = href;
        head.appendChild(el);
      }
    };
    const addScript = (id, src) => {
      if (!document.getElementById(id)) {
        const el = document.createElement("script");
        el.id = id;
        el.src = src;
        el.defer = true;
        body.appendChild(el);
      }
    };

    addLink(
      "aa-bs5",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    );
    addLink(
      "aa-bi",
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    );
    addLink(
      "aa-gfont",
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    );
    addScript(
      "aa-bs5-js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    );

    /* Global overrides injected once */
    if (!document.getElementById("aa-global")) {
      const style = document.createElement("style");
      style.id = "aa-global";
      style.textContent = `
        body { font-family: 'Inter', system-ui, sans-serif !important; }

        /* ── Sidebar ── */
        .aa-sidebar {
          width: 260px;
          min-height: 100vh;
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          position: fixed;
          top: 0; left: 0;
          z-index: 1045;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          transition: transform .25s ease;
        }
        .aa-sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,.55);
          z-index: 1044;
        }
        .aa-sidebar-overlay.show { display: block; }

        /* hide sidebar on mobile by default */
        @media (max-width: 991.98px) {
          .aa-sidebar { transform: translateX(-100%); }
          .aa-sidebar.open { transform: translateX(0); }
          .aa-main { margin-left: 0 !important; }
        }
        @media (min-width: 992px) {
          .aa-main { margin-left: 260px; }
        }

        /* ── Sidebar nav links ── */
        .aa-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          margin: 2px 10px;
          color: rgba(255,255,255,.55);
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: all .15s;
          border-left: 3px solid transparent;
        }
        .aa-nav-link:hover {
          background: rgba(255,255,255,.07);
          color: rgba(255,255,255,.9);
        }
        .aa-nav-link.active {
          background: rgba(99,102,241,.18);
          color: #a5b4fc;
          border-left-color: #6366f1;
        }
        .aa-nav-link i { font-size: 16px; width: 20px; text-align: center; }
        .aa-nav-section {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: rgba(255,255,255,.25);
          font-weight: 600;
          padding: 14px 22px 5px;
        }

        /* ── Topbar ── */
        .aa-topbar {
          height: 64px;
          background: #fff;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 1030;
        }

        /* ── Stat cards ── */
        .aa-stat-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: box-shadow .2s, transform .2s;
        }
        .aa-stat-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,.1);
          transform: translateY(-2px);
        }
        .aa-stat-icon {
          width: 52px; height: 52px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }

        /* ── Section cards ── */
        .aa-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0,0,0,.06);
          overflow: hidden;
        }
        .aa-card-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
        }

        /* ── Tables ── */
        .aa-table thead th {
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .07em;
          padding: 10px 16px;
          border-bottom: 1px solid #e9ecef;
          white-space: nowrap;
        }
        .aa-table tbody td {
          padding: 13px 16px;
          font-size: 13.5px;
          vertical-align: middle;
          border-bottom: 1px solid #f8fafc;
          color: #374151;
        }
        .aa-table tbody tr:last-child td { border-bottom: none; }
        .aa-table tbody tr:hover td { background: #f8fafc; }

        /* ── Badges ── */
        .aa-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .aa-badge-success { background: #dcfce7; color: #15803d; }
        .aa-badge-danger  { background: #fee2e2; color: #b91c1c; }
        .aa-badge-warning { background: #fef3c7; color: #b45309; }
        .aa-badge-info    { background: #dbeafe; color: #1d4ed8; }
        .aa-badge-neutral { background: #f1f5f9; color: #475569; }

        /* ── Quick action cards ── */
        .aa-action-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0,0,0,.06);
          padding: 20px;
          text-decoration: none;
          display: block;
          transition: all .2s;
        }
        .aa-action-card:hover {
          box-shadow: 0 6px 20px rgba(99,102,241,.15);
          border-color: #c7d2fe;
          transform: translateY(-2px);
        }

        /* ── Progress bar ── */
        .aa-progress { height: 6px; border-radius: 6px; background: #f1f5f9; overflow: hidden; }
        .aa-progress-fill { height: 100%; border-radius: 6px; }

        /* ── User avatar ── */
        .aa-avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700;
          font-size: 15px; flex-shrink: 0;
        }
        .aa-avatar-sm { width: 32px; height: 32px; font-size: 12px; }
        .aa-avatar-lg { width: 52px; height: 52px; font-size: 20px; }

        /* ── Brand ── */
        .aa-brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 18px; flex-shrink: 0;
        }

        /* ── Notification dot ── */
        .aa-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #f59e0b;
          display: inline-block;
        }

        /* ── Welcome banner ── */
        .aa-welcome {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border-radius: 16px;
          color: #fff;
          padding: 24px 28px;
          position: relative;
          overflow: hidden;
        }
        .aa-welcome::after {
          content: '';
          position: absolute;
          right: -20px; top: -20px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,.06);
        }

        /* ── Mobile form stacking ── */
        @media (max-width: 575.98px) {
          .aa-stat-card { padding: 14px; }
          .aa-stat-icon { width: 42px; height: 42px; font-size: 18px; }
          .aa-welcome { padding: 18px 20px; }
        }

        /* ── Scrollable mobile table wrapper ── */
        .aa-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        /* ── Modal polish ── */
        .aa-modal .modal-content {
          border: none;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,.15);
        }
        .aa-modal .modal-header {
          border-bottom: 1px solid #f1f5f9;
          padding: 20px 24px 16px;
        }
        .aa-modal .modal-body  { padding: 20px 24px; }
        .aa-modal .modal-footer {
          border-top: 1px solid #f1f5f9;
          padding: 16px 24px;
        }

        /* ── Form controls ── */
        .aa-input {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          transition: border-color .15s, box-shadow .15s;
          width: 100%;
        }
        .aa-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }
        .aa-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          display: block;
        }

        /* ── Buttons ── */
        .aa-btn {
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          padding: 9px 18px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: none;
          cursor: pointer;
          transition: all .15s;
        }
        .aa-btn-primary { background: #6366f1; color: #fff; }
        .aa-btn-primary:hover { background: #4f46e5; }
        .aa-btn-success { background: #10b981; color: #fff; }
        .aa-btn-success:hover { background: #059669; }
        .aa-btn-danger  { background: #ef4444; color: #fff; }
        .aa-btn-danger:hover  { background: #dc2626; }
        .aa-btn-ghost   { background: #f8fafc; color: #374151; border: 1px solid #e2e8f0; }
        .aa-btn-ghost:hover { background: #f1f5f9; }
        .aa-btn-sm { padding: 6px 12px; font-size: 12.5px; }

        /* ── Loading spinner ── */
        .aa-spinner {
          width: 40px; height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: aa-spin .8s linear infinite;
        }
        @keyframes aa-spin { to { transform: rotate(360deg); } }
      `;
      head.appendChild(style);
    }
  }, []);
}

/* ── Shared UI Primitives ──────────────────────────────────────────── */

export const PortalLoader = ({ label = "Loading…" }) => (
  <div
    style={{
      minHeight: "100vh",
      background: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
    }}
  >
    <div className="aa-spinner" />
    <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>{label}</p>
  </div>
);

export const Notify = ({ type = "success", message, onClose }) => {
  if (!message) return null;
  const cfg = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", icon: "bi-check-circle-fill" },
    error:   { bg: "#fff1f2", border: "#fecdd3", color: "#be123c", icon: "bi-exclamation-triangle-fill" },
    warning: { bg: "#fffbeb", border: "#fde68a", color: "#b45309", icon: "bi-exclamation-circle-fill" },
    info:    { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", icon: "bi-info-circle-fill" },
  }[type];
  return (
    <div
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
        fontSize: 13.5,
        color: cfg.color,
      }}
    >
      <i className={`bi ${cfg.icon}`} style={{ fontSize: 16, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: cfg.color,
            padding: 0,
            fontSize: 16,
            lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          <i className="bi bi-x-lg" />
        </button>
      )}
    </div>
  );
};

export const PageHeader = ({ title, subtitle, action }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 24,
      flexWrap: "wrap",
    }}
  >
    <div>
      <h4
        style={{
          fontWeight: 700,
          color: "#0f172a",
          margin: 0,
          fontSize: 20,
          letterSpacing: "-.3px",
        }}
      >
        {title}
      </h4>
      {subtitle && (
        <p style={{ color: "#64748b", fontSize: 13, margin: "3px 0 0" }}>
          {subtitle}
        </p>
      )}
    </div>
    {action && <div style={{ flexShrink: 0 }}>{action}</div>}
  </div>
);

export const StatCard = ({ icon, label, value, iconBg, iconColor, trend }) => (
  <div className="aa-stat-card">
    <div className="aa-stat-icon" style={{ background: iconBg }}>
      <i className={`bi ${icon}`} style={{ color: iconColor }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: ".07em",
          color: "#94a3b8",
          margin: "0 0 4px",
        }}
      >
        {label}
      </p>
      <h4 style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 26 }}>
        {value}
      </h4>
      {trend && (
        <p style={{ fontSize: 11.5, color: "#64748b", margin: "3px 0 0" }}>
          {trend}
        </p>
      )}
    </div>
  </div>
);

export const SectionCard = ({ title, icon, iconColor, badge, children, action }) => (
  <div className="aa-card" style={{ marginBottom: 20 }}>
    {(title || action) && (
      <div className="aa-card-header">
        {icon && (
          <i
            className={`bi ${icon}`}
            style={{ color: iconColor || "#6366f1", fontSize: 16 }}
          />
        )}
        {title && (
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", flex: 1 }}>
            {title}
          </span>
        )}
        {badge && (
          <span
            style={{
              background: "#f1f5f9",
              color: "#475569",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 9px",
              borderRadius: 20,
            }}
          >
            {badge}
          </span>
        )}
        {action}
      </div>
    )}
    {children}
  </div>
);

export const EmptyState = ({ icon, title, message, action }) => (
  <div
    style={{
      textAlign: "center",
      padding: "48px 24px",
      color: "#94a3b8",
    }}
  >
    <i
      className={`bi ${icon}`}
      style={{ fontSize: 40, display: "block", marginBottom: 12, opacity: 0.5 }}
    />
    <p style={{ fontWeight: 600, color: "#64748b", margin: "0 0 4px" }}>{title}</p>
    <p style={{ fontSize: 13, margin: "0 0 16px" }}>{message}</p>
    {action}
  </div>
);

export const ConfirmModal = ({ id = "confirmModal", title, message, onConfirm, onCancel, danger = true }) => (
  <div className="modal fade aa-modal" id={id} tabIndex="-1" aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered modal-sm">
      <div className="modal-content">
        <div className="modal-body" style={{ textAlign: "center", padding: "28px 24px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: danger ? "#fee2e2" : "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <i
              className={`bi ${danger ? "bi-trash3-fill" : "bi-question-circle-fill"}`}
              style={{ fontSize: 22, color: danger ? "#dc2626" : "#2563eb" }}
            />
          </div>
          <h6 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{title}</h6>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>{message}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="aa-btn aa-btn-ghost aa-btn-sm" onClick={onCancel} data-bs-dismiss="modal">
              Cancel
            </button>
            <button
              className={`aa-btn aa-btn-sm ${danger ? "aa-btn-danger" : "aa-btn-primary"}`}
              onClick={onConfirm}
              data-bs-dismiss="modal"
            >
              {danger ? "Delete" : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Shared layout shell ────────────────────────────────────────────── */
export const DashboardShell = ({
  sidebarOpen,
  onOverlayClick,
  sidebar,
  topbar,
  children,
}) => (
  <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
    {/* Mobile overlay */}
    <div
      className={`aa-sidebar-overlay${sidebarOpen ? " show" : ""}`}
      onClick={onOverlayClick}
    />
    {sidebar}
    <div className="aa-main" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {topbar}
      <main style={{ flex: 1, padding: "24px 20px" }}>
        {children}
      </main>
    </div>
  </div>
);

/* ── Sidebar shell (role-agnostic) ─────────────────────────────────── */
export const SidebarShell = ({
  open,
  brandLabel,
  brandSub,
  userInitial,
  userName,
  userRole,
  navSections,
  onLogout,
}) => (
  <aside className={`aa-sidebar${open ? " open" : ""}`}>
    {/* Brand */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "18px 16px",
        borderBottom: "1px solid rgba(255,255,255,.07)",
      }}
    >
      <div className="aa-brand-icon">
        <i className="bi bi-mortarboard-fill" />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-.3px" }}>
          {brandLabel}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".07em" }}>
          {brandSub}
        </div>
      </div>
    </div>

    {/* User */}
    <div style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
      <div
        style={{
          background: "rgba(255,255,255,.06)",
          borderRadius: 10,
          padding: "9px 10px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div className="aa-avatar aa-avatar-sm" style={{ flexShrink: 0 }}>
          {userInitial}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "#f1f5f9",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {userName}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{userRole}</div>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, paddingBottom: 8 }}>
      {navSections.map((section, si) => (
        <div key={si}>
          {section.label && (
            <div className="aa-nav-section">{section.label}</div>
          )}
          {section.items.map((item) => (
            <a
              key={item.to}
              href={item.to}
              className={`aa-nav-link${item.active ? " active" : ""}`}
              onClick={(e) => {
                if (item.onClick) { e.preventDefault(); item.onClick(); }
              }}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "rgba(99,102,241,.3)",
                    color: "#a5b4fc",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: 10,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      ))}
    </nav>

    {/* Logout */}
    <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
      <button
        onClick={onLogout}
        style={{
          width: "100%",
          background: "rgba(239,68,68,.08)",
          border: "1px solid rgba(239,68,68,.2)",
          borderRadius: 10,
          padding: "9px 14px",
          color: "#fca5a5",
          fontSize: 13.5,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <i className="bi bi-box-arrow-left" />
        Sign Out
      </button>
    </div>
  </aside>
);

/* ── Topbar shell ──────────────────────────────────────────────────── */
export const TopbarShell = ({ onMenuClick, portalLabel, portalColor = "#6366f1", children }) => (
  <div className="aa-topbar">
    <button
      className="d-lg-none"
      onClick={onMenuClick}
      style={{
        background: "none",
        border: "none",
        padding: "6px 8px",
        borderRadius: 8,
        cursor: "pointer",
        color: "#374151",
        fontSize: 20,
        lineHeight: 1,
        flexShrink: 0,
      }}
      aria-label="Toggle sidebar"
    >
      <i className="bi bi-list" />
    </button>

    <span
      style={{
        fontSize: 15,
        fontWeight: 700,
        color: "#0f172a",
        flex: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {portalLabel}
    </span>

    {children}

    <div
      style={{
        background: `${portalColor}18`,
        color: portalColor,
        fontSize: 11.5,
        fontWeight: 600,
        padding: "5px 12px",
        borderRadius: 20,
        border: `1px solid ${portalColor}30`,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <i className="bi bi-shield-check me-1" />
      {portalLabel}
    </div>
  </div>
);