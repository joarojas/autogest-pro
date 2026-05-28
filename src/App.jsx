// src/App.jsx
import React, { useState } from "react";
import { useTaller } from "./hooks/useTaller";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./views/Login";
import { Dashboard } from "./views/Dashboard";
import { Registro } from "./views/Registro";
import { Ordenes } from "./views/Ordenes";
import { Clientes, Vehiculos } from "./views/Clientes";
import { VistaCliente } from "./views/VistaCliente";
import { Reportes } from "./views/Reportes";
import { Inventario } from "./views/Inventario";
import { ChatMecanico, ChatCliente } from "./views/Chat";

function App() {
  const taller = useTaller();
  const [activeView, setActiveView]      = useState("dashboard");
  const [selectedOrdenId, setSelectedId] = useState(null);

  const handleLogin = (rol, cedula) => {
    taller.login(rol, cedula);
    setActiveView(rol === "mecanico" ? "dashboard" : "mi-orden");
  };

  const handleNavigate = (view, ordenId = null) => {
    setActiveView(view);
    setSelectedId(ordenId);
  };

  if (!taller.currentUser) return <Login onLogin={handleLogin} />;

  const renderView = () => {
    if (taller.currentUser.rol === "mecanico") {
      switch (activeView) {
        case "dashboard":
          return <Dashboard clientes={taller.clientes} vehiculos={taller.vehiculos} ordenes={taller.ordenes} onNavigate={handleNavigate} />;
        case "registro":
          return <Registro clientes={taller.clientes} vehiculos={taller.vehiculos} onAgregarCliente={taller.agregarCliente} onAgregarVehiculo={taller.agregarVehiculo} onCrearOrden={taller.crearOrden} onNavigate={handleNavigate} />;
        case "ordenes":
          return (
            <Ordenes
              clientes={taller.clientes}
              vehiculos={taller.vehiculos}
              ordenes={taller.ordenes}
              onCambiarEstado={taller.cambiarEstadoOrden}
              onAgregarServicio={taller.agregarServicioAOrden}
              onRemoverServicio={taller.removerServicioDeOrden}
              onAgregarServicioPersonalizado={taller.agregarServicioPersonalizado}
              onRemoverServicioPersonalizado={taller.removerServicioPersonalizado}
              onActualizarChecklist={taller.actualizarChecklist}
              onActualizarOrden={taller.actualizarOrden}
              onAgregarNotificacion={taller.agregarNotificacion}
              onAgregarFoto={taller.agregarFoto}
              onRemoverFoto={taller.removerFoto}
              selectedOrdenId={selectedOrdenId}
              onNavigate={handleNavigate}
            />
          );
        case "clientes":
          return <Clientes clientes={taller.clientes} vehiculos={taller.vehiculos} ordenes={taller.ordenes} onNavigate={handleNavigate} />;
        case "vehiculos":
          return <Vehiculos vehiculos={taller.vehiculos} clientes={taller.clientes} ordenes={taller.ordenes} onNavigate={handleNavigate} />;
        case "reportes":
          return <Reportes ordenes={taller.ordenes} clientes={taller.clientes} vehiculos={taller.vehiculos} />;
        case "inventario":
          return <Inventario />;
        case "chat":
          return <ChatMecanico ordenes={taller.ordenes} clientes={taller.clientes} vehiculos={taller.vehiculos} currentUser={taller.currentUser} />;
        default:
          return <Dashboard clientes={taller.clientes} vehiculos={taller.vehiculos} ordenes={taller.ordenes} onNavigate={handleNavigate} />;
      }
    } else {
      // Portal cliente
      const cliente = taller.clientes.find((c) => c.cedula === taller.currentUser.clienteId);
      const misOrdenes = taller.ordenes.filter((o) => o.clienteId === cliente?.id);
      const ordenActiva = misOrdenes.find((o) => o.estado !== "Finalizado") || null;

      if (activeView === "chat-cliente") {
        return (
          <div style={{ animation: "slideUp 0.3s ease" }}>
            <div className="ag-topbar">
              <div><h1 className="ag-page-title">Chat con el Técnico</h1><p className="ag-page-subtitle">Comunícate directamente con el taller</p></div>
            </div>
            <ChatCliente orden={ordenActiva} cliente={cliente} />
          </div>
        );
      }
      return (
        <VistaCliente
          clientes={taller.clientes}
          vehiculos={taller.vehiculos}
          ordenes={taller.ordenes}
          cedula={taller.currentUser.clienteId}
          view={activeView}
        />
      );
    }
  };

  return (
    <div className="ag-layout">
      <Sidebar activeView={activeView} onNavigate={handleNavigate} currentUser={taller.currentUser} onLogout={taller.logout} />
      <main className="ag-main">{renderView()}</main>
    </div>
  );
}

export default App;
