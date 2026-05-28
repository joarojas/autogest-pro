// src/views/Clientes.jsx
import React, { useState } from "react";

export const Clientes = ({ clientes, vehiculos, ordenes, onNavigate }) => {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.cedula.includes(busqueda) ||
      c.telefono.includes(busqueda)
  );

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      <div className="ag-topbar">
        <div>
          <h1 className="ag-page-title">Clientes</h1>
          <p className="ag-page-subtitle">{clientes.length} clientes registrados</p>
        </div>
        <button className="ag-btn ag-btn-primary" onClick={() => onNavigate("registro")}>
          <i className="bi bi-person-plus-fill"></i> Nuevo Cliente
        </button>
      </div>

      <div className="ag-card mb-4">
        <div className="ag-search-wrap">
          <i className="bi bi-search"></i>
          <input className="ag-input" placeholder="Buscar por nombre, cédula o teléfono..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>

      <div className="ag-card">
        {filtrados.length === 0 ? (
          <div className="ag-empty">
            <div className="ag-empty-icon"><i className="bi bi-people"></i></div>
            <div className="ag-empty-title">Sin clientes</div>
            <p>No se encontraron clientes.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="ag-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Cédula</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Vehículos</th>
                  <th>Órdenes</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => {
                  const numVehiculos = vehiculos.filter((v) => v.clienteId === c.id).length;
                  const numOrdenes = ordenes.filter((o) => o.clienteId === c.id).length;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "var(--ag-accent-light)",
                            border: "1px solid rgba(245,158,11,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ag-accent)", fontSize: 15
                          }}>
                            {c.nombre.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{c.nombre}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--ag-text-muted)" }}>{c.cedula}</td>
                      <td style={{ fontSize: 13 }}>{c.telefono}</td>
                      <td style={{ fontSize: 13, color: "var(--ag-text-muted)" }}>{c.correo || "—"}</td>
                      <td>
                        <span style={{ background: "var(--ag-accent-light)", color: "var(--ag-accent)", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                          {numVehiculos}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                          {numOrdenes}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--ag-text-muted)" }}>{c.fechaRegistro}</td>
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

// src/views/Vehiculos.jsx
export const Vehiculos = ({ vehiculos, clientes, ordenes, onNavigate }) => {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = vehiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.modelo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      <div className="ag-topbar">
        <div>
          <h1 className="ag-page-title">Vehículos</h1>
          <p className="ag-page-subtitle">{vehiculos.length} vehículos registrados</p>
        </div>
        <button className="ag-btn ag-btn-primary" onClick={() => onNavigate("registro")}>
          <i className="bi bi-plus-lg"></i> Registrar Vehículo
        </button>
      </div>

      <div className="ag-card mb-4">
        <div className="ag-search-wrap">
          <i className="bi bi-search"></i>
          <input className="ag-input" placeholder="Buscar por placa, marca o modelo..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>

      <div className="row g-3">
        {filtrados.length === 0 ? (
          <div className="col-12">
            <div className="ag-card">
              <div className="ag-empty">
                <div className="ag-empty-icon"><i className="bi bi-car-front"></i></div>
                <div className="ag-empty-title">Sin vehículos</div>
              </div>
            </div>
          </div>
        ) : (
          filtrados.map((v) => {
            const cliente = clientes.find((c) => c.id === v.clienteId);
            const numOrdenes = ordenes.filter((o) => o.vehiculoId === v.id).length;
            const ultimaOrden = ordenes.filter((o) => o.vehiculoId === v.id).sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion))[0];
            return (
              <div key={v.id} className="col-12 col-md-6 col-xl-4">
                <div className="ag-card" style={{ height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: "var(--ag-accent-light)", border: "1px solid rgba(245,158,11,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--ag-accent)", fontSize: 20
                    }}>
                      <i className="bi bi-car-front-fill"></i>
                    </div>
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14,
                      background: "var(--ag-dark-3)", padding: "4px 12px", borderRadius: 6,
                      color: "var(--ag-accent)", letterSpacing: "0.05em"
                    }}>
                      {v.placa}
                    </span>
                  </div>
                  <h6 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 4 }}>
                    {v.marca} {v.modelo}
                  </h6>
                  <div style={{ fontSize: 13, color: "var(--ag-text-muted)", marginBottom: 12 }}>
                    {v.año} · {v.color}
                  </div>
                  <hr className="ag-divider" style={{ margin: "12px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--ag-text-muted)" }}>Propietario</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{cliente?.nombre || "—"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "var(--ag-text-muted)" }}>Órdenes</div>
                      <div style={{ fontSize: 16, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ag-accent)" }}>{numOrdenes}</div>
                    </div>
                  </div>
                  {ultimaOrden && (
                    <div style={{ marginTop: 10, fontSize: 12, color: "var(--ag-text-muted)" }}>
                      Última visita: {ultimaOrden.fechaIngreso}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
