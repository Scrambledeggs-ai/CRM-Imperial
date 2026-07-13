# CRM Imperial

CRM personal + guardador de posts para comunidades de Skool. Dos tablas — **Contactos** y **Posts** — cruzadas por **tema de interés**, para poder responder "¿de qué posts habíamos hablado con Fulano sobre este tema?" sin copiar links a mano en un doc aparte.

Cada persona que use esto corre su propia instancia, con su propio Supabase — no hay datos compartidos entre usuarios.

## Funciones

- Captura rápida de contactos y posts, cruzados por tema.
- Fichas editables (doble click en cualquier campo), con posibilidad de agregar temas nuevos y borrar contactos/posts.
- Pendientes con fecha/hora opcional, tachables, con checklist agrupado en `/app/pendientes`.
- Menciones con `@` en las notas (autocompleta contra tus contactos, guarda por ID — sobrevive a renombres). Cada contacto muestra dónde fue mencionado.
- Fusión de temas duplicados en `/app/temas`.
- Exportar todo en JSON, SQL (dump restaurable en cualquier Postgres) o CSV, en `/app/exportar`.
- Webhook opcional en creación/edición/borrado — se configura pegando la URL directo en `/app/exportar`, sin tocar Vercel (también se puede setear como `WEBHOOK_URL` si preferís env var). Útil para mandar los datos a Airtable, n8n, o donde quieras.
- Instalable como PWA, con soporte de "compartir" desde el celular (Android/Chrome/Brave) directo a un post nuevo.

## Requisitos

- Cuenta gratis en [supabase.com](https://supabase.com)
- Cuenta gratis en [vercel.com](https://vercel.com)

## Setup (una sola vez)

### 1. Crear tu proyecto de Supabase

1. Andá a [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**.
2. Elegí nombre, región y una contraseña de base de datos (guardala, no hace falta para esta app, pero por las dudas).
3. Cuando el proyecto esté listo, andá a **SQL Editor** → **New query**.
4. Pegá y ejecutá, en orden, cada archivo de [`supabase/migrations/`](supabase/migrations/) (`0001_init.sql` a `0006_pendings.sql`).
5. Andá a **Settings → API** y copiá dos valores: **Project URL** y la **service_role key** (no la `anon`/`public`).

### 2. Deployar en Vercel

1. Importá este repo en Vercel ([vercel.com/new](https://vercel.com/new)).
2. Antes de deployar (o después, en **Settings → Environment Variables**), cargá estas variables en **Production**:
   - `SUPABASE_URL` → la Project URL del paso 1.5
   - `SUPABASE_SERVICE_ROLE_KEY` → la service_role key del paso 1.5
   - `WEBHOOK_URL` → opcional, alternativa a configurarlo desde `/app/exportar` una vez deployado
   - Si Vercel te pregunta si el valor es "sensible/sensitive", **respondé que no** — si queda marcado como sensible, la variable no se puede volver a leer y la app no va a poder usarla.
3. Deployá. Listo, ya tenés tu propia instancia funcionando.

### 3. Correrlo local (opcional, para desarrollo)

```bash
npm install
cp .env.example .env.local   # completá las variables ahí
npm run dev
```

## Estructura

- `supabase/migrations/` — el esquema de la base (contactos, posts, temas, y las tablas que los cruzan).
- `src/lib/actions.ts` — server actions (crear, editar, borrar, fusionar temas).
- `src/lib/queries.ts` — lecturas (filtro por tema, búsqueda, menciones).
- `src/lib/webhook.ts` — disparo opcional a `WEBHOOK_URL`.
- `src/app/` — landing pública (`/`) + app (`/app`, con sidebar, pendientes, exportar, temas, ficha de contacto/post).
