// src/views/Dashboard.jsx
import React from "react";
import { StatCard, StatusBadge } from "../components/StatusBadge";
import { ESTADOS } from "../data/mockData";

export const Dashboard = ({ clientes, vehiculos, ordenes, onNavigate }) => {
  const recibidas = ordenes.filter((o) => o.estado === ESTADOS.RECIBIDO).length;
  const enProceso = ordenes.filter((o) => o.estado === ESTADOS.EN_PROCESO).length;
  const finalizadas = ordenes.filter((o) => o.estado === ESTADOS.FINALIZADO).length;

  const recientes = [...ordenes]
    .sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion))
    .slice(0, 5);

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      <div className="ag-topbar">
        <div>
          <h1 className="ag-page-title">Dashboard</h1>
          <p className="ag-page-subtitle">Resumen del taller</p>
        </div>
        <button
          className="ag-btn ag-btn-primary"
          onClick={() => onNavigate("registro")}
        >
          <i className="bi bi-plus-lg"></i>
          Nuevo Ingreso
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard
            value={clientes.length}
            label="Clientes Registrados"
            icon="bi-people-fill"
          />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard
            value={recibidas}
            label="Órdenes Recibidas"
            icon="bi-inbox-fill"
            color="#60a5fa"
            bg="rgba(59,130,246,0.12)"
          />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard
            value={enProceso}
            label="En Proceso"
            icon="bi-gear-fill"
            color="var(--ag-accent)"
            bg="var(--ag-accent-light)"
          />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard
            value={finalizadas}
            label="Finalizadas"
            icon="bi-check-circle-fill"
            color="#34d399"
            bg="rgba(16,185,129,0.12)"
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="ag-card">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h5 className="font-display mb-0" style={{ fontSize: 16, fontWeight: 700 }}>
            Órdenes Recientes
          </h5>
          <button
            className="ag-btn ag-btn-ghost ag-btn-sm"
            onClick={() => onNavigate("ordenes")}
          >
            Ver todas <i className="bi bi-arrow-right"></i>
          </button>
        </div>

        {recientes.length === 0 ? (
          <div className="ag-empty">
            <div className="ag-empty-icon"><i className="bi bi-file-earmark-x"></i></div>
            <div className="ag-empty-title">Sin órdenes</div>
            <p>Crea el primer ingreso para comenzar.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="ag-table">
              <thead>
                <tr>
                  <th>OS</th>
                  <th>Cliente</th>
                  <th>Vehículo</th>
                  <th>Ingreso</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((orden) => {
                  const cliente = clientes.find((c) => c.id === orden.clienteId);
                  const vehiculo = vehiculos.find((v) => v.id === orden.vehiculoId);
                  return (
                    <tr key={orden.id}>
                      <td>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--ag-accent)" }}>
                          #{orden.id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{cliente?.nombre || "—"}</div>
                        <div style={{ fontSize: 12, color: "var(--ag-text-muted)" }}>{cliente?.telefono}</div>
                      </td>
                      <td>
                        <div>{vehiculo?.marca} {vehiculo?.modelo}</div>
                        <div style={{ fontSize: 12, color: "var(--ag-accent)", fontWeight: 600 }}>{vehiculo?.placa}</div>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--ag-text-muted)" }}>{orden.fechaIngreso}</td>
                      <td><StatusBadge estado={orden.estado} /></td>
                      <td>
                        <button
                          className="ag-btn ag-btn-ghost ag-btn-sm ag-btn-icon"
                          onClick={() => onNavigate("ordenes", orden.id)}
                          title="Ver detalle"
                        >
                          <i className="bi bi-arrow-right-circle"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
