# Handoff: CRM Imperial — Rediseño de Frontend

## Overview
Rediseño visual completo del frontend de **CRM Imperial** (contactos y posts de comunidad, cruzados por tema), en la misma línea visual usada en la presentación del concurso. Cubre landing pública + 5 pantallas de la app (dashboard, detalle de contacto, detalle de post, pendientes, formulario nuevo).

**No incluye ni modifica backend.** El proyecto real usa Next.js 16 (App Router + Server Actions) + Supabase (Postgres) + Vercel — eso no cambia. Este paquete es solo la capa visual/UI.

## About the Design Files
El archivo `frontend-mockups.html` es una **referencia de diseño hecha en HTML/CSS puro** (con clases y estilos inline) — no es código de producción para copiar y pegar. La tarea es **recrear estas pantallas dentro de tu app Next.js real**, usando tus componentes, tu data-fetching (Server Actions / Supabase) y tu estructura de rutas ya existentes. Trata este HTML como un mockup de alta fidelidad al que debes igualar visualmente, no como el árbol de componentes final.

Cada pantalla en el HTML está envuelta en un "chrome" de navegador falso (barra de pestañas + URL) — eso es solo para presentación, ignóralo al implementar; no es parte del diseño real de la página.

## Fidelidad
**Alta fidelidad (hifi).** Colores, tipografía, espaciado y contenido de ejemplo son finales — impleméntalos tal cual, no como referencia aproximada.

## Cómo integrar sin romper lo que ya funciona
1. Trabaja en una rama nueva (`git checkout -b rediseno-frontend`).
2. Es un cambio **solo de presentación**: no toques las funciones/Server Actions que leen y escriben en Supabase, ni los nombres de props que ya usan tus componentes de datos — solo el JSX/CSS que envuelve esos datos.
3. Ve pantalla por pantalla (landing → home → detalle contacto → detalle post → pendientes → formulario). Verifica en cada una que los datos reales (nombres, temas, URLs, pendientes) siguen llegando desde Supabase igual que antes; lo único que cambia es cómo se ven.
4. Extrae piezas repetidas a componentes compartidos a medida que avances: `TopicChip`, `ContactCard`, `PostCard`, `SidebarNav`, `PendienteRow` — se repiten en varias pantallas con el mismo estilo.
5. Prueba build (`npm run build`) después de cada pantalla, no al final — más fácil detectar qué rompiste.

## Screens / Views

### 1. Landing (pública, sin login)
- **Propósito**: presentar la app antes de entrar; sin autenticación.
- **Layout**: nav superior (logo + texto "Producto"/"Comunidad" + botón "Entrar") · hero de dos columnas (texto 620px máx a la izquierda, ilustración de nodos SVG 300×300 a la derecha) · franja de 3 tarjetas de features en grid de 3 columnas, gap 22px.
- **Botón "Entrar"** (nav y hero): ancla `#landing-features` que hace scroll suave a la franja de tarjetas — **no** es login, la app no requiere autenticación.
- **Botón "Ver cómo funciona"**: mismo ancla `#landing-features`.
- Colores: fondo `#0a0e18`, tarjetas `#10182b` con borde `1px solid rgba(241,239,232,0.08)`.
- Tipografía: headline 56px/700, subcopy 19px/400 color `#c3cad8`.

### 2. Home (dashboard)
- **Propósito**: vista principal — contactos y posts cruzados por tema.
- **Layout**: sidebar fija 220px (`#0a0e18`) con logo, nav (Inicio activo / Pendientes) y botones "+ Contacto" / "+ Post" al fondo · contenido a la derecha con chips de filtro por tema y grid 2 columnas (Contactos | Posts).
- Chip activo ("Todos"): fondo `#2dd4bf`, texto `#06221d`, font-weight 600. Chips inactivos: borde `1px solid rgba(241,239,232,0.16)`.
- Tarjeta de contacto: nombre 17px/600, chip de tema a la derecha (color por tema — ver Design Tokens), línea de pendiente con "⏳" si tiene alguno.
- Tarjeta de post: título 17px/600 + chip de tema.

### 3. Detalle de contacto
- **Layout**: mismo sidebar · header con avatar circular (iniciales, 64px, fondo del color del tema), nombre 30px/700, chip de tema, enlace "↗ Ver perfil en Skool", botón "Editar" a la derecha · debajo, grid 2 columnas: Notas (1.3fr) y Pendientes (1fr, con checkbox + botón "+ Añadir").

