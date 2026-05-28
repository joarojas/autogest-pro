// src/views/Login.jsx
import React, { useState } from "react";

export const Login = ({ onLogin }) => {
  const [mode, setMode] = useState("mecanico");
  const [cedula, setCedula] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    if (mode === "mecanico") {
      // Demo: cualquier login entra como mecánico
      onLogin("mecanico", null);
    } else {
      if (!cedula.trim()) {
        setError("Ingrese su número de cédula.");
        return;
      }
      onLogin("cliente", cedula.trim());
    }
  };

  return (
    <div className="ag-login-page">
      <div className="ag-login-bg"></div>
      <div className="ag-login-grid"></div>

      <div className="ag-login-card">
        {/* Logo */}
        <div className="text-center mb-4">
          <div
            style={{
              width: 56,
              height: 56,
              background: "var(--ag-accent)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 24,
              color: "var(--ag-dark)",
              margin: "0 auto 16px",
            }}
          >
            A
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
            }}
          >
            AutoGest Pro
          </h1>
          <p style={{ color: "var(--ag-text-muted)", fontSize: 14, marginTop: 4 }}>
            Plataforma de Gestión de Taller
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--ag-dark-3)",
            borderRadius: 10,
            padding: 4,
            marginBottom: 28,
          }}
        >
          {["mecanico", "cliente"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1,
                padding: "8px",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "var(--transition)",
                background: mode === m ? "var(--ag-accent)" : "transparent",
                color: mode === m ? "var(--ag-dark)" : "var(--ag-text-muted)",
              }}
            >
              <i className={`bi ${m === "mecanico" ? "bi-tools" : "bi-person-fill"} me-2`}></i>
              {m === "mecanico" ? "Mecánico" : "Cliente"}
            </button>
          ))}
        </div>

        {mode === "mecanico" ? (
          <div>
            <div className="ag-form-group">
              <label className="ag-label">Usuario</label>
              <input className="ag-input" defaultValue="admin" />
            </div>
            <div className="ag-form-group">
              <label className="ag-label">Contraseña</label>
              <input className="ag-input" type="password" defaultValue="••••••••" />
            </div>
            <p style={{ fontSize: 12, color: "var(--ag-text-muted)", marginBottom: 20 }}>
              <i className="bi bi-info-circle me-1"></i>
              Demo: cualquier credencial es válida
            </p>
          </div>
        ) : (
          <div>
            <div className="ag-form-group">
              <label className="ag-label">Número de Cédula</label>
              <input
                className="ag-input"
                placeholder="Ej: 1-1234-5678"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <p style={{ fontSize: 12, color: "var(--ag-text-muted)", marginBottom: 20 }}>
              <i className="bi bi-info-circle me-1"></i>
              Prueba con: 1-1234-5678 o 2-9876-5432
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "#f87171",
              marginBottom: 16,
            }}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <button
          className="ag-btn ag-btn-primary ag-btn-lg w-100"
          onClick={handleSubmit}
          style={{ justifyContent: "center" }}
        >
          <i className="bi bi-box-arrow-in-right"></i>
          Ingresar
        </button>
      </div>
    </div>
  );
};
