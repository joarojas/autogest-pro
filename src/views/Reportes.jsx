// src/views/Reportes.jsx
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { servicesCatalog, ESTADOS } from "../data/mockData";
import { exportarReporteGeneralPDF } from "../services/pdfExport";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--ag-dark-2)", border: "1px solid var(--ag-border)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ color: "var(--ag-text-muted)", fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>{p.name}: {typeof p.value === "number" && p.value > 1000 ? `₡${p.value.toLocaleString()}` : p.value}</p>
      ))}
    </div>
  );
};

export const Reportes = ({ ordenes, clientes, vehiculos }) => {
  const [periodo, setPeriodo] = useState("mes");

  // ── Calcular estadísticas ──────────────────────────────────────────────────
  const totalOrdenes    = ordenes.length;
  const enProceso       = ordenes.filter((o) => o.estado === ESTADOS.EN_PROCESO).length;
  const finalizadas     = ordenes.filter((o) => o.estado === ESTADOS.FINALIZADO).length;
  const recibidas       = ordenes.filter((o) => o.estado === ESTADOS.RECIBIDO).length;

  const ingresoTotal = ordenes.reduce((sum, o) => {
    const cat = (o.servicios || []).reduce((s, sid) => s + (servicesCatalog.find((x) => x.id === sid)?.precio || 0), 0);
    const cust = (o.serviciosPersonalizados || []).reduce((s, sp) => s + (sp.precio || 0), 0);
    return sum + cat + cust;
  }, 0);

  // Órdenes por estado (pie)
  const estadoData = [
    { name: "Recibido", value: recibidas },
    { name: "En Proceso", value: enProceso },
    { name: "Finalizado", value: finalizadas },
  ].filter((d) => d.value > 0);

  // Servicios más usados (bar)
  const serviciosCount = {};
  ordenes.forEach((o) => {
    (o.servicios || []).forEach((sid) => {
      const s = servicesCatalog.find((x) => x.id === sid);
      if (s) serviciosCount[s.nombre] = (serviciosCount[s.nombre] || 0) + 1;
    });
  });
  const serviciosData = Object.entries(serviciosCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([nombre, count]) => ({ nombre: nombre.length > 20 ? nombre.slice(0, 18) + "…" : nombre, count }));

  // Ingresos simulados por mes (últimos 6 meses)
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const ingresosData = meses.map((mes, i) => ({
    mes,
    ingresos: Math.floor(ingresoTotal * (0.6 + Math.random() * 0.8) / 6),
    ordenes: Math.floor(totalOrdenes * (0.5 + Math.random() * 1) / 6),
  }));

  // Mecánicos más activos
  const mecanicosCount = {};
  ordenes.forEach((o) => {
    if (o.responsable) mecanicosCount[o.responsable] = (mecanicosCount[o.responsable] || 0) + 1;
  });
  const mecanicosData = Object.entries(mecanicosCount)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, count]) => ({ nombre, count }));

  const pctFinalizado = totalOrdenes > 0 ? Math.round((finalizadas / totalOrdenes) * 100) : 0;

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      <div className="ag-topbar">
        <div>
          <h1 className="ag-page-title">Reportes y Estadísticas</h1>
          <p className="ag-page-subtitle">Análisis del rendimiento del taller</p>
        </div>
        <button className="ag-btn ag-btn-primary" onClick={() => exportarReporteGeneralPDF(ordenes, clientes, vehiculos)}>
          <i className="bi bi-file-earmark-pdf-fill"></i> Exportar PDF
        </button>
      </div>

      {/* KPIs principales */}
      <div className="row g-3 mb-4">
        {[
          { val: totalOrdenes, lbl: "Órdenes totales",   icon: "bi-file-earmark-text-fill", color: "#60a5fa",   bg: "rgba(59,130,246,.12)"  },
          { val: enProceso,    lbl: "En proceso",         icon: "bi-gear-fill",              color: "var(--ag-accent)", bg: "var(--ag-accent-light)" },
          { val: finalizadas,  lbl: "Finalizadas",        icon: "bi-check-circle-fill",      color: "#34d399",   bg: "rgba(16,185,129,.12)" },
          { val: `${pctFinalizado}%`, lbl: "Tasa de cierre", icon: "bi-graph-up-arrow",    color: "#a78bfa",   bg: "rgba(139,92,246,.12)" },
          { val: clientes.length, lbl: "Clientes",        icon: "bi-people-fill",            color: "#60a5fa",   bg: "rgba(59,130,246,.12)"  },
          { val: `₡${(ingresoTotal/1000).toFixed(0)}K`, lbl: "Ingreso estimado", icon: "bi-currency-dollar", color: "#34d399", bg: "rgba(16,185,129,.12)" },
        ].map((s) => (
          <div key={s.lbl} className="col-6 col-xl-2">
            <div className="ag-stat-card">
              <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, marginBottom: 10 }}>
                <i className={`bi ${s.icon}`}></i>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "var(--ag-text-muted)", marginTop: 4 }}>{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficas fila 1 */}
      <div className="row g-3 mb-3">
        {/* Ingresos por mes */}
        <div className="col-12 col-lg-8">
          <div className="ag-card">
            <h6 className="font-display mb-4" style={{ fontWeight: 700, fontSize: 15 }}>
              <i className="bi bi-graph-up me-2 text-accent"></i>Ingresos y Órdenes por Mes
            </h6>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ingresosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Line type="monotone" dataKey="ingresos" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: "#f59e0b", r: 4 }} name="Ingresos ₡" />
                <Line type="monotone" dataKey="ordenes" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4 }} name="Órdenes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Órdenes por estado (pie) */}
        <div className="col-12 col-lg-4">
          <div className="ag-card" style={{ height: "100%" }}>
            <h6 className="font-display mb-4" style={{ fontWeight: 700, fontSize: 15 }}>
              <i className="bi bi-pie-chart-fill me-2 text-accent"></i>Distribución de Estado
            </h6>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={estadoData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {estadoData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {estadoData.map((d, i) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i] }}></div>
                    <span style={{ color: "var(--ag-text-muted)" }}>{d.name}</span>
                  </div>
                  <span style={{ color: "var(--ag-text)", fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas fila 2 */}
      <div className="row g-3">
        {/* Servicios más usados */}
        <div className="col-12 col-lg-7">
          <div className="ag-card">
            <h6 className="font-display mb-4" style={{ fontWeight: 700, fontSize: 15 }}>
              <i className="bi bi-tools me-2 text-accent"></i>Servicios Más Solicitados
            </h6>
            {serviciosData.length === 0 ? (
              <p style={{ color: "var(--ag-text-muted)", fontSize: 13 }}>Aún no hay datos suficientes.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={serviciosData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="nombre" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Veces solicitado" radius={[0, 4, 4, 0]}>
                    {serviciosData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Mecánicos */}
        <div className="col-12 col-lg-5">
          <div className="ag-card" style={{ height: "100%" }}>
            <h6 className="font-display mb-4" style={{ fontWeight: 700, fontSize: 15 }}>
              <i className="bi bi-person-badge-fill me-2 text-accent"></i>Rendimiento por Mecánico
            </h6>
            {mecanicosData.length === 0 ? (
              <p style={{ color: "var(--ag-text-muted)", fontSize: 13 }}>Asigna responsables a las órdenes para ver estadísticas.</p>
            ) : (
              mecanicosData.map((m, i) => {
                const pct = mecanicosData[0].count > 0 ? (m.count / mecanicosData[0].count) * 100 : 0;
                return (
                  <div key={m.nombre} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "var(--ag-text)" }}>{m.nombre}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: COLORS[i % COLORS.length] }}>{m.count} OS</span>
                    </div>
                    <div style={{ height: 6, background: "var(--ag-dark-3)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: COLORS[i % COLORS.length], borderRadius: 3, transition: "width .4s" }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
