// src/components/Sidebar.jsx
import React from "react";

const menuMecanico = [
  { section: "Principal", items: [
    { id: "dashboard", label: "Dashboard",       icon: "bi-grid-1x2-fill"           },
    { id: "ordenes",   label: "Órdenes de Servicio", icon: "bi-file-earmark-text-fill" },
  ]},
  { section: "Gestión", items: [
    { id: "clientes",   label: "Clientes",   icon: "bi-people-fill"       },
    { id: "vehiculos",  label: "Vehículos",  icon: "bi-car-front-fill"    },
    { id: "registro",   label: "Nuevo Ingreso", icon: "bi-plus-circle-fill" },
  ]},
  { section: "Herramientas", items: [
    { id: "inventario", label: "Inventario", icon: "bi-box-seam-fill"          },
    { id: "reportes",   label: "Reportes",   icon: "bi-bar-chart-line-fill"    },
    { id: "chat",       label: "Chat",       icon: "bi-chat-dots-fill"         },
  ]},
];

const menuCliente = [
  { section: "Mi Vehículo", items: [
    { id: "mi-orden",  label: "Estado del Servicio", icon: "bi-search"           },
    { id: "vehiculos", label: "Mis Vehículos",        icon: "bi-car-front-fill"  },
    { id: "historial", label: "Historial",            icon: "bi-clock-history"   },
    { id: "chat-cliente", label: "Chat con Técnico",  icon: "bi-chat-dots-fill"  },
  ]},
];

export const Sidebar = ({ activeView, onNavigate, currentUser, onLogout }) => {
  const menu = currentUser?.rol === "mecanico" ? menuMecanico : menuCliente;

  return (
    <aside className="ag-sidebar">
      <div className="ag-sidebar-logo d-flex align-items-center gap-3">
        <div className="ag-logo-mark">A</div>
        <div>
          <div className="ag-logo-text">AutoGest Pro</div>
          <div className="ag-logo-sub">Taller Mecánico</div>
        </div>
      </div>

      <nav className="ag-nav">
        {menu.map((section) => (
          <div key={section.section}>
            <div className="ag-nav-section">{section.section}</div>
            {section.items.map((item) => (
              <button key={item.id} className={`ag-nav-item ${activeView === item.id ? "active" : ""}`}
                onClick={() => onNavigate(item.id)}>
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: "16px 12px", borderTop: "1px solid var(--ag-border)" }}>
        <div className="d-flex align-items-center gap-2 px-2 mb-3">
          <div style={{ width:32,height:32,borderRadius:"50%",background:"var(--ag-accent-light)",border:"1px solid rgba(245,158,11,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"var(--ag-accent)",flexShrink:0 }}>
            <i className={`bi ${currentUser?.rol === "mecanico" ? "bi-tools" : "bi-person"}`}></i>
          </div>
          <div style={{ overflow:"hidden" }}>
            <div style={{ fontSize:13,fontWeight:500,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:"var(--ag-text)" }}>
              {currentUser?.rol === "mecanico" ? "Panel Mecánico" : "Portal Cliente"}
            </div>
            <div style={{ fontSize:11,color:"var(--ag-text-muted)" }}>
              {currentUser?.rol === "mecanico" ? "Técnico" : "Cliente"}
            </div>
          </div>
        </div>
        <button className="ag-nav-item" onClick={onLogout} style={{ color:"#f87171" }}>
          <i className="bi bi-box-arrow-right"></i>Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};
