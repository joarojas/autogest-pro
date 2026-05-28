// src/views/VistaCliente.jsx
import React, { useState } from "react";
import { StatusBadge, Stepper } from "../components/StatusBadge";
import { servicesCatalog, checklistItems } from "../data/mockData";

const tipoColor  = { info: "#60a5fa", warning: "var(--ag-accent)", success: "#34d399", error: "#f87171" };
const tipoIcono  = { info: "bi-info-circle-fill", warning: "bi-exclamation-triangle-fill", success: "bi-check-circle-fill", error: "bi-x-circle-fill" };

export const VistaCliente = ({ clientes, vehiculos, ordenes, cedula, view = "mi-orden" }) => {
  const [tab, setTab]                   = useState(view);
  const [ordenExpandida, setExpandida]  = useState(null);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  const cliente   = clientes.find((c) => c.cedula === cedula);
  const misVehs   = vehiculos.filter((v) => v.clienteId === cliente?.id);
  const misOrdenes = ordenes.filter((o) => o.clienteId === cliente?.id)
    .sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));
  const ordenActiva = misOrdenes.find((o) => o.estado !== "Finalizado") || null;

  if (!cliente) {
    return (
      <div style={{ animation: "slideUp 0.3s ease" }}>
        <div className="ag-topbar"><h1 className="ag-page-title">Portal del Cliente</h1></div>
        <div className="ag-card">
          <div className="ag-empty">
            <div className="ag-empty-icon"><i className="bi bi-person-x"></i></div>
            <div className="ag-empty-title">Cliente no encontrado</div>
            <p style={{ color: "var(--ag-text-muted)" }}>Cédula: <strong style={{ color: "var(--ag-text)" }}>{cedula}</strong></p>
            <p style={{ fontSize: 13, color: "var(--ag-text-muted)" }}>Prueba con: 1-1234-5678 · 2-9876-5432 · 3-4567-8901</p>
          </div>
        </div>
      </div>
    );
  }

  // Resumen de una orden (usada en Estado y Finalizado)
  const ResumenOrden = ({ o }) => {
    const v       = vehiculos.find((veh) => veh.id === o.vehiculoId);
    const svcs    = o.servicios.map((sid) => servicesCatalog.find((s) => s.id === sid)).filter(Boolean);
    const spSvcs  = o.serviciosPersonalizados || [];
    const problemas = Object.entries(o.checklist || {})
      .filter(([, val]) => val === "problema")
      .map(([id]) => checklistItems.find((x) => x.id === id))
      .filter(Boolean);
    const revisados = Object.values(o.checklist || {}).filter((v) => v === "revisado").length;
    const total = svcs.reduce((s, x) => s + x.precio, 0) + spSvcs.reduce((s, x) => s + (x.precio || 0), 0);

    return (
      <div className="row g-3">
        {/* Card principal */}
        <div className="col-12 col-lg-7">
          <div className="ag-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <h5 className="font-display mb-1" style={{ fontWeight: 700, color: "var(--ag-text)" }}>{v?.marca} {v?.modelo}</h5>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ag-accent)", fontSize: 14 }}>{v?.placa}</span>
                <span style={{ color: "var(--ag-text-muted)", fontSize: 13, marginLeft: 8 }}>· {v?.año}</span>
              </div>
              <StatusBadge estado={o.estado} />
            </div>

            {/* Datos rápidos */}
            <div style={{ display: "flex", gap: 16, background: "var(--ag-dark-3)", borderRadius: 8, padding: "11px 14px", marginBottom: 18, flexWrap: "wrap" }}>
              {[["N° Orden", `#${o.id.slice(-6).toUpperCase()}`, "var(--ag-accent)"],
                ["Ingreso", o.fechaIngreso, "var(--ag-text)"],
                ["Entrega estimada", o.fechaEstimada || "Por definir", "var(--ag-text)"],
                ["Responsable", o.responsable || "Por asignar", "var(--ag-text)"]].map(([l, val, col]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: "var(--ag-text-muted)", marginBottom: 2 }}>{l}</div>
                  <div style={{ fontWeight: 600, color: col, fontSize: 13 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Stepper */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginBottom: 8 }}>Progreso del servicio</div>
              <Stepper estado={o.estado} />
            </div>

            {/* Diagnóstico */}
            {Object.keys(o.checklist || {}).length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginBottom: 8 }}>Resultado del diagnóstico</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "#34d399" }}>{revisados}</div>
                    <div style={{ fontSize: 11, color: "#34d399", opacity: .8 }}>Sin problemas</div>
                  </div>
                  <div style={{ flex: 1, background: problemas.length > 0 ? "rgba(239,68,68,.07)" : "var(--ag-card)", border: `1px solid ${problemas.length > 0 ? "rgba(239,68,68,.25)" : "var(--ag-border)"}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: problemas.length > 0 ? "#f87171" : "var(--ag-text-muted)" }}>{problemas.length}</div>
                    <div style={{ fontSize: 11, color: problemas.length > 0 ? "#f87171" : "var(--ag-text-muted)", opacity: .8 }}>Con observaciones</div>
                  </div>
                </div>
                {problemas.length > 0 && (
                  <div style={{ marginTop: 10, background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#f87171", marginBottom: 7 }}><i className="bi bi-exclamation-triangle-fill me-2"></i>Ítems con observaciones:</div>
                    {problemas.map((item) => (
                      <div key={item.id} style={{ fontSize: 13, color: "#fca5a5", marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}>
                        <i className={`bi ${item.icono}`} style={{ fontSize: 12 }}></i>{item.nombre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Servicios */}
            {(svcs.length > 0 || spSvcs.length > 0) && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginBottom: 8 }}>Servicios de esta orden</div>
                {svcs.map((s) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 11px", background: "var(--ag-dark-3)", borderRadius: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "var(--ag-text)", display: "flex", alignItems: "center", gap: 7 }}><i className="bi bi-wrench-adjustable" style={{ color: "var(--ag-accent)", fontSize: 11 }}></i>{s.nombre}</span>
                    <span style={{ fontSize: 12, color: "var(--ag-text-muted)" }}>{s.duracion}</span>
                  </div>
                ))}
                {spSvcs.map((sp) => (
                  <div key={sp.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 11px", background: "var(--ag-dark-3)", borderRadius: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "var(--ag-text)", display: "flex", alignItems: "center", gap: 7 }}><i className="bi bi-plus-circle" style={{ color: "var(--ag-accent)", fontSize: 11 }}></i>{sp.nombre}{sp.nota && <span style={{ color: "var(--ag-text-muted)", fontSize: 11 }}>— {sp.nota}</span>}</span>
                    <span style={{ fontSize: 12, color: "var(--ag-accent)", fontWeight: 600 }}>₡{(sp.precio || 0).toLocaleString()}</span>
                  </div>
                ))}
                {total > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 11px", borderTop: "1px solid var(--ag-border)", marginTop: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--ag-text-muted)" }}>Total estimado</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--ag-accent)", fontSize: 16 }}>₡{total.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Notas del técnico */}
            {o.observaciones && (
              <div style={{ background: "var(--ag-dark-3)", borderRadius: 8, padding: "11px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--ag-text-muted)", marginBottom: 3 }}><i className="bi bi-chat-left-text me-1"></i>Nota del técnico</div>
                <div style={{ fontSize: 13, color: "var(--ag-text)" }}>{o.observaciones}</div>
              </div>
            )}
            {o.hallazgos && (
              <div style={{ background: "rgba(245,158,11,.07)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 8, padding: "11px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--ag-accent)", marginBottom: 3 }}><i className="bi bi-lightbulb me-1"></i>Hallazgos adicionales</div>
                <div style={{ fontSize: 13, color: "var(--ag-text)" }}>{o.hallazgos}</div>
              </div>
            )}

            {/* Observaciones de cierre (cuando está finalizado) */}
            {o.estado === "Finalizado" && o.observacionesCierre && (
              <div style={{ background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 8, padding: "11px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#34d399", marginBottom: 3 }}><i className="bi bi-check-circle-fill me-1"></i>Resumen final de cierre</div>
                <div style={{ fontSize: 13, color: "var(--ag-text)" }}>{o.observacionesCierre}</div>
              </div>
            )}

            {/* Galería de fotos */}
            {(o.fotos || []).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginBottom: 10 }}><i className="bi bi-camera-fill me-1"></i>Evidencia fotográfica ({o.fotos.length})</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {o.fotos.map((f) => (
                    <div key={f.id} style={{ cursor: "pointer" }} onClick={() => setFotoAmpliada(f)}>
                      <img src={f.dataUrl} alt={f.descripcion || f.nombre} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid var(--ag-border)" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notificaciones */}
        <div className="col-12 col-lg-5">
          <div className="ag-card" style={{ height: "100%" }}>
            <h6 className="font-display" style={{ fontWeight: 700, marginBottom: 16, color: "var(--ag-text)" }}>
              <i className="bi bi-bell-fill me-2" style={{ color: "var(--ag-accent)" }}></i>Notificaciones
            </h6>
            {o.notificaciones.length === 0
              ? <p style={{ color: "var(--ag-text-muted)", fontSize: 13 }}>Sin notificaciones aún.</p>
              : (
                <div className="ag-timeline">
                  {[...o.notificaciones].reverse().map((n, i) => (
                    <div key={i} className="ag-timeline-item">
                      <div className="ag-timeline-dot" style={{ background: tipoColor[n.tipo] || "var(--ag-accent)" }}></div>
                      <div className="ag-timeline-date">{n.fecha}</div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                        <i className={`bi ${tipoIcono[n.tipo] || "bi-info-circle"}`} style={{ color: tipoColor[n.tipo], fontSize: 12, marginTop: 2 }}></i>
                        <div className="ag-timeline-text" style={{ color: "var(--ag-text)" }}>{n.mensaje}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      {/* Banner */}
      <div style={{ background: "linear-gradient(135deg,var(--ag-dark-3),var(--ag-dark-2))", border: "1px solid var(--ag-border)", borderLeft: "4px solid var(--ag-accent)", borderRadius: "var(--radius)", padding: "22px 26px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginBottom: 3 }}>Bienvenido de vuelta</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--ag-text)", margin: 0 }}>{cliente.nombre}</h2>
          <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginTop: 3 }}>
            <i className="bi bi-telephone me-1"></i>{cliente.telefono}
            {cliente.correo && <><span className="mx-2">·</span><i className="bi bi-envelope me-1"></i>{cliente.correo}</>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          {[["Vehículos", misVehs.length, "var(--ag-accent)"], ["Servicios", misOrdenes.length, "#60a5fa"]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: c, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 11, color: "var(--ag-text-muted)", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="ag-tabs">
        <button className={`ag-tab ${tab === "mi-orden" ? "active" : ""}`} onClick={() => setTab("mi-orden")}><i className="bi bi-search me-1"></i>Estado actual</button>
        <button className={`ag-tab ${tab === "vehiculos" ? "active" : ""}`} onClick={() => setTab("vehiculos")}><i className="bi bi-car-front-fill me-1"></i>Mis vehículos</button>
        <button className={`ag-tab ${tab === "historial" ? "active" : ""}`} onClick={() => setTab("historial")}><i className="bi bi-clock-history me-1"></i>Historial</button>
      </div>

      {/* Estado actual */}
      {tab === "mi-orden" && (
        !ordenActiva
          ? <div className="ag-card"><div className="ag-empty"><div className="ag-empty-icon"><i className="bi bi-check-circle"></i></div><div className="ag-empty-title" style={{ color: "var(--ag-text)" }}>Sin servicios activos</div><p style={{ color: "var(--ag-text-muted)" }}>No tienes vehículos en proceso actualmente.</p></div></div>
          : <ResumenOrden o={ordenActiva} />
      )}

      {/* Mis vehículos */}
      {tab === "vehiculos" && (
        <div className="row g-3">
          {misVehs.length === 0
            ? <div className="col-12"><div className="ag-card"><div className="ag-empty"><div className="ag-empty-icon"><i className="bi bi-car-front"></i></div><div className="ag-empty-title" style={{ color: "var(--ag-text)" }}>Sin vehículos registrados</div></div></div></div>
            : misVehs.map((v) => {
              const oVehs  = ordenes.filter((o) => o.vehiculoId === v.id).sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));
              const activa = oVehs.find((o) => o.estado !== "Finalizado");
              return (
                <div key={v.id} className="col-12 col-md-6">
                  <div className="ag-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--ag-accent-light)", border: "1px solid rgba(245,158,11,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ag-accent)", fontSize: 20 }}><i className="bi bi-car-front-fill"></i></div>
                        <div>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ag-text)", fontSize: 14 }}>{v.marca} {v.modelo}</div>
                          <div style={{ fontSize: 12, color: "var(--ag-text-muted)" }}>{v.año} · {v.color}</div>
                        </div>
                      </div>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, background: "var(--ag-dark-3)", padding: "4px 10px", borderRadius: 6, color: "var(--ag-accent)", letterSpacing: ".05em" }}>{v.placa}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1, background: "var(--ag-dark-3)", borderRadius: 8, padding: "9px 11px", textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--ag-accent)" }}>{oVehs.length}</div>
                        <div style={{ fontSize: 11, color: "var(--ag-text-muted)" }}>Visitas</div>
                      </div>
                      <div style={{ flex: 2, background: "var(--ag-dark-3)", borderRadius: 8, padding: "9px 12px" }}>
                        <div style={{ fontSize: 11, color: "var(--ag-text-muted)", marginBottom: 4 }}>Estado actual</div>
                        {activa ? <StatusBadge estado={activa.estado} /> : <span style={{ fontSize: 12, color: "#34d399" }}><i className="bi bi-check-circle-fill me-1"></i>Al día</span>}
                      </div>
                    </div>
                    {oVehs[0] && <div style={{ fontSize: 11, color: "var(--ag-text-muted)" }}><i className="bi bi-calendar3 me-1"></i>Última visita: <span style={{ color: "var(--ag-text)" }}>{oVehs[0].fechaIngreso}</span></div>}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Historial */}
      {tab === "historial" && (
        <div>
          {misOrdenes.length === 0
            ? <div className="ag-card"><div className="ag-empty"><div className="ag-empty-icon"><i className="bi bi-clock-history"></i></div><div className="ag-empty-title" style={{ color: "var(--ag-text)" }}>Sin historial</div></div></div>
            : misOrdenes.map((o) => {
              const v    = vehiculos.find((veh) => veh.id === o.vehiculoId);
              const svcs = o.servicios.map((sid) => servicesCatalog.find((s) => s.id === sid)).filter(Boolean);
              const bc   = o.estado === "Finalizado" ? "var(--ag-success)" : o.estado === "En Proceso" ? "var(--ag-accent)" : "#60a5fa";
              const exp  = ordenExpandida === o.id;
              return (
                <div key={o.id} className="ag-card mb-3" style={{ borderLeft: `3px solid ${bc}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ag-accent)", fontSize: 13 }}>#{o.id.slice(-6).toUpperCase()}</span>
                        <StatusBadge estado={o.estado} />
                      </div>
                      <div style={{ fontWeight: 500, color: "var(--ag-text)" }}>{v?.marca} {v?.modelo} <span style={{ color: "var(--ag-accent)" }}>{v?.placa}</span></div>
                      <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginTop: 2 }}><i className="bi bi-calendar3 me-1"></i>Ingreso: {o.fechaIngreso}{o.responsable && <><span className="mx-2">·</span><i className="bi bi-person-fill me-1"></i>{o.responsable}</>}</div>
                    </div>
                    <button className="ag-btn ag-btn-ghost ag-btn-sm" onClick={() => setExpandida(exp ? null : o.id)}>
                      {exp ? "Ver menos" : "Ver detalles"} <i className={`bi bi-chevron-${exp ? "up" : "down"} ms-1`}></i>
                    </button>
                  </div>
                  {svcs.length > 0 && <div style={{ marginTop: 10 }}>{svcs.map((s) => <span key={s.id} style={{ background: "var(--ag-dark-3)", border: "1px solid var(--ag-border)", borderRadius: 5, padding: "2px 8px", fontSize: 11, color: "var(--ag-text)", margin: "2px" }}>{s.nombre}</span>)}</div>}
                  {exp && (
                    <div style={{ marginTop: 16, borderTop: "1px solid var(--ag-border)", paddingTop: 16 }}>
                      <ResumenOrden o={o} />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Lightbox foto */}
      {fotoAmpliada && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }} onClick={() => setFotoAmpliada(null)}>
          <div style={{ maxWidth: 700, width: "100%", textAlign: "center" }}>
            <img src={fotoAmpliada.dataUrl} alt={fotoAmpliada.descripcion} style={{ width: "100%", borderRadius: 12, marginBottom: 12 }} />
            {fotoAmpliada.descripcion && <div style={{ color: "var(--ag-text)", fontSize: 14 }}>{fotoAmpliada.descripcion}</div>}
            <div style={{ color: "var(--ag-text-muted)", fontSize: 12, marginTop: 4 }}>{fotoAmpliada.fecha} · Toca para cerrar</div>
          </div>
        </div>
      )}
    </div>
  );
};
