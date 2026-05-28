// src/data/mockData.js

export const initialClients = [
  { id: "c001", nombre: "Carlos Rodríguez", telefono: "8888-1234", correo: "carlos.rodriguez@email.com", cedula: "1-1234-5678", fechaRegistro: "2025-01-10" },
  { id: "c002", nombre: "María Fernández",  telefono: "7777-5678", correo: "maria.fernandez@email.com",  cedula: "2-9876-5432", fechaRegistro: "2025-01-15" },
  { id: "c003", nombre: "José Mora",        telefono: "6666-9012", correo: "jose.mora@email.com",        cedula: "3-4567-8901", fechaRegistro: "2025-02-01" },
];

export const initialVehicles = [
  { id: "v001", clienteId: "c001", placa: "AAA-123", marca: "Toyota",  modelo: "Corolla", año: 2019, color: "Plateado" },
  { id: "v002", clienteId: "c002", placa: "BBB-456", marca: "Honda",   modelo: "CR-V",    año: 2021, color: "Negro"    },
  { id: "v003", clienteId: "c003", placa: "CCC-789", marca: "Hyundai", modelo: "Tucson",  año: 2020, color: "Blanco"   },
];

export const servicesCatalog = [
  { id: "s001", nombre: "Cambio de Aceite",               precio: 25000, duracion: "1h",    categoria: "Mantenimiento" },
  { id: "s002", nombre: "Chequeo Dekra / Revisión Técnica",precio: 35000, duracion: "2h",    categoria: "Inspección"    },
  { id: "s003", nombre: "Revisión de Frenos",              precio: 15000, duracion: "1.5h",  categoria: "Seguridad"     },
  { id: "s004", nombre: "Cambio de Filtro de Aire",        precio:  8000, duracion: "30min", categoria: "Mantenimiento" },
  { id: "s005", nombre: "Alineación y Balanceo",           precio: 20000, duracion: "1.5h",  categoria: "Neumáticos"    },
  { id: "s006", nombre: "Revisión de Suspensión",          precio: 18000, duracion: "1h",    categoria: "Seguridad"     },
  { id: "s007", nombre: "Cambio de Líquido de Frenos",     precio: 12000, duracion: "45min", categoria: "Mantenimiento" },
  { id: "s008", nombre: "Revisión de Luces",               precio:  5000, duracion: "30min", categoria: "Inspección"    },
  { id: "s009", nombre: "Cambio de Filtro de Combustible", precio: 10000, duracion: "45min", categoria: "Mantenimiento" },
  { id: "s010", nombre: "Revisión de Transmisión",         precio: 30000, duracion: "2h",    categoria: "Motor"         },
  { id: "s011", nombre: "Cambio de Bujías",                precio: 22000, duracion: "1h",    categoria: "Motor"         },
  { id: "s012", nombre: "Revisión de Rótulas y Terminales",precio: 14000, duracion: "1h",    categoria: "Seguridad"     },
  // Aceite de caja / retenedores
  { id: "s013", nombre: "Cambio de Aceite de Caja",        precio: 28000, duracion: "1.5h",  categoria: "Transmisión"   },
  { id: "s014", nombre: "Cambio de Retenedores/Empaques",  precio: 18000, duracion: "1h",    categoria: "Transmisión"   },
];