### 4. Detalle de post
- **Layout**: igual estructura que contacto · card de "link preview" del post (ícono ↗, título del post, dominio, botón "Abrir post ↗") · grid Notas / Pendiente (estado vacío: "Sin pendientes en este post.").

### 5. Vista de pendientes
- **Layout**: sidebar (Pendientes activo) · tabs de filtro (Todos / Personas / Posts) · lista de filas: checkbox cuadrado (20px, borde color del tema), texto del pendiente 17px, metadata debajo ("Contacto · nombre" o "Post · título" + chip de tema).

### 6. Formulario nuevo (Contacto / Post)
- **Layout**: modal/card centrado 560px · tabs internos Contacto/Post (activo: fondo `#2dd4bf`) · campos apilados con labels mayúsculas mono 13px: Nombre, URL de perfil, Tema (chips seleccionables + "+ nuevo tema"), Nota (textarea) · toggle "Añadir un pendiente" · footer Cancelar/Guardar.

## Interactions & Behavior
- Chips de tema: estado activo = relleno teal; el resto, solo borde. Click cambia filtro (no implementado en el HTML, es visual).
- Toggle de pendiente en el formulario: al activarse debería revelar un input de texto para el pendiente (no incluido en el mock, agrégalo al implementar).
- Sin animaciones complejas — transiciones simples de color/opacidad en hover son suficientes (no especificadas explícitamente, usa tu criterio, 150–200ms ease).
- Responsive: **no diseñado** — estos mocks son solo desktop (1280px). Definir el comportamiento mobile queda pendiente; avísenme si quieren que lo cubra.

## State Management
- Filtro de tema activo (Home, Pendientes).
- Tab activo en formulario nuevo (Contacto vs Post).
- Toggle de "añadir pendiente" en el formulario.
- Todo lo demás (contactos, posts, pendientes, notas) ya vive en Supabase — no cambia.

## Design Tokens

**Colores**
- Fondo app: `#0a0e18` (sidebar/base), `#0b1120` (contenido)
- Panel/tarjeta: `#10182b`, borde `rgba(241,239,232,0.08)`
- Texto principal: `#f1efe8`
- Texto secundario/muted: `#98a2b6` / `#8b95a9`
- Acento primario: `#2dd4bf` (teal) — texto sobre acento: `#06221d`
- Colores de tema (rotar por tema, usados en chips y avatares):
  - rojo `#ef4444` (fondo chip `rgba(239,68,68,0.16)`, texto `#f89a9a`)
  - azul `#3b82f6` (fondo chip `rgba(59,130,246,0.16)`, texto `#9ec2fb`)
  - amarillo `#f2c94c`
  - teal `#14b8a6` (fondo chip `rgba(45,212,191,0.16)`, texto `#7ee7d8`)
  - verde `#22c55e` (fondo chip `rgba(34,197,94,0.16)`, texto `#86efac`)

**Tipografía**
- Encabezados/UI: `Space Grotesk` (400/500/600/700), vía Google Fonts
- Labels/mono/caps: `IBM Plex Mono` (400/500/600)
- Escala: 30px/700 (títulos de detalle), 24px/600 (títulos de sección), 17px/600 (nombres en tarjeta), 15px (body), 13–14px (labels, metadata)

**Espaciado / forma**
- Border-radius: 10px (botones/inputs), 14–16px (tarjetas), 999px (chips y pills)
- Sidebar: 220px de ancho fijo
- Padding de contenido: 34px 44px

## Assets
- `assets/imperio-logo.png` — logo original (fondo blanco), usar sobre superficies claras.
- `assets/imperio-logo-light.png` — versión recoloreada (trazo crema, nodos de color intactos) para fondo oscuro — la que se usa en todas las pantallas de este rediseño.
- Fuentes: Google Fonts `Space Grotesk` + `IBM Plex Mono` (link en el `<head>` del HTML de referencia).

## Files
- `frontend-mockups.html` — las 6 pantallas, autocontenido, ábrelo en cualquier navegador para verlas y copiar valores exactos (inspecciona con devtools si necesitas un color o medida puntual).
