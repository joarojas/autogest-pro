// src/services/db.js
// Capa de acceso a datos — reemplaza localStorage con Supabase
import { supabase } from "./supabase";

const today = () => new Date().toISOString().split("T")[0];

// ── CLIENTES ──────────────────────────────────────────────────────────────────
export const db = {
  clientes: {
    async getAll() {
      const { data, error } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    async create(datos) {
      const { data, error } = await supabase.from("clientes").insert([datos]).select().single();
      if (error) throw error;
      return data;
    },
    async getByCedula(cedula) {
      const { data, error } = await supabase.from("clientes").select("*").eq("cedula", cedula).single();
      if (error) return null;
      return data;
    },
  },

  // ── VEHÍCULOS ───────────────────────────────────────────────────────────────
  vehiculos: {
    async getAll() {
      const { data, error } = await supabase.from("vehiculos").select("*, clientes(nombre)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    async getByCliente(clienteId) {
      const { data, error } = await supabase.from("vehiculos").select("*").eq("cliente_id", clienteId);
      if (error) throw error;
      return data;
    },
    async create(datos) {
      const { data, error } = await supabase.from("vehiculos").insert([datos]).select().single();
      if (error) throw error;
      return data;
    },
  },

  // ── ÓRDENES ─────────────────────────────────────────────────────────────────
  ordenes: {
    async getAll() {
      const { data, error } = await supabase
        .from("ordenes")
        .select(`*, clientes(nombre,telefono,cedula), vehiculos(placa,marca,modelo,año,color),
          orden_servicios(*), notificaciones(*)`)
        .order("fecha_actualizacion", { ascending: false });
      if (error) throw error;
      return data.map(normalizeOrden);
    },
    async getByCliente(clienteId) {
      const { data, error } = await supabase
        .from("ordenes")
        .select(`*, clientes(nombre,telefono,cedula), vehiculos(placa,marca,modelo,año,color),
          orden_servicios(*), notificaciones(*)`)
        .eq("cliente_id", clienteId)
        .order("fecha_actualizacion", { ascending: false });
      if (error) throw error;
      return data.map(normalizeOrden);
    },
    async create(clienteId, vehiculoId) {
      const { data: orden, error } = await supabase
        .from("ordenes")
        .insert([{ cliente_id: clienteId, vehiculo_id: vehiculoId }])
        .select().single();
      if (error) throw error;
      // Notificación inicial
      await supabase.from("notificaciones").insert([{
        orden_id: orden.id,
        mensaje: "Vehículo recibido en taller. Orden de servicio creada.",
        tipo: "info",
      }]);
      return orden;
    },
    async update(ordenId, campos) {
      const { error } = await supabase
        .from("ordenes")
        .update({ ...campos, fecha_actualizacion: new Date().toISOString() })
        .eq("id", ordenId);
      if (error) throw error;
    },
    async cambiarEstado(ordenId, nuevoEstado, msgExtra = "") {
      await supabase.from("ordenes")
        .update({ estado: nuevoEstado, fecha_actualizacion: new Date().toISOString() })
        .eq("id", ordenId);
      const mensajes = {
        "En Proceso": "Diagnóstico completado. Vehículo en proceso de reparación.",
        "Finalizado": "¡Vehículo listo para retiro! Trabajo finalizado.",
      };
      await supabase.from("notificaciones").insert([{
        orden_id: ordenId,
        mensaje: msgExtra || mensajes[nuevoEstado] || `Estado: ${nuevoEstado}`,
        tipo: nuevoEstado === "Finalizado" ? "success" : "info",
      }]);
    },
  },

  // ── SERVICIOS DE ORDEN ───────────────────────────────────────────────────────
  servicios: {
    async agregar(ordenId, servicio) {
      const { data, error } = await supabase.from("orden_servicios")
        .insert([{ orden_id: ordenId, ...servicio }]).select().single();
      if (error) throw error;
      return data;
    },
    async remover(servicioId) {
      const { error } = await supabase.from("orden_servicios").delete().eq("id", servicioId);
      if (error) throw error;
    },
  },

  // ── NOTIFICACIONES ───────────────────────────────────────────────────────────
  notificaciones: {
    async agregar(ordenId, mensaje, tipo = "info") {
      const { error } = await supabase.from("notificaciones")
        .insert([{ orden_id: ordenId, mensaje, tipo }]);
      if (error) throw error;
    },
    async suscribir(ordenId, callback) {
      return supabase.channel(`notifs-${ordenId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notificaciones", filter: `orden_id=eq.${ordenId}` }, callback)
        .subscribe();
    },
  },

  // ── CHAT ─────────────────────────────────────────────────────────────────────
  chat: {
    async getMensajes(ordenId) {
      const { data, error } = await supabase
        .from("mensajes_chat").select("*").eq("orden_id", ordenId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    async enviar(ordenId, remitente, nombre, contenido) {
      const { data, error } = await supabase.from("mensajes_chat")
        .insert([{ orden_id: ordenId, remitente, nombre, contenido }]).select().single();
      if (error) throw error;
      return data;
    },
    async marcarLeidos(ordenId, remitente) {
      await supabase.from("mensajes_chat")
        .update({ leido: true })
        .eq("orden_id", ordenId)
        .neq("remitente", remitente);
    },
    suscribir(ordenId, callback) {
      return supabase.channel(`chat-${ordenId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensajes_chat", filter: `orden_id=eq.${ordenId}` }, callback)
        .subscribe();
    },
  },

  // ── INVENTARIO ───────────────────────────────────────────────────────────────
  inventario: {
    async getAll() {
      const { data, error } = await supabase.from("inventario").select("*").order("nombre");
      if (error) throw error;
      return data;
    },
    async create(item) {
      const { data, error } = await supabase.from("inventario").insert([item]).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, cambios) {
      const { data, error } = await supabase.from("inventario").update(cambios).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from("inventario").delete().eq("id", id);
      if (error) throw error;
    },
    async uploadImagen(file, itemId) {
      const ext  = file.name.split(".").pop();
      const path = `${itemId}.${ext}`;
      const { error } = await supabase.storage.from("inventario").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("inventario").getPublicUrl(path);
      return data.publicUrl;
    },
  },
};

// Normaliza la estructura de Supabase al formato interno de la app
function normalizeOrden(o) {
  return {
    id: o.id,
    clienteId: o.cliente_id,
    vehiculoId: o.vehiculo_id,
    estado: o.estado,
    responsable: o.responsable || "",
    fechaIngreso: o.fecha_ingreso,
    fechaEstimada: o.fecha_estimada || "",
    fechaActualizacion: o.fecha_actualizacion?.split("T")[0] || today(),
    observaciones: o.observaciones || "",
    hallazgos: o.hallazgos || "",
    observacionesCierre: o.observaciones_cierre || "",
    checklist: o.checklist || {},
    fotos: o.fotos || [],
    servicios: (o.orden_servicios || []).filter((s) => !s.es_custom).map((s) => s.servicio_id || s.id),
    serviciosPersonalizados: (o.orden_servicios || []).filter((s) => s.es_custom),
    _serviciosRaw: o.orden_servicios || [],
    notificaciones: (o.notificaciones || [])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((n) => ({ fecha: n.fecha || today(), tipo: n.tipo, mensaje: n.mensaje })),
    // Info anidada
    _cliente: o.clientes,
    _vehiculo: o.vehiculos,
  };
}
