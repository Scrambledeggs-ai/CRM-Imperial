-- Configuración simple key-value (ej: URL del webhook), editable desde la app,
-- sin depender de una env var que solo se puede tocar desde Vercel.
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
