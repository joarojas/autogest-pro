// src/components/StatusBadge.jsx
import React from "react";

export const StatusBadge = ({ estado }) => {
  const cfg = {
    Recibido: { cls: "ag-badge-recibido", icon: "bi-inbox-fill", label: "Recibido" },
    "En Proceso": { cls: "ag-badge-proceso", icon: "bi-gear-fill ag-pulse", label: "En Proceso" },
    Finalizado: { cls: "ag-badge-finalizado", icon: "bi-check-circle-fill", label: "Finalizado" },
  };
  const { cls, icon, label } = cfg[estado] || cfg["Recibido"];
  return (
    <span className={`ag-badge ${cls}`}>
      <i className={`bi ${icon}`} style={{ fontSize: 10 }}></i>
      {label}
    </span>
  );
};

// src/components/StatCard.jsx
export const StatCard = ({ value, label, icon, color = "var(--ag-accent)", bg = "var(--ag-accent-light)" }) => (
  <div className="ag-stat-card d-flex align-items-center justify-content-between">
    <div>
      <div className="ag-stat-value" style={{ color }}>
        {value}
      </div>
      <div className="ag-stat-label">{label}</div>
    </div>
    <div className="ag-stat-icon" style={{ background: bg, color }}>
      <i className={`bi ${icon}`}></i>
    </div>
  </div>
);

// src/components/Modal.jsx
export const Modal = ({ show, onClose, title, children, footer, size = "" }) => {
  if (!show) return null;
  return (
    <div className="ag-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ag-modal ${size === "lg" ? "ag-modal-lg" : ""}`}>
        <div className="ag-modal-header">
          <h5 className="ag-modal-title">{title}</h5>
          <button
            className="ag-btn ag-btn-ghost ag-btn-icon ag-btn-sm"
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="ag-modal-body">{children}</div>
        {footer && <div className="ag-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// src/components/Stepper.jsx
export const Stepper = ({ estado }) => {
  const steps = ["Recibido", "En Proceso", "Finalizado"];
  const currentIdx = steps.indexOf(estado);

  return (
    <div>
      <div className="ag-stepper">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <div style={{ textAlign: "center" }}>
              <div
                className={`ag-step-dot ${
                  i === currentIdx ? "active" : i < currentIdx ? "done" : ""
                }`}
              >
                {i < currentIdx ? (
                  <i className="bi bi-check" style={{ fontSize: 14 }}></i>
                ) : (
                  i + 1
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`ag-step-line ${i < currentIdx ? "done" : ""}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="d-flex justify-content-between mt-1">
        {steps.map((step) => (
          <div key={step} className="ag-step-label" style={{ flex: 1 }}>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};