export const checklistItems = [
  { id: "ch01", categoria: "Niveles",     nombre: "Nivel de Aceite de Motor",               icono: "bi-droplet-fill"      },
  { id: "ch02", categoria: "Niveles",     nombre: "Líquido de Frenos",                      icono: "bi-droplet-half"      },
  { id: "ch03", categoria: "Niveles",     nombre: "Líquido Refrigerante",                   icono: "bi-thermometer-half"  },
  { id: "ch04", categoria: "Niveles",     nombre: "Líquido de Dirección Hidráulica",        icono: "bi-gear-fill"         },
  { id: "ch05", categoria: "Frenos",      nombre: "Pastillas de Freno Delanteras",          icono: "bi-circle-fill"       },
  { id: "ch06", categoria: "Frenos",      nombre: "Pastillas de Freno Traseras",            icono: "bi-circle"            },
  { id: "ch07", categoria: "Frenos",      nombre: "Discos de Freno",                        icono: "bi-disc-fill"         },
  { id: "ch08", categoria: "Suspensión",  nombre: "Amortiguadores Delanteros",              icono: "bi-arrows-collapse"   },
  { id: "ch09", categoria: "Suspensión",  nombre: "Amortiguadores Traseros",                icono: "bi-arrows-expand"     },
  { id: "ch10", categoria: "Suspensión",  nombre: "Rótulas de Dirección",                   icono: "bi-bullseye"          },
  { id: "ch11", categoria: "Suspensión",  nombre: "Compensadores / Cauchos de Suspensión",  icono: "bi-vinyl"             },
  { id: "ch12", categoria: "Filtros",     nombre: "Filtro de Aire",                         icono: "bi-wind"              },
  { id: "ch13", categoria: "Filtros",     nombre: "Filtro de Combustible",                  icono: "bi-funnel-fill"       },
  { id: "ch14", categoria: "Filtros",     nombre: "Filtro de Habitáculo / Cabina",          icono: "bi-house-fill"        },
  { id: "ch15", categoria: "Transmisión", nombre: "Nivel Aceite de Transmisión",            icono: "bi-sliders"           },
  { id: "ch16", categoria: "Transmisión", nombre: "Estado de la Correa de Distribución",    icono: "bi-link-45deg"        },
];

export const initialOrders = [
  {
    id: "os001",
    clienteId: "c001",
    vehiculoId: "v001",
    estado: "Finalizado",
    fechaIngreso: "2025-01-20",
    fechaActualizacion: "2025-01-22",
    fechaEstimada: "2025-01-22",
    responsable: "Miguel Ángel Torres",
    servicios: ["s001", "s008"],
    serviciosPersonalizados: [],
    checklist: { ch01: "revisado", ch02: "revisado", ch05: "revisado" },
    observaciones: "Vehículo en buen estado general. Cambio de aceite completado satisfactoriamente.",
    hallazgos: "",
    observacionesCierre: "Todos los servicios completados sin inconvenientes. Vehículo entregado en óptimas condiciones.",
    fotos: [],
    notificaciones: [
      { fecha: "2025-01-20", tipo: "info",    mensaje: "Vehículo recibido en taller. Orden de servicio creada." },
      { fecha: "2025-01-20", tipo: "info",    mensaje: "Diagnóstico completado. Sin hallazgos mayores." },
      { fecha: "2025-01-21", tipo: "info",    mensaje: "Servicio en proceso." },
      { fecha: "2025-01-22", tipo: "success", mensaje: "Vehículo listo para retiro. Trabajo finalizado." },
    ],
  },
  {
    id: "os002",
    clienteId: "c002",
    vehiculoId: "v002",
    estado: "En Proceso",
    fechaIngreso: "2025-03-01",
    fechaActualizacion: "2025-03-02",
    fechaEstimada: "2025-03-05",
    responsable: "Carlos Pérez",
    servicios: ["s002", "s003"],
    serviciosPersonalizados: [],
    checklist: { ch05: "problema", ch07: "revisado" },
    observaciones: "Se detectó desgaste en pastillas delanteras.",
    hallazgos: "Pastillas de freno delanteras requieren reemplazo urgente.",
    observacionesCierre: "",
    fotos: [],
    notificaciones: [
      { fecha: "2025-03-01", tipo: "info",    mensaje: "Vehículo recibido en taller. Orden de servicio creada." },
      { fecha: "2025-03-02", tipo: "warning", mensaje: "Diagnóstico completado. Observación importante: pastillas delanteras con desgaste crítico." },
    ],
  },
];

export const ESTADOS = {
  RECIBIDO:   "Recibido",
  EN_PROCESO: "En Proceso",
  FINALIZADO: "Finalizado",
};

export const MECANICOS = [
  "Miguel Ángel Torres",
  "Carlos Pérez",
  "Luis Hernández",
  "Andrés Solano",
];
