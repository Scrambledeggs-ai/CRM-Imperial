-- Permite tachar un pendiente como hecho sin borrar el texto.
alter table contact_topics add column if not exists pending_done boolean not null default false;
alter table posts add column if not exists pending_done boolean not null default false;
