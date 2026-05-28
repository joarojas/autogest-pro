// src/services/supabase.js
// ─── Configuración de Supabase ────────────────────────────────────────────────
// Reemplaza estas variables con las tuyas desde supabase.com → Project Settings → API
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://TU_URL.supabase.co";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "TU_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
═══════════════════════════════════════════════════════════════════════════════
  ESQUEMA SQL — Ejecuta esto en Supabase → SQL Editor
═══════════════════════════════════════════════════════════════════════════════

-- CLIENTES
create table clientes (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  telefono    text,
  correo      text,
  cedula      text unique not null,
  created_at  timestamptz default now()
);

-- VEHÍCULOS
create table vehiculos (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid references clientes(id) on delete cascade,
  placa       text unique not null,
  marca       text not null,
  modelo      text not null,
  año         integer,
  color       text,
  created_at  timestamptz default now()
);

-- ÓRDENES DE SERVICIO
create table ordenes (
  id                    uuid primary key default gen_random_uuid(),
  cliente_id            uuid references clientes(id),
  vehiculo_id           uuid references vehiculos(id),
  estado                text default 'Recibido',
  responsable           text,
  fecha_ingreso         date default current_date,
  fecha_estimada        date,
  fecha_actualizacion   timestamptz default now(),
  observaciones         text default '',
  hallazgos             text default '',
  observaciones_cierre  text default '',
  checklist             jsonb default '{}',
  fotos                 jsonb default '[]',
  created_at            timestamptz default now()
);

-- SERVICIOS DE ÓRDENES (catálogo + personalizados)
create table orden_servicios (
  id          uuid primary key default gen_random_uuid(),
  orden_id    uuid references ordenes(id) on delete cascade,
  servicio_id text,             -- null si es personalizado
  nombre      text not null,
  precio      integer default 0,
  duracion    text,
  nota        text,
  es_custom   boolean default false,
  created_at  timestamptz default now()
);

-- NOTIFICACIONES
create table notificaciones (
  id          uuid primary key default gen_random_uuid(),
  orden_id    uuid references ordenes(id) on delete cascade,
  mensaje     text not null,
  tipo        text default 'info',  -- info | warning | success | error
  fecha       date default current_date,
  created_at  timestamptz default now()
);

-- CHAT
create table mensajes_chat (
  id          uuid primary key default gen_random_uuid(),
  orden_id    uuid references ordenes(id) on delete cascade,
  remitente   text not null,       -- 'mecanico' | 'cliente'
  nombre      text,
  contenido   text not null,
  leido       boolean default false,
  created_at  timestamptz default now()
);

-- INVENTARIO
create table inventario (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  categoria    text not null,
  cantidad     integer default 0,
  cantidad_min integer default 5,
  unidad       text default 'unidad',
  precio       integer default 0,
  proveedor    text,
  imagen_url   text,
  descripcion  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Trigger para updated_at en inventario
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
create trigger inventario_updated_at before update on inventario
  for each row execute function update_updated_at();

-- Row Level Security (básico para demo — ajustar en producción)
alter table clientes       enable row level security;
alter table vehiculos      enable row level security;
alter table ordenes        enable row level security;
alter table orden_servicios enable row level security;
alter table notificaciones enable row level security;
alter table mensajes_chat  enable row level security;
alter table inventario     enable row level security;

create policy "Acceso total demo" on clientes       for all using (true);
create policy "Acceso total demo" on vehiculos      for all using (true);
create policy "Acceso total demo" on ordenes        for all using (true);
create policy "Acceso total demo" on orden_servicios for all using (true);
create policy "Acceso total demo" on notificaciones for all using (true);
create policy "Acceso total demo" on mensajes_chat  for all using (true);
create policy "Acceso total demo" on inventario     for all using (true);

-- Storage bucket para imágenes de inventario
insert into storage.buckets (id, name, public) values ('inventario', 'inventario', true);
create policy "Imágenes públicas" on storage.objects for select using (bucket_id = 'inventario');
create policy "Subir imágenes"    on storage.objects for insert with check (bucket_id = 'inventario');
create policy "Eliminar imágenes" on storage.objects for delete using (bucket_id = 'inventario');

═══════════════════════════════════════════════════════════════════════════════
*/
