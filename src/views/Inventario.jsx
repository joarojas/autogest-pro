// src/views/Inventario.jsx
import React, { useState, useRef } from "react";
import { Modal } from "../components/StatusBadge";
import { exportarInventarioPDF } from "../services/pdfExport";

const CATEGORIAS = ["Aceites y Lubricantes", "Filtros", "Frenos", "Suspensión", "Herramientas", "Electricidad", "Neumáticos", "Limpieza", "Otros"];

const initialInventario = [
  { id: "i001", nombre: "Aceite 10W-40",         categoria: "Aceites y Lubricantes", cantidad: 24, cantidad_min: 10, unidad: "litro",  precio: 3500,  proveedor: "AutoParts CR",   imagen_url: "", descripcion: "Aceite mineral multiviscoso" },
  { id: "i002", nombre: "Filtro de Aceite",       categoria: "Filtros",              cantidad: 15, cantidad_min: 8,  unidad: "unidad", precio: 4200,  proveedor: "AutoParts CR",   imagen_url: "", descripcion: "Filtro universal compatible" },
  { id: "i003", nombre: "Pastillas de Freno",     categoria: "Frenos",               cantidad: 4,  cantidad_min: 6,  unidad: "juego",  precio: 18000, proveedor: "FrenosTec",      imagen_url: "", descripcion: "Pastillas delanteras cerámicas" },
  { id: "i004", nombre: "Amortiguador Delantero", categoria: "Suspensión",           cantidad: 2,  cantidad_min: 2,  unidad: "unidad", precio: 35000, proveedor: "SuspeCR",        imagen_url: "", descripcion: "Compatible con Toyota/Honda" },
  { id: "i005", nombre: "Llave de Torque",        categoria: "Herramientas",         cantidad: 3,  cantidad_min: 1,  unidad: "unidad", precio: 45000, proveedor: "HerramCR",       imagen_url: "", descripcion: "Rango 20-200 Nm" },
  { id: "i006", nombre: "Filtro de Aire",         categoria: "Filtros",              cantidad: 0,  cantidad_min: 5,  unidad: "unidad", precio: 3800,  proveedor: "AutoParts CR",   imagen_url: "", descripcion: "Filtro de papel universal" },
];

const emptyForm = { nombre: "", categoria: "Aceites y Lubricantes", cantidad: "", cantidad_min: "5", unidad: "unidad", precio: "", proveedor: "", descripcion: "", imagen_url: "" };

