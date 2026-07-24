-- Vincula cada post con su autor (contacto), para ver el historial de
-- participación por persona. Nullable: los posts guardados a mano pueden
-- no tener autor conocido. Lo llena el sync de skool-digest.
alter table posts add column if not exists contact_id uuid references contacts(id) on delete set null;
create index if not exists posts_contact_id_idx on posts (contact_id);
