<div align="center">

# 🔧 AutoGest Pro
### Sistema de Gestión de Taller Mecánico

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Plataforma web integral para la gestión de talleres mecánicos.**  
Controla órdenes de servicio, comunícate con clientes en tiempo real, gestiona tu inventario y genera reportes profesionales.

[🚀 Ver Demo en Vivo](https://TU_USUARIO.github.io/autogest-pro) · [📋 Reportar Bug](../../issues) · [💡 Sugerir Feature](../../issues)

</div>

---

## 📸 Capturas de Pantalla

| Dashboard Mecánico | Órdenes de Servicio | Portal Cliente |
|:--:|:--:|:--:|
| ![Dashboard](docs/dashboard.png) | ![Ordenes](docs/ordenes.png) | ![Cliente](docs/cliente.png) |

---

## ✨ Funcionalidades

### 👨‍🔧 Panel del Mecánico
- **Dashboard** — KPIs en tiempo real: órdenes activas, ingresos estimados, tasa de cierre
- **Órdenes de Servicio** — Gestión completa con 6 tabs: información, diagnóstico, servicios, evidencia fotográfica, notificaciones e historial
- **Checklist de Diagnóstico** — 16 ítems en 5 categorías (niveles, frenos, suspensión, filtros, transmisión)
- **Catálogo de Servicios** — 14 servicios predefinidos + servicios personalizados ad-hoc
- **Evidencia Fotográfica** — Adjunta fotos con descripción directamente desde la OS
- **Flujo de Estados** — Recibido → En Proceso → Finalizado con modal de cierre formal
- **Asignación de responsable** y fecha estimada de entrega por OS
- **Chat en tiempo real** con clientes por orden de servicio
- **Inventario** — Control de piezas y herramientas con imágenes, alertas de stock bajo y ajuste rápido
- **Reportes y Estadísticas** — Gráficas de ingresos, servicios más usados, rendimiento por mecánico
- **Exportar PDF** — Órdenes individuales, reporte general e inventario

### 👤 Portal del Cliente
- **Estado del servicio** — Stepper visual de progreso, nota del técnico, hallazgos
- **Diagnóstico detallado** — Resumen visual de ítems revisados y con problemas
- **Galería de evidencias** — Fotos adjuntadas por el mecánico con lightbox
- **Notificaciones en tiempo real** — Con iconos y colores por tipo (info, alerta, avance)
- **Chat con el técnico** — Comunicación directa por orden activa
- **Historial completo** — Todas las órdenes anteriores expandibles con detalle
- **Mis vehículos** — Tarjetas con estado actual y estadísticas de visitas

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Uso |
|------|-----------|-----|
| UI | **React 18** + Hooks | Componentes, estado, efectos |
| Estilos | **Bootstrap 5** + CSS Custom Properties | Layout responsive, design tokens |
| Iconos | **Bootstrap Icons 1.11** | Iconografía del sistema |
| Base de datos | **Supabase** (PostgreSQL) | Persistencia, tiempo real, storage |
| Gráficas | **Recharts** | Dashboard de estadísticas |
| PDF | **jsPDF + autoTable** | Exportación de reportes |
| Fuentes | **Syne + DM Sans** | Tipografía del sistema |
| Deploy | **GitHub Pages** | Demo pública |

---

## 🚀 Instalación y Uso

### Prerequisitos
- Node.js 18+ ([descargar](https://nodejs.org))
- Cuenta en [Supabase](https://supabase.com) (gratuita)

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/autogest-pro.git
cd autogest-pro
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales de Supabase:
```env
REACT_APP_SUPABASE_URL=https://TU_URL.supabase.co
REACT_APP_SUPABASE_ANON_KEY=TU_ANON_KEY
```

### 4. Crear las tablas en Supabase
Ve a **Supabase → SQL Editor** y ejecuta el esquema SQL que está en:
```
src/services/supabase.js  (comentario al final del archivo)
```

### 5. Iniciar en desarrollo
```bash
npm start
```
Abre [http://localhost:3000](http://localhost:3000)

---

## 🔑 Credenciales de Demo

> El sistema funciona con `localStorage` si no configuras Supabase.

| Rol | Acceso | Notas |
|-----|--------|-------|
| **Mecánico** | Usuario + contraseña cualquiera | Acceso completo al panel |
| **Cliente** | Cédula: `1-1234-5678` | Carlos Rodríguez |
| **Cliente** | Cédula: `2-9876-5432` | María Fernández |
| **Cliente** | Cédula: `3-4567-8901` | José Mora |

---

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Sidebar.jsx          # Navegación lateral adaptativa
│   └── StatusBadge.jsx      # Modal, Stepper, StatCard, Badge
│
├── views/
│   ├── Login.jsx            # Pantalla de acceso dual
│   ├── Dashboard.jsx        # Panel resumen con KPIs
│   ├── Registro.jsx         # Wizard nuevo ingreso (3 pasos)
│   ├── Ordenes.jsx          # Gestión completa de OS
│   ├── Clientes.jsx         # Clientes y vehículos
│   ├── Inventario.jsx       # Control de stock con imágenes
│   ├── Reportes.jsx         # Estadísticas y gráficas
│   ├── Chat.jsx             # Chat mecánico + cliente
│   └── VistaCliente.jsx     # Portal del cliente
│
├── services/
│   ├── supabase.js          # Cliente Supabase + esquema SQL
│   ├── db.js                # Capa de acceso a datos
│   └── pdfExport.js         # Generación de PDFs
│
├── hooks/
│   └── useTaller.js         # Estado global + localStorage
│
└── data/
    └── mockData.js          # Datos iniciales de demo
```

---

## 🗄 Esquema de Base de Datos

```sql
clientes          → id, nombre, telefono, correo, cedula
vehiculos         → id, cliente_id, placa, marca, modelo, año, color
ordenes           → id, cliente_id, vehiculo_id, estado, responsable,
                    fecha_ingreso, fecha_estimada, checklist (jsonb),
                    observaciones, hallazgos, observaciones_cierre, fotos (jsonb)
orden_servicios   → id, orden_id, nombre, precio, es_custom
notificaciones    → id, orden_id, mensaje, tipo, fecha
mensajes_chat     → id, orden_id, remitente, nombre, contenido, leido
inventario        → id, nombre, categoria, cantidad, cantidad_min,
                    unidad, precio, proveedor, imagen_url
```

---

## 🌐 Deploy en GitHub Pages

```bash
# 1. Instala gh-pages (ya incluido en devDependencies)
npm install

# 2. En package.json, cambia "homepage" por tu URL:
#    "homepage": "https://TU_USUARIO.github.io/autogest-pro"

# 3. Despliega
npm run deploy
```

---

## 📋 Hoja de Ruta

| Fase | Estado | Descripción |
|------|--------|-------------|
| Fase 1 | ✅ Completada | Estructura base, registro, diagnóstico, órdenes |
| Fase 2 | ✅ Completada | Inventario, reportes, PDF, chat, portal cliente mejorado |
| Fase 3 | 🔜 Pendiente | Integración Supabase en producción, notificaciones push |
| Fase 4 | 🔜 Pendiente | App móvil (React Native), módulo de facturación |
| Fase 5 | 🔜 Pendiente | Sistema de citas, integraciones de pago |

---

## 👨‍💻 Autor

**Eduardo Murillo Rojas**  
Proyecto universitario — I Semestre 2026  
Universidad / Curso: Ingeniería de Software

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/TU_USUARIO)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/TU_USUARIO)

---

## 📄 Licencia

MIT License — libre para usar, modificar y distribuir con atribución.

---

<div align="center">
  Hecho con ❤️ y ☕ · AutoGest Pro © 2026
</div>