export const Inventario = () => {
  const [items, setItems]           = useState(initialInventario);
  const [busqueda, setBusqueda]     = useState("");
  const [catFiltro, setCatFiltro]   = useState("Todas");
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [previewImg, setPreviewImg] = useState(null);
  const [ajusteId, setAjusteId]     = useState(null);
  const [ajusteVal, setAjusteVal]   = useState("");
  const fileRef                     = useRef();

  const filtrados = items.filter((i) => {
    const matchCat = catFiltro === "Todas" || i.categoria === catFiltro;
    const matchBus = !busqueda || i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || i.proveedor?.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBus;
  });

  const bajoStock  = items.filter((i) => i.cantidad > 0 && i.cantidad <= i.cantidad_min).length;
  const agotados   = items.filter((i) => i.cantidad === 0).length;
  const totalValor = items.reduce((s, i) => s + i.cantidad * (i.precio || 0), 0);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPreviewImg(ev.target.result); setForm((f) => ({ ...f, imagen_url: ev.target.result })); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const openNuevo = () => { setForm(emptyForm); setPreviewImg(null); setEditItem(null); setShowModal(true); };
  const openEditar = (item) => { setForm({ ...item }); setPreviewImg(item.imagen_url || null); setEditItem(item); setShowModal(true); };

  const guardar = () => {
    if (!form.nombre.trim()) return;
    const item = { ...form, cantidad: parseInt(form.cantidad) || 0, cantidad_min: parseInt(form.cantidad_min) || 5, precio: parseInt(form.precio) || 0 };
    if (editItem) {
      setItems((p) => p.map((i) => i.id === editItem.id ? { ...i, ...item } : i));
    } else {
      setItems((p) => [...p, { ...item, id: `i${Date.now()}` }]);
    }
    setShowModal(false);
  };

  const eliminar = (id) => setItems((p) => p.filter((i) => i.id !== id));

  const aplicarAjuste = (id, delta) => {
    setItems((p) => p.map((i) => i.id === id ? { ...i, cantidad: Math.max(0, i.cantidad + delta) } : i));
    setAjusteId(null); setAjusteVal("");
  };

  const stockColor = (item) => {
    if (item.cantidad === 0) return { color: "#f87171", bg: "rgba(239,68,68,.12)", label: "Agotado" };
    if (item.cantidad <= item.cantidad_min) return { color: "var(--ag-accent)", bg: "var(--ag-accent-light)", label: "Stock bajo" };
    return { color: "#34d399", bg: "rgba(16,185,129,.1)", label: "OK" };
  };

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      <div className="ag-topbar">
        <div>
          <h1 className="ag-page-title">Inventario</h1>
          <p className="ag-page-subtitle">Control de piezas, herramientas y suministros</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ag-btn ag-btn-ghost" onClick={() => exportarInventarioPDF(items)}>
            <i className="bi bi-file-earmark-pdf-fill"></i> PDF
          </button>
          <button className="ag-btn ag-btn-primary" onClick={openNuevo}>
            <i className="bi bi-plus-lg"></i> Agregar ítem
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        {[
          { val: items.length,  lbl: "Total ítems",    icon: "bi-box-seam-fill",          color: "#60a5fa",        bg: "rgba(59,130,246,.12)"  },
          { val: bajoStock,     lbl: "Stock bajo",      icon: "bi-exclamation-triangle-fill", color: "var(--ag-accent)", bg: "var(--ag-accent-light)" },
          { val: agotados,      lbl: "Agotados",        icon: "bi-x-circle-fill",          color: "#f87171",        bg: "rgba(239,68,68,.12)"   },
          { val: `₡${(totalValor/1000).toFixed(0)}K`, lbl: "Valor total inventario", icon: "bi-currency-dollar", color: "#34d399", bg: "rgba(16,185,129,.12)" },
        ].map((s) => (
          <div key={s.lbl} className="col-6 col-xl-3">
            <div className="ag-stat-card d-flex align-items-center justify-content-between">
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginTop: 4 }}>{s.lbl}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                <i className={`bi ${s.icon}`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas stock bajo */}
      {(bajoStock > 0 || agotados > 0) && (
        <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", borderRadius: "var(--radius)", padding: "13px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f87171", fontSize: 18 }}></i>
          <div>
            <div style={{ fontWeight: 600, color: "#f87171", fontSize: 13 }}>Atención: ítems que requieren reabastecimiento</div>
            <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginTop: 2 }}>
              {agotados > 0 && <span style={{ color: "#f87171" }}>{agotados} agotado(s) &nbsp;</span>}
              {bajoStock > 0 && <span style={{ color: "var(--ag-accent)" }}>{bajoStock} con stock bajo</span>}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="ag-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="ag-search-wrap">
              <i className="bi bi-search"></i>
              <input className="ag-input" placeholder="Buscar por nombre o proveedor..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
          </div>
          <div className="col-12 col-md-7">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Todas", ...CATEGORIAS].slice(0, 6).map((c) => (
                <button key={c} className={`ag-btn ag-btn-sm ${catFiltro === c ? "ag-btn-primary" : "ag-btn-ghost"}`} onClick={() => setCatFiltro(c)}>{c === "Todas" ? "Todas" : c.split(" ")[0]}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de ítems */}
      {filtrados.length === 0 ? (
        <div className="ag-card"><div className="ag-empty"><div className="ag-empty-icon"><i className="bi bi-box-seam"></i></div><div className="ag-empty-title">Sin ítems</div></div></div>
      ) : (
        <div className="row g-3">
          {filtrados.map((item) => {
            const sc = stockColor(item);
            const pct = item.cantidad_min > 0 ? Math.min((item.cantidad / (item.cantidad_min * 2)) * 100, 100) : 100;
            return (
              <div key={item.id} className="col-12 col-md-6 col-xl-4">
                <div className="ag-card" style={{ height: "100%", position: "relative" }}>
                  {/* Imagen */}
                  <div style={{ width: "100%", height: 140, borderRadius: 8, overflow: "hidden", marginBottom: 14, background: "var(--ag-dark-3)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {item.imagen_url
                      ? <img src={item.imagen_url} alt={item.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <i className="bi bi-box-seam" style={{ fontSize: 40, color: "var(--ag-text-muted)", opacity: .4 }}></i>
                    }
                    <span style={{ position: "absolute", top: 8, right: 8, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30`, borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 600 }}>{sc.label}</span>
                  </div>

                  {/* Info */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--ag-text)", marginBottom: 2 }}>{item.nombre}</div>
                      <div style={{ fontSize: 11, color: "var(--ag-text-muted)" }}>{item.categoria}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: sc.color, lineHeight: 1 }}>{item.cantidad}</div>
                      <div style={{ fontSize: 10, color: "var(--ag-text-muted)" }}>{item.unidad}s</div>
                    </div>
                  </div>

                  {/* Barra de stock */}
                  <div style={{ height: 5, background: "var(--ag-dark-3)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: sc.color, borderRadius: 3, transition: "width .4s" }}></div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ag-text-muted)", marginBottom: 12 }}>
                    <span>Mín: {item.cantidad_min} {item.unidad}s</span>
                    {item.proveedor && <span><i className="bi bi-truck me-1"></i>{item.proveedor}</span>}
                    <span style={{ color: "var(--ag-accent)", fontWeight: 600 }}>₡{(item.precio || 0).toLocaleString()}</span>
                  </div>

                  {/* Ajuste rápido */}
                  {ajusteId === item.id ? (
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      <button className="ag-btn ag-btn-ghost ag-btn-sm" style={{ flex: 1 }} onClick={() => aplicarAjuste(item.id, -parseInt(ajusteVal || 1))}>−{ajusteVal || 1}</button>
                      <input className="ag-input" style={{ width: 60, textAlign: "center" }} placeholder="1" value={ajusteVal} onChange={(e) => setAjusteVal(e.target.value.replace(/\D/, ""))} />
                      <button className="ag-btn ag-btn-success ag-btn-sm" style={{ flex: 1 }} onClick={() => aplicarAjuste(item.id, parseInt(ajusteVal || 1))}>+{ajusteVal || 1}</button>
                      <button className="ag-btn ag-btn-ghost ag-btn-sm" onClick={() => setAjusteId(null)}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="ag-btn ag-btn-ghost ag-btn-sm" style={{ flex: 1 }} onClick={() => { setAjusteId(item.id); setAjusteVal(""); }}>
                        <i className="bi bi-arrow-down-up me-1"></i>Ajustar
                      </button>
                      <button className="ag-btn ag-btn-ghost ag-btn-sm ag-btn-icon" onClick={() => openEditar(item)}><i className="bi bi-pencil-fill"></i></button>
                      <button className="ag-btn ag-btn-danger ag-btn-sm ag-btn-icon" onClick={() => eliminar(item.id)}><i className="bi bi-trash3"></i></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal agregar/editar */}
      {showModal && (
        <Modal show size="lg" title={editItem ? "Editar ítem" : "Agregar ítem al inventario"} onClose={() => setShowModal(false)}
          footer={
            <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
              <button className="ag-btn ag-btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="ag-btn ag-btn-primary" onClick={guardar} disabled={!form.nombre.trim()}>
                <i className="bi bi-floppy-fill"></i> {editItem ? "Guardar cambios" : "Agregar"}
              </button>
            </div>
          }
        >
          <div className="row g-3">
            {/* Imagen */}
            <div className="col-12">
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
              <div style={{ width: "100%", height: 160, borderRadius: 8, overflow: "hidden", background: "var(--ag-dark-3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px dashed var(--ag-border)", position: "relative" }}
                onClick={() => fileRef.current.click()}>
                {previewImg
                  ? <img src={previewImg} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ textAlign: "center", color: "var(--ag-text-muted)" }}>
                      <i className="bi bi-camera-fill" style={{ fontSize: 32, marginBottom: 8, display: "block" }}></i>
                      <span style={{ fontSize: 13 }}>Haz clic para subir una imagen</span>
                    </div>
                }
                {previewImg && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: ".15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <span style={{ color: "white", fontSize: 13 }}><i className="bi bi-camera me-1"></i>Cambiar imagen</span>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-8">
              <label className="ag-label">Nombre *</label>
              <input className="ag-input" placeholder="Ej: Aceite 10W-40" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="col-12 col-md-4">
              <label className="ag-label">Categoría</label>
              <select className="ag-select" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-4">
              <label className="ag-label">Cantidad</label>
              <input className="ag-input" type="number" min="0" placeholder="0" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
            </div>
            <div className="col-4">
              <label className="ag-label">Cantidad mínima</label>
              <input className="ag-input" type="number" min="0" placeholder="5" value={form.cantidad_min} onChange={(e) => setForm({ ...form, cantidad_min: e.target.value })} />
            </div>
            <div className="col-4">
              <label className="ag-label">Unidad</label>
              <select className="ag-select" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}>
                {["unidad","litro","kilogramo","juego","par","caja","rollo"].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="col-6">
              <label className="ag-label">Precio unitario (₡)</label>
              <input className="ag-input" type="number" min="0" placeholder="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
            </div>
            <div className="col-6">
              <label className="ag-label">Proveedor</label>
              <input className="ag-input" placeholder="Nombre del proveedor" value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="ag-label">Descripción</label>
              <textarea className="ag-textarea" rows={2} placeholder="Descripción o notas del ítem..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
