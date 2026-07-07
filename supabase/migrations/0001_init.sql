-- CRM Imperial: contactos de comunidad + posts guardados, cruzados por tema de interés.
create extension if not exists pgcrypto;

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  skool_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Relación N:N contacto <-> tema. "pending_action" guarda lo que quedó pendiente
-- con ese contacto sobre ese tema puntual (ej: "enviarle el link del curso").
create table if not exists contact_topics (
  contact_id uuid not null references contacts(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  context text,
  pending_action text,
  created_at timestamptz not null default now(),
  primary key (contact_id, topic_id)
);

-- Relación N:N post <-> tema.
create table if not exists post_topics (
  post_id uuid not null references posts(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, topic_id)
);

create index if not exists contact_topics_topic_id_idx on contact_topics (topic_id);
create index if not exists post_topics_topic_id_idx on post_topics (topic_id);
