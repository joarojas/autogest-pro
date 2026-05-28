# 🚀 Guía de Deploy en GitHub

## Paso 1 — Crear repositorio en GitHub
1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `autogest-pro`
3. Descripción: `Sistema de Gestión de Taller Mecánico — React + Bootstrap + Supabase`
4. Selecciona **Public**
5. **NO** marques "Add README" (ya tienes uno)
6. Clic en **Create repository**

## Paso 2 — Subir el código
Abre PowerShell dentro de la carpeta `taller-mecanico` y ejecuta:

```powershell
git init
git add .
git commit -m "feat: AutoGest Pro v2.0 — Sistema completo de gestión de taller"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/autogest-pro.git
git push -u origin main
```

> Reemplaza `TU_USUARIO` con tu usuario real de GitHub

## Paso 3 — Configurar homepage para GitHub Pages
Edita `package.json` y cambia la línea `homepage`:
```json
"homepage": "https://TU_USUARIO.github.io/autogest-pro"
```

Haz commit del cambio:
```powershell
git add package.json
git commit -m "chore: set homepage for GitHub Pages"
git push
```

## Paso 4 — Deploy con GitHub Pages
```powershell
npm run deploy
```
Esto ejecuta `npm run build` y publica en la rama `gh-pages` automáticamente.

## Paso 5 — Activar GitHub Pages
1. Ve a tu repo en GitHub
2. **Settings → Pages**
3. En **Source** selecciona la rama `gh-pages` y carpeta `/ (root)`
4. Clic **Save**
5. Espera ~2 minutos y visita: `https://TU_USUARIO.github.io/autogest-pro`

## Paso 6 — Variables de entorno en producción
GitHub Pages es estático, así que las variables de entorno deben estar en el build.
Crea un archivo `.env` local (no lo subas a git) antes de hacer `npm run deploy`:

```env
REACT_APP_SUPABASE_URL=https://tu-url.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-anon-key
```

Luego:
```powershell
npm run deploy
```

## Actualizaciones futuras
Cada vez que hagas cambios:
```powershell
git add .
git commit -m "descripción del cambio"
git push
npm run deploy   # actualiza la demo pública
```
