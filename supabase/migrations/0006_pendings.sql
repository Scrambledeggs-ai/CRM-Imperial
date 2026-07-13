-- Los pendientes pasan a ser una tabla propia: cantidad libre por contacto o por post,
-- ya no atados a un tema. Migra los datos existentes y borra las columnas viejas.
create table if not exists pendings (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  done boolean not null default false,
  due_date timestamptz,
  contact_id uuid references contacts(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint pendings_one_owner check (
    (contact_id is not null and post_id is null) or
    (contact_id is null and post_id is not null)
  )
);

create index if not exists pendings_contact_id_idx on pendings (contact_id);
create index if not exists pendings_post_id_idx on pendings (post_id);

insert into pendings (text, done, due_date, contact_id, created_at)
select pending_action, pending_done, pending_date, contact_id, created_at
from contact_topics
where pending_action is not null;

insert into pendings (text, done, due_date, post_id, created_at)
select pending_action, pending_done, pending_date, id, created_at
from posts
where pending_action is not null;

alter table contact_topics drop column if exists pending_action;
alter table contact_topics drop column if exists pending_done;
alter table contact_topics drop column if exists pending_date;

alter table posts drop column if exists pending_action;
alter table posts drop column if exists pending_done;
alter table posts drop column if exists pending_date;
