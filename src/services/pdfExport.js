// src/services/pdfExport.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { servicesCatalog } from "../data/mockData";

const GOLD = [245, 158, 11];
const DARK = [10, 15, 30];
const GRAY = [100, 116, 139];

function header(doc, title, subtitle) {
  // Fondo header
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 32, "F");
  // Logo mark
  doc.setFillColor(...GOLD);
  doc.roundedRect(14, 8, 16, 16, 3, 3, "F");
  doc.setTextColor(10, 15, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("A", 22, 19, { align: "center" });
  // Nombre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("AutoGest Pro", 34, 14);
  doc.setFontSize(8);
  doc.setTextColor(...GRAY.map((x) => Math.min(x + 80, 255)));
  doc.text("Sistema de Gestión de Taller Mecánico", 34, 20);
  // Título del documento
  doc.setTextColor(...GOLD);
  doc.setFontSize(10);
  doc.text(title, 196, 14, { align: "right" });
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(8);
  doc.text(subtitle, 196, 20, { align: "right" });
  // Línea dorada
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(0, 32, 210, 32);
}

function footer(doc) {
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`AutoGest Pro © ${new Date().getFullYear()} — Generado el ${new Date().toLocaleDateString("es-CR")}`, 14, 290);
    doc.text(`Página ${i} de ${pages}`, 196, 290, { align: "right" });
  }
}

