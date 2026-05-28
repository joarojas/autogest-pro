// src/views/Chat.jsx
import React, { useState, useEffect, useRef } from "react";

// Chat funcional con localStorage (sin Supabase activo, preparado para conectar)
// Cuando conectes Supabase, reemplaza las funciones de localStorage por db.chat.*

const tipoColor = { info: "#60a5fa", warning: "var(--ag-accent)", success: "#34d399" };

// Mensajes de demostración por orden
const demoMensajes = {
  default: [
    { id: "m1", remitente: "mecanico", nombre: "Miguel Torres", contenido: "Buenos días, su vehículo ya fue recibido. Estamos iniciando el diagnóstico.", created_at: "2026-03-08T09:00:00", leido: true },
    { id: "m2", remitente: "cliente",  nombre: "Carlos Rodríguez", contenido: "Muchas gracias. ¿Tienen idea de cuánto tiempo tomará?", created_at: "2026-03-08T09:15:00", leido: true },
    { id: "m3", remitente: "mecanico", nombre: "Miguel Torres", contenido: "Estimamos unas 4 horas. Le avisamos cuando tengamos el diagnóstico completo.", created_at: "2026-03-08T09:20:00", leido: true },
  ],
};

function getMensajesStorage(ordenId) {
  const key = `ag_chat_${ordenId}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : (demoMensajes[ordenId] || demoMensajes.default);
}

function saveMensajesStorage(ordenId, mensajes) {
  localStorage.setItem(`ag_chat_${ordenId}`, JSON.stringify(mensajes));
}

// ── Componente Chat Completo (vista mecánico) ─────────────────────────────────
export const ChatMecanico = ({ ordenes, clientes, vehiculos, currentUser }) => {
  const [ordenActiva, setOrdenActiva] = useState(null);
  const [mensajes, setMensajes]       = useState([]);
  const [input, setInput]             = useState("");
  const [busqueda, setBusqueda]       = useState("");
  const bottomRef                     = useRef();

  const ordenesConChat = ordenes.filter((o) => o.estado !== "Finalizado");

  useEffect(() => {
    if (ordenActiva) {
      setMensajes(getMensajesStorage(ordenActiva.id));
    }
  }, [ordenActiva]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviar = () => {
    if (!input.trim() || !ordenActiva) return;
    const nuevo = {
      id: `m${Date.now()}`,
      remitente: "mecanico",
      nombre: "Técnico AutoGest",
      contenido: input.trim(),
      created_at: new Date().toISOString(),
      leido: false,
    };
    const nuevos = [...mensajes, nuevo];
    setMensajes(nuevos);
    saveMensajesStorage(ordenActiva.id, nuevos);
    setInput("");
  };

  const filtradas = ordenesConChat.filter((o) => {
    const c = clientes.find((x) => x.id === o.clienteId);
    const v = vehiculos.find((x) => x.id === o.vehiculoId);
    return !busqueda || c?.nombre.toLowerCase().includes(busqueda.toLowerCase()) || v?.placa.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      <div className="ag-topbar">
        <div><h1 className="ag-page-title">Chat con Clientes</h1><p className="ag-page-subtitle">Comunicación en tiempo real por orden de servicio</p></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, height: "calc(100vh - 180px)" }}>
        {/* Lista de órdenes/chats */}
        <div className="ag-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--ag-border)" }}>
            <div className="ag-search-wrap">
              <i className="bi bi-search"></i>
              <input className="ag-input" placeholder="Buscar cliente..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ fontSize: 13 }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtradas.length === 0
              ? <div style={{ padding: 24, textAlign: "center", color: "var(--ag-text-muted)", fontSize: 13 }}>Sin conversaciones activas</div>
              : filtradas.map((o) => {
                const c = clientes.find((x) => x.id === o.clienteId);
                const v = vehiculos.find((x) => x.id === o.vehiculoId);
                const msgs = getMensajesStorage(o.id);
                const ultimo = msgs[msgs.length - 1];
                const noLeidos = msgs.filter((m) => m.remitente === "cliente" && !m.leido).length;
                const activo = ordenActiva?.id === o.id;
                return (
                  <div key={o.id} onClick={() => setOrdenActiva(o)}
                    style={{ padding: "13px 16px", cursor: "pointer", borderBottom: "1px solid var(--ag-border)", background: activo ? "var(--ag-accent-light)" : "transparent", transition: ".15s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: activo ? "var(--ag-accent)" : "var(--ag-text)" }}>{c?.nombre || "—"}</span>
                      {noLeidos > 0 && <span style={{ background: "var(--ag-accent)", color: "var(--ag-dark)", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{noLeidos}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ag-accent)", fontWeight: 600, marginBottom: 3 }}>{v?.placa} · {v?.marca} {v?.modelo}</div>
                    {ultimo && <div style={{ fontSize: 11, color: "var(--ag-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ultimo.contenido}</div>}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Área de chat */}
        {!ordenActiva
          ? (
            <div className="ag-card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="ag-empty">
                <div className="ag-empty-icon"><i className="bi bi-chat-dots"></i></div>
                <div className="ag-empty-title">Selecciona una conversación</div>
                <p style={{ color: "var(--ag-text-muted)" }}>Elige una orden activa del panel izquierdo para chatear con el cliente.</p>
              </div>
            </div>
          ) : (() => {
            const c = clientes.find((x) => x.id === ordenActiva.clienteId);
            const v = vehiculos.find((x) => x.id === ordenActiva.vehiculoId);
            return (
              <div className="ag-card" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Header del chat */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ag-border)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--ag-accent-light)", border: "1px solid rgba(245,158,11,.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ag-accent)", fontSize: 16, flexShrink: 0 }}>
                    {c?.nombre?.charAt(0) || "C"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--ag-text)", fontSize: 14 }}>{c?.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--ag-text-muted)" }}>{v?.placa} · {v?.marca} {v?.modelo} · OS #{ordenActiva.id.slice(-6).toUpperCase()}</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span style={{ background: "rgba(16,185,129,.15)", color: "#34d399", border: "1px solid rgba(16,185,129,.25)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "pulse-dot 2s infinite" }}></span>
                      En línea
                    </span>
                  </div>
                </div>

                {/* Mensajes */}
                <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {mensajes.map((m) => {
                    const esMio = m.remitente === "mecanico";
                    const hora = new Date(m.created_at).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: esMio ? "flex-end" : "flex-start" }}>
                        <div style={{ fontSize: 10, color: "var(--ag-text-muted)", marginBottom: 3, paddingLeft: esMio ? 0 : 4, paddingRight: esMio ? 4 : 0 }}>
                          {esMio ? "Tú" : m.nombre} · {hora}
                        </div>
                        <div style={{
                          maxWidth: "72%", padding: "10px 14px", borderRadius: esMio ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                          background: esMio ? "var(--ag-accent)" : "var(--ag-dark-3)",
                          color: esMio ? "var(--ag-dark)" : "var(--ag-text)",
                          fontSize: 14, lineHeight: 1.5,
                          border: esMio ? "none" : "1px solid var(--ag-border)",
                        }}>
                          {m.contenido}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: "14px 18px", borderTop: "1px solid var(--ag-border)", display: "flex", gap: 10, alignItems: "center" }}>
                  <input className="ag-input" placeholder="Escribe un mensaje..." value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviar()}
                    style={{ flex: 1 }} />
                  <button className="ag-btn ag-btn-primary ag-btn-icon" onClick={enviar} disabled={!input.trim()} style={{ width: 42, height: 42 }}>
                    <i className="bi bi-send-fill"></i>
                  </button>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
};

// ── Chat para el Cliente ───────────────────────────────────────────────────────
export const ChatCliente = ({ orden, cliente }) => {
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput]       = useState("");
  const bottomRef               = useRef();

  useEffect(() => {
    if (orden) setMensajes(getMensajesStorage(orden.id));
  }, [orden]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviar = () => {
    if (!input.trim() || !orden) return;
    const nuevo = {
      id: `m${Date.now()}`,
      remitente: "cliente",
      nombre: cliente?.nombre || "Cliente",
      contenido: input.trim(),
      created_at: new Date().toISOString(),
      leido: false,
    };
    const nuevos = [...mensajes, nuevo];
    setMensajes(nuevos);
    saveMensajesStorage(orden.id, nuevos);
    setInput("");
  };

  if (!orden) return (
    <div className="ag-card">
      <div className="ag-empty">
        <div className="ag-empty-icon"><i className="bi bi-chat-dots"></i></div>
        <div className="ag-empty-title">Sin orden activa</div>
        <p style={{ color: "var(--ag-text-muted)" }}>El chat estará disponible cuando tengas un vehículo en el taller.</p>
      </div>
    </div>
  );

  return (
    <div className="ag-card" style={{ padding: 0, height: 480, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--ag-border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--ag-dark-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ag-accent)", fontSize: 15 }}>
          <i className="bi bi-tools"></i>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ag-text)" }}>AutoGest Pro — Soporte Técnico</div>
          <div style={{ fontSize: 11, color: "var(--ag-text-muted)" }}>OS #{orden.id.slice(-6).toUpperCase()}</div>
        </div>
        <span style={{ marginLeft: "auto", background: "rgba(16,185,129,.12)", color: "#34d399", borderRadius: 20, padding: "2px 9px", fontSize: 11 }}>● En línea</span>
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {mensajes.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--ag-text-muted)", fontSize: 13, marginTop: 40 }}>
            <i className="bi bi-chat-dots" style={{ fontSize: 32, opacity: .3, display: "block", marginBottom: 8 }}></i>
            Inicia la conversación con el técnico
          </div>
        )}
        {mensajes.map((m) => {
          const esMio = m.remitente === "cliente";
          const hora = new Date(m.created_at).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: esMio ? "flex-end" : "flex-start" }}>
              <div style={{ fontSize: 10, color: "var(--ag-text-muted)", marginBottom: 3 }}>{esMio ? "Tú" : "Técnico"} · {hora}</div>
              <div style={{
                maxWidth: "75%", padding: "9px 13px",
                borderRadius: esMio ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                background: esMio ? "var(--ag-accent)" : "var(--ag-dark-3)",
                color: esMio ? "var(--ag-dark)" : "var(--ag-text)",
                fontSize: 13, lineHeight: 1.5,
                border: esMio ? "none" : "1px solid var(--ag-border)",
              }}>
                {m.contenido}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--ag-border)", display: "flex", gap: 8 }}>
        <input className="ag-input" placeholder="Escribe un mensaje al técnico..." value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          style={{ flex: 1, fontSize: 13 }} />
        <button className="ag-btn ag-btn-primary ag-btn-icon" onClick={enviar} disabled={!input.trim()} style={{ width: 40, height: 40 }}>
          <i className="bi bi-send-fill" style={{ fontSize: 14 }}></i>
        </button>
      </div>
    </div>
  );
};
