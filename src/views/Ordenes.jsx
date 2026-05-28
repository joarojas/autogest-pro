// src/views/Ordenes.jsx
import React, { useState, useEffect, useRef } from "react";
import { StatusBadge, Modal, Stepper } from "../components/StatusBadge";
import { servicesCatalog, checklistItems, ESTADOS, MECANICOS } from "../data/mockData";

const categorias = [...new Set(checklistItems.map((i) => i.categoria))];

// ── Subcomponente: panel de fotos ─────────────────────────────────────────────
const FotosPanel = ({ fotos = [], onAgregar, onRemover, readonly = false }) => {
  const [desc, setDesc]       = useState("");
  const [preview, setPreview] = useState(null);
  const inputRef              = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview({ dataUrl: ev.target.result, nombre: file.name });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const confirmar = () => {
    if (!preview) return;
    onAgregar({ dataUrl: preview.dataUrl, nombre: preview.nombre, descripcion: desc });
    setPreview(null);
    setDesc("");
  };

  return (
    <div>
      {!readonly && (
        <div style={{ marginBottom: 16 }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          {!preview ? (
            <button className="ag-btn ag-btn-ghost ag-btn-sm" onClick={() => inputRef.current.click()}>
              <i className="bi bi-camera-fill"></i> Adjuntar foto / evidencia
            </button>
          ) : (
            <div style={{ background: "var(--ag-dark-3)", border: "1px solid var(--ag-border)", borderRadius: "var(--radius)", padding: 14 }}>
              <img src={preview.dataUrl} alt="preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />
              <div className="ag-form-group" style={{ marginBottom: 10 }}>
                <label className="ag-label">Descripción (opcional)</label>
                <input className="ag-input" placeholder="Ej: Fuga de aceite detectada..." value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="ag-btn ag-btn-primary ag-btn-sm" onClick={confirmar}><i className="bi bi-check-lg"></i> Guardar foto</button>
                <button className="ag-btn ag-btn-ghost ag-btn-sm" onClick={() => setPreview(null)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {fotos.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--ag-text-muted)" }}>No hay fotos adjuntas.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {fotos.map((f) => (
          <div key={f.id} style={{ background: "var(--ag-dark-3)", border: "1px solid var(--ag-border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <img src={f.dataUrl} alt={f.nombre} style={{ width: "100%", height: 100, objectFit: "cover" }} />
            <div style={{ padding: "8px 10px" }}>
              {f.descripcion && <div style={{ fontSize: 11, color: "var(--ag-text)", marginBottom: 2 }}>{f.descripcion}</div>}
              <div style={{ fontSize: 10, color: "var(--ag-text-muted)" }}>{f.fecha}</div>
              {!readonly && (
                <button onClick={() => onRemover(f.id)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: 11, padding: "2px 0", marginTop: 3 }}>
                  <i className="bi bi-trash3"></i> Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Subcomponente: cierre de OS ───────────────────────────────────────────────
const CierreModal = ({ orden, cliente, vehiculo, onConfirmar, onClose }) => {
  const [obs, setObs] = useState(orden.observacionesCierre || "");
  return (
    <Modal show title="Cerrar Orden de Servicio" onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
          <button className="ag-btn ag-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="ag-btn ag-btn-success" onClick={() => onConfirmar(obs)}>
            <i className="bi bi-check-circle-fill"></i> Confirmar cierre
          </button>
        </div>
      }
    >
      <div style={{ background: "var(--ag-accent-light)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "var(--radius)", padding: "14px 16px", marginBottom: 20, fontSize: 13 }}>
        <i className="bi bi-info-circle me-2 text-accent"></i>
        Al cerrar la OS, el estado cambia a <strong style={{ color: "var(--ag-accent)" }}>Finalizado</strong> y se notifica al cliente que su vehículo está listo.
      </div>

      <div style={{ background: "var(--ag-dark-3)", borderRadius: "var(--radius)", padding: "14px 16px", marginBottom: 18 }}>
        {[["Orden", orden.id.slice(-8).toUpperCase()], ["Cliente", cliente?.nombre], ["Vehículo", `${vehiculo?.marca} ${vehiculo?.modelo}`], ["Placa", vehiculo?.placa], ["Servicios realizados", orden.servicios.length + (orden.serviciosPersonalizados?.length || 0)]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
            <span style={{ color: "var(--ag-text-muted)" }}>{k}</span>
            <span style={{ fontWeight: 500, color: "var(--ag-text)" }}>{v}</span>
          </div>
        ))}
      </div>

      <div className="ag-form-group">
        <label className="ag-label">Observaciones finales para el cliente</label>
        <textarea className="ag-textarea" rows={4} placeholder="Describa los trabajos realizados, recomendaciones y estado final del vehículo..." value={obs} onChange={(e) => setObs(e.target.value)} />
      </div>
    </Modal>
  );
};

// ── Vista principal ───────────────────────────────────────────────────────────
export const Ordenes = ({
  clientes, vehiculos, ordenes,
  onCambiarEstado, onAgregarServicio, onRemoverServicio,
  onActualizarChecklist, onActualizarOrden,
  onAgregarServicioPersonalizado, onRemoverServicioPersonalizado,
  onAgregarNotificacion,
  onAgregarFoto, onRemoverFoto,
  selectedOrdenId, onNavigate,
}) => {
  const [filtroEstado, setFiltroEstado]     = useState("Todos");
  const [busqueda, setBusqueda]             = useState("");
  const [ordenSeleccionada, setOrdenSel]    = useState(null);
  const [tab, setTab]                       = useState("info");
  const [observaciones, setObservaciones]   = useState("");
  const [hallazgos, setHallazgos]           = useState("");
  const [savingObs, setSavingObs]           = useState(false);
  const [showCierre, setShowCierre]         = useState(false);

  // Servicio personalizado form
  const [spNombre, setSpNombre] = useState("");
  const [spPrecio, setSpPrecio] = useState("");
  const [spNota,   setSpNota]   = useState("");

  // Notificación manual
  const [notifMsg, setNotifMsg] = useState("");
  const [notifTipo, setNotifTipo] = useState("warning");

  const lastOrderId = useRef(null);
  const tabRef      = useRef("info");
  const handleSetTab = (t) => { setTab(t); tabRef.current = t; };

  useEffect(() => {
    if (selectedOrdenId) {
      const o = ordenes.find((x) => x.id === selectedOrdenId);
      if (o) { setOrdenSel(o); handleSetTab("info"); lastOrderId.current = null; }
    }
  }, [selectedOrdenId]); // eslint-disable-line

  useEffect(() => {
    if (ordenSeleccionada) {
      const updated = ordenes.find((o) => o.id === ordenSeleccionada.id);
      if (updated) setOrdenSel(updated);
    }
  }, [ordenes]); // eslint-disable-line

  useEffect(() => {
    if (ordenSeleccionada && ordenSeleccionada.id !== lastOrderId.current) {
      lastOrderId.current = ordenSeleccionada.id;
      setObservaciones(ordenSeleccionada.observaciones || "");
      setHallazgos(ordenSeleccionada.hallazgos || "");
    }
  }, [ordenSeleccionada]);

  const filtradas = ordenes.filter((o) => {
    const c = clientes.find((x) => x.id === o.clienteId);
    const v = vehiculos.find((x) => x.id === o.vehiculoId);
    return (filtroEstado === "Todos" || o.estado === filtroEstado) &&
      (!busqueda || c?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        v?.placa.toLowerCase().includes(busqueda.toLowerCase()) || o.id.includes(busqueda));
  }).sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));

  const guardarObservaciones = () => {
    setSavingObs(true);
    onActualizarOrden(ordenSeleccionada.id, { observaciones, hallazgos });
    setTimeout(() => setSavingObs(false), 700);
  };

  const handleCierreConfirmar = (obsFinales) => {
    onActualizarOrden(ordenSeleccionada.id, { observacionesCierre: obsFinales });
    onCambiarEstado(ordenSeleccionada.id, ESTADOS.FINALIZADO);
    setShowCierre(false);
  };

  const handleEnviarNotif = () => {
    if (!notifMsg.trim()) return;
    onAgregarNotificacion(ordenSeleccionada.id, notifMsg.trim(), notifTipo);
    setNotifMsg("");
  };

  const handleAgregarSP = () => {
    if (!spNombre.trim()) return;
    onAgregarServicioPersonalizado(ordenSeleccionada.id, {
      nombre: spNombre.trim(),
      precio: parseInt(spPrecio) || 0,
      nota: spNota.trim(),
    });
    setSpNombre(""); setSpPrecio(""); setSpNota("");
  };

  const cliente  = clientes.find((c) => c.id === ordenSeleccionada?.clienteId);
  const vehiculo = vehiculos.find((v) => v.id === ordenSeleccionada?.vehiculoId);
  const checkDone      = ordenSeleccionada ? Object.keys(ordenSeleccionada.checklist).length : 0;
  const checkProblemas = ordenSeleccionada ? Object.values(ordenSeleccionada.checklist).filter((v) => v === "problema").length : 0;

  const totalCatalogo = ordenSeleccionada?.servicios.reduce((s, id) => s + (servicesCatalog.find((x) => x.id === id)?.precio || 0), 0) || 0;
  const totalPersonal = (ordenSeleccionada?.serviciosPersonalizados || []).reduce((s, sp) => s + (sp.precio || 0), 0);
  const totalGeneral  = totalCatalogo + totalPersonal;

  const tipoColor = { info: "#60a5fa", warning: "var(--ag-accent)", success: "#34d399", error: "#f87171" };

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      <div className="ag-topbar">
        <div>
          <h1 className="ag-page-title">Órdenes de Servicio</h1>
          <p className="ag-page-subtitle">{ordenes.length} órdenes en total</p>
        </div>
        <button className="ag-btn ag-btn-primary" onClick={() => onNavigate("registro")}>
          <i className="bi bi-plus-lg"></i> Nueva OS
        </button>
      </div>

      {/* Filtros */}
      <div className="ag-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="ag-search-wrap">
              <i className="bi bi-search"></i>
              <input className="ag-input" placeholder="Buscar por cliente, placa o N° orden..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
          </div>
          <div className="col-12 col-md-7">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Todos", ESTADOS.RECIBIDO, ESTADOS.EN_PROCESO, ESTADOS.FINALIZADO].map((e) => (
                <button key={e} onClick={() => setFiltroEstado(e)}
                  className={`ag-btn ag-btn-sm ${filtroEstado === e ? "ag-btn-primary" : "ag-btn-ghost"}`}>{e}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="ag-card">
        {filtradas.length === 0 ? (
          <div className="ag-empty"><div className="ag-empty-icon"><i className="bi bi-file-earmark-x"></i></div><div className="ag-empty-title">Sin órdenes</div></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="ag-table">
              <thead><tr><th>N° Orden</th><th>Cliente</th><th>Vehículo</th><th>Responsable</th><th>Ingreso</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {filtradas.map((orden) => {
                  const c = clientes.find((x) => x.id === orden.clienteId);
                  const v = vehiculos.find((x) => x.id === orden.vehiculoId);
                  return (
                    <tr key={orden.id} onClick={() => { lastOrderId.current = null; setOrdenSel(orden); handleSetTab("info"); }} style={{ cursor: "pointer" }}>
                      <td><span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--ag-accent)" }}>#{orden.id.slice(-6).toUpperCase()}</span></td>
                      <td><div style={{ fontWeight: 500, color: "var(--ag-text)" }}>{c?.nombre || "—"}</div><div style={{ fontSize: 12, color: "var(--ag-text-muted)" }}>{c?.telefono}</div></td>
                      <td><div style={{ color: "var(--ag-text)" }}>{v?.marca} {v?.modelo}</div><div style={{ fontSize: 12, color: "var(--ag-accent)", fontWeight: 600 }}>{v?.placa}</div></td>
                      <td style={{ fontSize: 13, color: "var(--ag-text-muted)" }}>{orden.responsable || "—"}</td>
                      <td style={{ fontSize: 13, color: "var(--ag-text-muted)" }}>{orden.fechaIngreso}</td>
                      <td><StatusBadge estado={orden.estado} /></td>
                      <td><button className="ag-btn ag-btn-ghost ag-btn-sm ag-btn-icon"><i className="bi bi-chevron-right"></i></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {ordenSeleccionada && (
        <Modal show size="lg" title={`Orden #${ordenSeleccionada.id.slice(-6).toUpperCase()}`}
          onClose={() => { setOrdenSel(null); lastOrderId.current = null; onNavigate("ordenes"); }}
          footer={
            <div className="d-flex align-items-center gap-2 w-100">
              {ordenSeleccionada.estado === ESTADOS.RECIBIDO && (
                <button className="ag-btn ag-btn-primary ms-auto" onClick={() => onCambiarEstado(ordenSeleccionada.id, ESTADOS.EN_PROCESO)}>
                  <i className="bi bi-gear-fill"></i> Iniciar proceso
                </button>
              )}
              {ordenSeleccionada.estado === ESTADOS.EN_PROCESO && (
                <button className="ag-btn ag-btn-success ms-auto" onClick={() => setShowCierre(true)}>
                  <i className="bi bi-check-circle-fill"></i> Cerrar y finalizar OS
                </button>
              )}
              {ordenSeleccionada.estado === ESTADOS.FINALIZADO && (
                <span style={{ color: "#34d399", fontSize: 13, marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="bi bi-check-circle-fill"></i> Orden completada y cerrada
                </span>
              )}
            </div>
          }
        >
          <div className="mb-4"><Stepper estado={ordenSeleccionada.estado} /></div>

          {/* Info rápida */}
          <div className="row g-2 mb-4">
            {[
              { icon: "bi-person-fill", label: cliente?.nombre, sub: cliente?.cedula },
              { icon: "bi-car-front-fill", label: `${vehiculo?.marca} ${vehiculo?.modelo}`, sub: vehiculo?.placa, accent: true },
              { icon: "bi-person-badge-fill", label: ordenSeleccionada.responsable || "Sin asignar", sub: "Responsable" },
              { icon: "bi-calendar-check", label: ordenSeleccionada.fechaEstimada || "Por definir", sub: "Fecha estimada" },
            ].map(({ icon, label, sub, accent }, i) => (
              <div key={i} className="col-6 col-md-3">
                <div style={{ background: "var(--ag-dark-3)", borderRadius: 8, padding: "11px 13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <i className={`bi ${icon}`} style={{ color: accent ? "var(--ag-accent)" : "var(--ag-text-muted)", fontSize: 13 }}></i>
                    <span style={{ fontWeight: 500, fontSize: 12, color: "var(--ag-text)" }}>{label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: accent ? "var(--ag-accent)" : "var(--ag-text-muted)", paddingLeft: 20, fontWeight: accent ? 600 : 400 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="ag-tabs">
            {[["info","Información","bi-info-circle"],["checklist","Diagnóstico","bi-clipboard2-check"],["servicios","Servicios","bi-tools"],["fotos","Evidencia","bi-camera-fill"],["notifs","Notificaciones","bi-bell-fill"],["historial","Historial","bi-clock-history"]].map(([id, label, icon]) => (
              <button key={id} className={`ag-tab ${tab === id ? "active" : ""}`} onClick={() => handleSetTab(id)}>
                <i className={`bi ${icon} me-1`}></i>{label}
                {id === "checklist" && checkProblemas > 0 && <span style={{ marginLeft: 5, background: "rgba(239,68,68,.2)", color: "#f87171", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 600 }}>{checkProblemas}</span>}
                {id === "fotos" && (ordenSeleccionada.fotos?.length > 0) && <span style={{ marginLeft: 5, background: "var(--ag-accent-light)", color: "var(--ag-accent)", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 600 }}>{ordenSeleccionada.fotos.length}</span>}
              </button>
            ))}
          </div>

          {/* ── Tab: Información ── */}
          {tab === "info" && (
            <div>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="ag-label">Responsable</label>
                  <select className="ag-select"
                    value={ordenSeleccionada.responsable || ""}
                    onChange={(e) => onActualizarOrden(ordenSeleccionada.id, { responsable: e.target.value })}>
                    <option value="">— Sin asignar —</option>
                    {MECANICOS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="ag-label">Fecha estimada de entrega</label>
                  <input type="date" className="ag-input"
                    value={ordenSeleccionada.fechaEstimada || ""}
                    onChange={(e) => onActualizarOrden(ordenSeleccionada.id, { fechaEstimada: e.target.value })} />
                </div>
              </div>
              <div className="ag-form-group">
                <label className="ag-label">Observaciones técnicas</label>
                <textarea className="ag-textarea" rows={3} placeholder="Descripción general del estado del vehículo..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>
              <div className="ag-form-group">
                <label className="ag-label">Hallazgos imprevistos</label>
                <textarea className="ag-textarea" rows={3} placeholder="Anotar problemas adicionales encontrados..." value={hallazgos} onChange={(e) => setHallazgos(e.target.value)} />
              </div>
              {ordenSeleccionada.estado === ESTADOS.FINALIZADO && ordenSeleccionada.observacionesCierre && (
                <div style={{ background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.25)", borderRadius: "var(--radius)", padding: "13px 16px", marginTop: 4 }}>
                  <div style={{ fontSize: 12, color: "#34d399", marginBottom: 5, fontWeight: 600 }}><i className="bi bi-check-circle-fill me-1"></i>Observaciones de cierre</div>
                  <div style={{ fontSize: 14, color: "var(--ag-text)" }}>{ordenSeleccionada.observacionesCierre}</div>
                </div>
              )}
              <button className="ag-btn ag-btn-primary ag-btn-sm mt-2" onClick={guardarObservaciones} disabled={savingObs}>
                {savingObs ? <><i className="bi bi-check-lg"></i> Guardado</> : <><i className="bi bi-floppy-fill"></i> Guardar</>}
              </button>
            </div>
          )}

          {/* ── Tab: Diagnóstico ── */}
          {tab === "checklist" && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: "var(--ag-text-muted)" }}><i className="bi bi-check-circle-fill" style={{ color: "#34d399", marginRight: 4 }}></i>{checkDone} revisados</span>
                <span style={{ fontSize: 13, color: "var(--ag-text-muted)" }}><i className="bi bi-exclamation-triangle-fill" style={{ color: "#f87171", marginRight: 4 }}></i>{checkProblemas} problemas</span>
              </div>
              {categorias.map((cat) => (
                <div key={cat} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ag-text-muted)", marginBottom: 8 }}>{cat}</div>
                  {checklistItems.filter((item) => item.categoria === cat).map((item) => {
                    const estado = ordenSeleccionada.checklist[item.id];
                    return (
                      <div key={item.id} className={`ag-checklist-item ${estado || ""}`}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <i className={`bi ${item.icono}`} style={{ fontSize: 15, color: estado === "revisado" ? "#34d399" : estado === "problema" ? "#f87171" : "var(--ag-text-muted)" }}></i>
                          <span style={{ fontSize: 14, color: "var(--ag-text)" }}>{item.nombre}</span>
                        </div>
                        <div className="ag-checklist-toggle">
                          <button className={`ag-check-btn ok ${estado === "revisado" ? "active" : ""}`} onClick={() => onActualizarChecklist(ordenSeleccionada.id, item.id, estado === "revisado" ? null : "revisado")}><i className="bi bi-check-lg me-1"></i>OK</button>
                          <button className={`ag-check-btn problem ${estado === "problema" ? "active" : ""}`} onClick={() => onActualizarChecklist(ordenSeleccionada.id, item.id, estado === "problema" ? null : "problema")}><i className="bi bi-exclamation-lg me-1"></i>Prob.</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* ── Tab: Servicios ── */}
          {tab === "servicios" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--ag-text-muted)", marginBottom: 14 }}>Selecciona del catálogo o agrega un servicio personalizado:</p>

              {/* Catálogo */}
              {Object.entries(servicesCatalog.reduce((acc, s) => { (acc[s.categoria] = acc[s.categoria] || []).push(s); return acc; }, {})).map(([cat, svcs]) => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ag-text-muted)", marginBottom: 8 }}>{cat}</div>
                  <div>
                    {svcs.map((s) => {
                      const sel = ordenSeleccionada.servicios.includes(s.id);
                      return (
                        <span key={s.id} className={`ag-service-chip ${sel ? "selected" : ""}`}
                          onClick={(e) => { e.stopPropagation(); sel ? onRemoverServicio(ordenSeleccionada.id, s.id) : onAgregarServicio(ordenSeleccionada.id, s.id); }}>
                          {sel && <i className="bi bi-check-lg" style={{ fontSize: 11 }}></i>}
                          {s.nombre}
                          <span style={{ fontSize: 11, color: "var(--ag-text-muted)", marginLeft: 4 }}>₡{s.precio.toLocaleString()}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Servicio personalizado */}
              <hr className="ag-divider" />
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ag-text)", marginBottom: 12 }}><i className="bi bi-plus-circle me-2 text-accent"></i>Agregar servicio personalizado</div>
              <div className="row g-2 mb-2">
                <div className="col-12 col-md-5">
                  <input className="ag-input" placeholder="Nombre del servicio *" value={spNombre} onChange={(e) => setSpNombre(e.target.value)} />
                </div>
                <div className="col-12 col-md-3">
                  <input className="ag-input" placeholder="Precio ₡" type="number" value={spPrecio} onChange={(e) => setSpPrecio(e.target.value)} />
                </div>
                <div className="col-12 col-md-4">
                  <input className="ag-input" placeholder="Nota / descripción" value={spNota} onChange={(e) => setSpNota(e.target.value)} />
                </div>
              </div>
              <button className="ag-btn ag-btn-ghost ag-btn-sm mb-3" onClick={handleAgregarSP} disabled={!spNombre.trim()}>
                <i className="bi bi-plus-lg"></i> Agregar
              </button>

              {/* Resumen */}
              {(ordenSeleccionada.servicios.length > 0 || (ordenSeleccionada.serviciosPersonalizados?.length || 0) > 0) && (
                <div style={{ background: "var(--ag-dark-3)", border: "1px solid var(--ag-border)", borderRadius: "var(--radius)", padding: "16px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ag-text-muted)", marginBottom: 10 }}>Resumen de servicios</div>
                  {ordenSeleccionada.servicios.map((sid) => {
                    const s = servicesCatalog.find((x) => x.id === sid);
                    return s ? (
                      <div key={sid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                        <span style={{ fontSize: 13, color: "var(--ag-text)", display: "flex", alignItems: "center", gap: 7 }}><i className="bi bi-check-circle-fill" style={{ color: "#34d399", fontSize: 11 }}></i>{s.nombre}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: "var(--ag-accent)", fontWeight: 600, fontSize: 13 }}>₡{s.precio.toLocaleString()}</span>
                          <button style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14 }} onClick={() => onRemoverServicio(ordenSeleccionada.id, sid)}><i className="bi bi-x-lg"></i></button>
                        </div>
                      </div>
                    ) : null;
                  })}
                  {(ordenSeleccionada.serviciosPersonalizados || []).map((sp) => (
                    <div key={sp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <span style={{ fontSize: 13, color: "var(--ag-text)", display: "flex", alignItems: "center", gap: 7 }}>
                        <i className="bi bi-plus-circle-fill" style={{ color: "var(--ag-accent)", fontSize: 11 }}></i>{sp.nombre}
                        {sp.nota && <span style={{ fontSize: 11, color: "var(--ag-text-muted)" }}>— {sp.nota}</span>}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--ag-accent)", fontWeight: 600, fontSize: 13 }}>₡{(sp.precio || 0).toLocaleString()}</span>
                        <button style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14 }} onClick={() => onRemoverServicioPersonalizado(ordenSeleccionada.id, sp.id)}><i className="bi bi-x-lg"></i></button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ag-border)", paddingTop: 10, marginTop: 8 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ag-text)" }}>Total estimado</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--ag-accent)" }}>₡{totalGeneral.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Evidencia fotográfica ── */}
          {tab === "fotos" && (
            <FotosPanel
              fotos={ordenSeleccionada.fotos || []}
              onAgregar={(f) => onAgregarFoto(ordenSeleccionada.id, f)}
              onRemover={(fid) => onRemoverFoto(ordenSeleccionada.id, fid)}
              readonly={ordenSeleccionada.estado === ESTADOS.FINALIZADO}
            />
          )}

          {/* ── Tab: Notificaciones ── */}
          {tab === "notifs" && (
            <div>
              {ordenSeleccionada.estado !== ESTADOS.FINALIZADO && (
                <div style={{ background: "var(--ag-dark-3)", borderRadius: "var(--radius)", padding: "14px 16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ag-text)", marginBottom: 10 }}>Enviar notificación al cliente</div>
                  <div className="row g-2">
                    <div className="col-12 col-md-3">
                      <select className="ag-select" value={notifTipo} onChange={(e) => setNotifTipo(e.target.value)}>
                        <option value="info">ℹ️ Información</option>
                        <option value="warning">⚠️ Observación</option>
                        <option value="success">✅ Avance positivo</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-7">
                      <input className="ag-input" placeholder="Escribe el mensaje para el cliente..." value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleEnviarNotif()} />
                    </div>
                    <div className="col-12 col-md-2">
                      <button className="ag-btn ag-btn-primary ag-btn-sm w-100" onClick={handleEnviarNotif} disabled={!notifMsg.trim()}>Enviar</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="ag-timeline">
                {[...ordenSeleccionada.notificaciones].reverse().map((n, i) => (
                  <div key={i} className="ag-timeline-item">
                    <div className="ag-timeline-dot" style={{ background: tipoColor[n.tipo] || "var(--ag-accent)" }}></div>
                    <div className="ag-timeline-date">{n.fecha}</div>
                    <div className="ag-timeline-text" style={{ color: "var(--ag-text)" }}>{n.mensaje}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab: Historial ── */}
          {tab === "historial" && (
            <div className="ag-timeline">
              {[...ordenSeleccionada.notificaciones].reverse().map((n, i) => (
                <div key={i} className="ag-timeline-item">
                  <div className="ag-timeline-dot" style={{ background: tipoColor[n.tipo] || "var(--ag-accent)" }}></div>
                  <div className="ag-timeline-date">{n.fecha}</div>
                  <div className="ag-timeline-text" style={{ color: "var(--ag-text)" }}>{n.mensaje}</div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Modal cierre */}
      {showCierre && ordenSeleccionada && (
        <CierreModal
          orden={ordenSeleccionada}
          cliente={cliente}
          vehiculo={vehiculo}
          onConfirmar={handleCierreConfirmar}
          onClose={() => setShowCierre(false)}
        />
      )}
    </div>
  );
};
