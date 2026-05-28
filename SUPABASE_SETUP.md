# 🗄 Guía de Configuración Supabase

## Paso 1 — Crear cuenta y proyecto
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto (elige la región más cercana)
3. Espera ~2 minutos mientras se inicializa

## Paso 2 — Obtener credenciales
1. Ve a **Project Settings → API**
2. Copia `Project URL` → va en `REACT_APP_SUPABASE_URL`
3. Copia `anon public` key → va en `REACT_APP_SUPABASE_ANON_KEY`

## Paso 3 — Crear las tablas
1. Ve a **SQL Editor** en el menú lateral
2. Crea un nuevo query
3. Copia y pega TODO el bloque SQL que está dentro del comentario en `src/services/supabase.js`
4. Clic en **Run**

## Paso 4 — Configurar Storage (para imágenes de inventario)
El SQL ya crea el bucket automáticamente. Si falla:
1. Ve a **Storage** en el menú lateral
2. Crea un bucket llamado `inventario`
3. Márcalo como **Public**

## Paso 5 — Conectar con la app
```bash
cp .env.example .env
# Edita .env con tus credenciales
npm start
```

## Activar tiempo real (chat y notificaciones)
1. Ve a **Database → Replication**
2. Activa replicación para las tablas: `mensajes_chat` y `notificaciones`

## ⚠️ Importante para producción
- Cambia las políticas RLS de "Acceso total demo" por políticas reales con autenticación
- Nunca expongas el `service_role` key, solo usa `anon` key en el frontend