// ── Exportar Orden Individual ─────────────────────────────────────────────────
export function exportarOrdenPDF(orden, cliente, vehiculo) {
  const doc = new jsPDF();
  header(doc, `Orden #${orden.id.slice(-8).toUpperCase()}`, `Estado: ${orden.estado}`);

  let y = 42;

  // Info general
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(14, y, 182, 52, 3, 3, "F");

  const col1 = 20, col2 = 110;
  doc.setFontSize(9);

  const infoLeft = [
    ["Cliente", cliente?.nombre || "—"],
    ["Cédula", cliente?.cedula || "—"],
    ["Teléfono", cliente?.telefono || "—"],
    ["Correo", cliente?.correo || "—"],
  ];
  const infoRight = [
    ["Vehículo", `${vehiculo?.marca} ${vehiculo?.modelo}`],
    ["Placa", vehiculo?.placa || "—"],
    ["Año", vehiculo?.año?.toString() || "—"],
    ["Color", vehiculo?.color || "—"],
  ];

  infoLeft.forEach(([k, v], i) => {
    doc.setFont("helvetica", "bold"); doc.setTextColor(...GRAY); doc.text(k + ":", col1, y + 10 + i * 10);
    doc.setFont("helvetica", "normal"); doc.setTextColor(240, 240, 240); doc.text(v, col1 + 22, y + 10 + i * 10);
  });
  infoRight.forEach(([k, v], i) => {
    doc.setFont("helvetica", "bold"); doc.setTextColor(...GRAY); doc.text(k + ":", col2, y + 10 + i * 10);
    doc.setFont("helvetica", "normal"); doc.setTextColor(240, 240, 240); doc.text(v, col2 + 22, y + 10 + i * 10);
  });

  y += 58;

  // Detalle OS
  const detalles = [
    ["Fecha de ingreso", orden.fechaIngreso || "—"],
    ["Fecha estimada", orden.fechaEstimada || "Por definir"],
    ["Responsable", orden.responsable || "Sin asignar"],
  ];
  autoTable(doc, {
    startY: y,
    head: [["Campo", "Valor"]],
    body: detalles,
    styles: { fillColor: [17, 24, 39], textColor: [241, 245, 249], fontSize: 9 },
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [30, 41, 59] },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 8;

  // Servicios
  const svcsRows = [
    ...(orden.servicios || []).map((sid) => {
      const s = servicesCatalog.find((x) => x.id === sid);
      return s ? [s.nombre, s.categoria, s.duracion, `₡${s.precio.toLocaleString()}`] : null;
    }).filter(Boolean),
    ...(orden.serviciosPersonalizados || []).map((sp) => [sp.nombre, "Personalizado", "—", `₡${(sp.precio || 0).toLocaleString()}`]),
  ];

  if (svcsRows.length > 0) {
    const total = [
      ...(orden.servicios || []).map((sid) => servicesCatalog.find((x) => x.id === sid)?.precio || 0),
      ...(orden.serviciosPersonalizados || []).map((sp) => sp.precio || 0),
    ].reduce((a, b) => a + b, 0);

    autoTable(doc, {
      startY: y,
      head: [["Servicio", "Categoría", "Duración", "Precio"]],
      body: svcsRows,
      foot: [["", "", "TOTAL", `₡${total.toLocaleString()}`]],
      styles: { fillColor: [17, 24, 39], textColor: [241, 245, 249], fontSize: 9 },
      headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: "bold" },
      footStyles: { fillColor: [30, 41, 59], textColor: GOLD, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [30, 41, 59] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Observaciones
  if (orden.observaciones || orden.hallazgos || orden.observacionesCierre) {
    doc.addPage();
    header(doc, `Orden #${orden.id.slice(-8).toUpperCase()}`, "Observaciones técnicas");
    y = 42;

    [["Observaciones técnicas", orden.observaciones], ["Hallazgos imprevistos", orden.hallazgos], ["Observaciones de cierre", orden.observacionesCierre]].forEach(([titulo, texto]) => {
      if (!texto) return;
      doc.setFont("helvetica", "bold"); doc.setTextColor(...GOLD); doc.setFontSize(10);
      doc.text(titulo, 14, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setTextColor(200, 200, 200); doc.setFontSize(9);
      const lines = doc.splitTextToSize(texto, 180);
      doc.text(lines, 14, y); y += lines.length * 5 + 8;
    });
  }

  footer(doc);
  doc.save(`OS-${orden.id.slice(-8).toUpperCase()}.pdf`);
}

// ── Exportar Reporte General ──────────────────────────────────────────────────
export function exportarReporteGeneralPDF(ordenes, clientes, vehiculos) {
  const doc = new jsPDF("landscape");
  header(doc, "Reporte General", `Generado: ${new Date().toLocaleDateString("es-CR")}`);

  const stats = {
    total: ordenes.length,
    recibidas: ordenes.filter((o) => o.estado === "Recibido").length,
    proceso: ordenes.filter((o) => o.estado === "En Proceso").length,
    finalizadas: ordenes.filter((o) => o.estado === "Finalizado").length,
  };

  // Stats boxes
  let bx = 14;
  [["Total OS", stats.total, [59,130,246]], ["Recibidas", stats.recibidas, [59,130,246]], ["En Proceso", stats.proceso, GOLD], ["Finalizadas", stats.finalizadas, [16,185,129]]].forEach(([l, v, c]) => {
    doc.setFillColor(17, 24, 39); doc.roundedRect(bx, 38, 60, 22, 3, 3, "F");
    doc.setTextColor(...c); doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text(String(v), bx + 30, 50, { align: "center" });
    doc.setFontSize(8); doc.setTextColor(...GRAY); doc.text(l, bx + 30, 56, { align: "center" });
    bx += 64;
  });

  const rows = ordenes.map((o) => {
    const c = clientes.find((x) => x.id === o.clienteId);
    const v = vehiculos.find((x) => x.id === o.vehiculoId);
    const total = (o.servicios || []).reduce((s, sid) => s + (servicesCatalog.find((x) => x.id === sid)?.precio || 0), 0)
      + (o.serviciosPersonalizados || []).reduce((s, sp) => s + (sp.precio || 0), 0);
    return [
      `#${o.id.slice(-6).toUpperCase()}`,
      c?.nombre || "—",
      v ? `${v.marca} ${v.modelo}` : "—",
      v?.placa || "—",
      o.estado,
      o.fechaIngreso || "—",
      o.responsable || "—",
      `₡${total.toLocaleString()}`,
    ];
  });

  autoTable(doc, {
    startY: 66,
    head: [["N° Orden", "Cliente", "Vehículo", "Placa", "Estado", "Ingreso", "Responsable", "Total"]],
    body: rows,
    styles: { fillColor: [17, 24, 39], textColor: [241, 245, 249], fontSize: 8 },
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [30, 41, 59] },
    didParseCell: (data) => {
      if (data.column.index === 4) {
        const colors = { Recibido: [59,130,246], "En Proceso": GOLD, Finalizado: [16,185,129] };
        data.cell.styles.textColor = colors[data.cell.raw] || GRAY;
      }
    },
  });

  footer(doc);
  doc.save(`Reporte-AutoGest-${new Date().toISOString().split("T")[0]}.pdf`);
}

// ── Exportar Inventario ───────────────────────────────────────────────────────
export function exportarInventarioPDF(items) {
  const doc = new jsPDF();
  header(doc, "Inventario del Taller", `${items.length} ítems registrados`);

  const bajoStock = items.filter((i) => i.cantidad <= i.cantidad_min);
  if (bajoStock.length > 0) {
    doc.setFillColor(239, 68, 68, 0.2);
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(14, 38, 182, 12, 2, 2, "FD");
    doc.setTextColor(239, 68, 68); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text(`⚠ ${bajoStock.length} ítem(s) con stock bajo o agotado`, 18, 46);
  }

  autoTable(doc, {
    startY: bajoStock.length > 0 ? 56 : 42,
    head: [["Ítem", "Categoría", "Cantidad", "Mín.", "Unidad", "Precio", "Proveedor", "Estado"]],
    body: items.map((i) => [
      i.nombre, i.categoria, i.cantidad, i.cantidad_min, i.unidad,
      `₡${(i.precio || 0).toLocaleString()}`, i.proveedor || "—",
      i.cantidad === 0 ? "Agotado" : i.cantidad <= i.cantidad_min ? "Stock bajo" : "OK",
    ]),
    styles: { fillColor: [17, 24, 39], textColor: [241, 245, 249], fontSize: 8 },
    headStyles: { fillColor: DARK, textColor: GOLD, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [30, 41, 59] },
    didParseCell: (data) => {
      if (data.column.index === 7) {
        const colors = { "Agotado": [239,68,68], "Stock bajo": GOLD, "OK": [16,185,129] };
        data.cell.styles.textColor = colors[data.cell.raw] || GRAY;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  footer(doc);
  doc.save(`Inventario-AutoGest-${new Date().toISOString().split("T")[0]}.pdf`);
}
