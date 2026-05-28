// src/hooks/useTaller.js
import { useState, useEffect, useCallback } from "react";
import { initialClients, initialVehicles, initialOrders, ESTADOS } from "../data/mockData";

const generateId = (prefix) =>
  `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

const today = () => new Date().toISOString().split("T")[0];

export const useTaller = () => {
  const [clientes, setClientes] = useState(() => {
    const s = localStorage.getItem("ag_clientes"); return s ? JSON.parse(s) : initialClients;
  });
  const [vehiculos, setVehiculos] = useState(() => {
    const s = localStorage.getItem("ag_vehiculos"); return s ? JSON.parse(s) : initialVehicles;
  });
  const [ordenes, setOrdenes] = useState(() => {
    const s = localStorage.getItem("ag_ordenes"); return s ? JSON.parse(s) : initialOrders;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const s = localStorage.getItem("ag_currentUser"); return s ? JSON.parse(s) : null;
  });

  useEffect(() => { localStorage.setItem("ag_clientes",  JSON.stringify(clientes));  }, [clientes]);
  useEffect(() => { localStorage.setItem("ag_vehiculos", JSON.stringify(vehiculos)); }, [vehiculos]);
  useEffect(() => { localStorage.setItem("ag_ordenes",   JSON.stringify(ordenes));   }, [ordenes]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = useCallback((rol, clienteId = null) => {
    const user = { rol, clienteId };
    setCurrentUser(user);
    localStorage.setItem("ag_currentUser", JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("ag_currentUser");
  }, []);

  // ── Clientes ──────────────────────────────────────────────────────────────
  const agregarCliente = useCallback((datos) => {
    const nuevo = { id: generateId("c"), ...datos, fechaRegistro: today() };
    setClientes((p) => [...p, nuevo]);
    return nuevo;
  }, []);

  const getClienteById = useCallback((id) => clientes.find((c) => c.id === id), [clientes]);

  // ── Vehículos ─────────────────────────────────────────────────────────────
  const agregarVehiculo = useCallback((datos) => {
    const nuevo = { id: generateId("v"), ...datos };
    setVehiculos((p) => [...p, nuevo]);
    return nuevo;
  }, []);

  const getVehiculosByCliente = useCallback(
    (cid) => vehiculos.filter((v) => v.clienteId === cid), [vehiculos]
  );
  const getVehiculoById = useCallback((id) => vehiculos.find((v) => v.id === id), [vehiculos]);

  // ── Órdenes ───────────────────────────────────────────────────────────────
  const crearOrden = useCallback((clienteId, vehiculoId) => {
    const nueva = {
      id: generateId("os"),
      clienteId,
      vehiculoId,
      estado: ESTADOS.RECIBIDO,
      fechaIngreso: today(),
      fechaActualizacion: today(),
      fechaEstimada: "",
      responsable: "",
      servicios: [],
      serviciosPersonalizados: [],   // [{ id, nombre, precio, nota }]
      checklist: {},
      observaciones: "",
      hallazgos: "",
      observacionesCierre: "",
      fotos: [],                      // [{ id, nombre, dataUrl, descripcion, fecha }]
      notificaciones: [
        { fecha: today(), tipo: "info", mensaje: "Vehículo recibido en taller. Orden de servicio creada." },
      ],
    };
    setOrdenes((p) => [...p, nueva]);
    return nueva;
  }, []);

  const actualizarOrden = useCallback((ordenId, cambios) => {
    setOrdenes((p) =>
      p.map((o) => o.id === ordenId ? { ...o, ...cambios, fechaActualizacion: today() } : o)
    );
  }, []);

  // Cambiar estado + notificación automática contextual
  const cambiarEstadoOrden = useCallback((ordenId, nuevoEstado, msgExtra = "") => {
    const mensajes = {
      [ESTADOS.EN_PROCESO]: "Diagnóstico completado. Vehículo en proceso de reparación.",
      [ESTADOS.FINALIZADO]: "¡Vehículo listo para retiro! Trabajo finalizado.",
    };
    const notif = {
      fecha: today(),
      tipo: nuevoEstado === ESTADOS.FINALIZADO ? "success" : "info",
      mensaje: msgExtra || mensajes[nuevoEstado] || `Estado cambiado a ${nuevoEstado}.`,
    };
    setOrdenes((p) =>
      p.map((o) =>
        o.id !== ordenId ? o : {
          ...o,
          estado: nuevoEstado,
          fechaActualizacion: today(),
          notificaciones: [...o.notificaciones, notif],
        }
      )
    );
  }, []);

  // Agregar notificación manual (imprevistos)
  const agregarNotificacion = useCallback((ordenId, mensaje, tipo = "warning") => {
    const notif = { fecha: today(), tipo, mensaje };
    setOrdenes((p) =>
      p.map((o) =>
        o.id !== ordenId ? o : {
          ...o,
          fechaActualizacion: today(),
          notificaciones: [...o.notificaciones, notif],
        }
      )
    );
  }, []);

  // Servicios del catálogo
  const agregarServicioAOrden    = useCallback((ordenId, servicioId) => {
    setOrdenes((p) => p.map((o) =>
      o.id === ordenId && !o.servicios.includes(servicioId)
        ? { ...o, servicios: [...o.servicios, servicioId] } : o));
  }, []);

  const removerServicioDeOrden   = useCallback((ordenId, servicioId) => {
    setOrdenes((p) => p.map((o) =>
      o.id === ordenId ? { ...o, servicios: o.servicios.filter((s) => s !== servicioId) } : o));
  }, []);

  // Servicios personalizados
  const agregarServicioPersonalizado = useCallback((ordenId, servicio) => {
    const nuevo = { id: generateId("sp"), ...servicio };
    setOrdenes((p) => p.map((o) =>
      o.id === ordenId
        ? { ...o, serviciosPersonalizados: [...(o.serviciosPersonalizados || []), nuevo] }
        : o));
    return nuevo;
  }, []);

  const removerServicioPersonalizado = useCallback((ordenId, spId) => {
    setOrdenes((p) => p.map((o) =>
      o.id === ordenId
        ? { ...o, serviciosPersonalizados: (o.serviciosPersonalizados || []).filter((s) => s.id !== spId) }
        : o));
  }, []);

  // Checklist
  const actualizarChecklist = useCallback((ordenId, itemId, estado) => {
    setOrdenes((p) => p.map((o) =>
      o.id === ordenId ? { ...o, checklist: { ...o.checklist, [itemId]: estado } } : o));
  }, []);

  // Fotos (base64)
  const agregarFoto = useCallback((ordenId, foto) => {
    const nueva = { id: generateId("f"), fecha: today(), ...foto };
    setOrdenes((p) => p.map((o) =>
      o.id === ordenId ? { ...o, fotos: [...(o.fotos || []), nueva] } : o));
  }, []);

  const removerFoto = useCallback((ordenId, fotoId) => {
    setOrdenes((p) => p.map((o) =>
      o.id === ordenId ? { ...o, fotos: (o.fotos || []).filter((f) => f.id !== fotoId) } : o));
  }, []);

  // Queries
  const getOrdenesByCliente = useCallback(
    (cid) => ordenes.filter((o) => o.clienteId === cid), [ordenes]
  );
  const getOrdenById = useCallback((id) => ordenes.find((o) => o.id === id), [ordenes]);

  return {
    clientes, vehiculos, ordenes, currentUser,
    login, logout,
    agregarCliente, getClienteById,
    agregarVehiculo, getVehiculosByCliente, getVehiculoById,
    crearOrden, actualizarOrden, cambiarEstadoOrden, agregarNotificacion,
    agregarServicioAOrden, removerServicioDeOrden,
    agregarServicioPersonalizado, removerServicioPersonalizado,
    actualizarChecklist,
    agregarFoto, removerFoto,
    getOrdenesByCliente, getOrdenById,
  };
};
