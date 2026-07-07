# CRM Imperial

CRM personal + guardador de posts para comunidades de Skool. Dos tablas — **Contactos** y **Posts** — cruzadas por **tema de interés**, para poder responder "¿de qué posts habíamos hablado con Fulano sobre este tema?" sin copiar links a mano en un doc aparte.

Cada persona que use esto corre su propia instancia, con su propio Supabase — no hay datos compartidos entre usuarios.

## Requisitos

- Cuenta gratis en [supabase.com](https://supabase.com)
- Cuenta gratis en [vercel.com](https://vercel.com)

## Setup (una sola vez)

### 1. Crear tu proyecto de Supabase

1. Andá a [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**.
2. Elegí nombre, región y una contraseña de base de datos (guardala, no hace falta para esta app, pero por las dudas).
3. Cuando el proyecto esté listo, andá a **SQL Editor** → **New query**.
4. Pegá el contenido completo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) y dale **Run**.
5. Repetí el paso 4 con [`supabase/migrations/0002_post_pending_action.sql`](supabase/migrations/0002_post_pending_action.sql).
6. Andá a **Settings → API** y copiá dos valores: **Project URL** y la **service_role key** (no la `anon`/`public`).

### 2. Deployar en Vercel

1. Importá este repo en Vercel ([vercel.com/new](https://vercel.com/new)).
2. Antes de deployar (o después, en **Settings → Environment Variables**), cargá estas dos variables en **Production**:
   - `SUPABASE_URL` → la Project URL del paso 1.6
   - `SUPABASE_SERVICE_ROLE_KEY` → la service_role key del paso 1.6
   - Si Vercel te pregunta si el valor es "sensible/sensitive", **respondé que no** — si queda marcado como sensible, la variable no se puede volver a leer y la app no va a poder usarla.
3. Deployá. Listo, ya tenés tu propia instancia funcionando.

### 3. Correrlo local (opcional, para desarrollo)

```bash
npm install
cp .env.example .env.local   # completá las dos variables ahí
npm run dev
```

## Estructura

- `supabase/migrations/` — el esquema de la base (contactos, posts, temas, y las tablas que los cruzan).
- `src/lib/actions.ts` — server actions para crear contactos y posts.
- `src/lib/queries.ts` — lecturas (con filtro por tema).
- `src/app/` — la interfaz (captura rápida, filtro por tema, pendientes).
