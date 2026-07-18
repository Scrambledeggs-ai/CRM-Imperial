-- Para avisar por webhook cuando un pendiente vence sin marcar, sin repetir
-- el mismo aviso cada vez que se visita /app/pendientes.
alter table pendings add column if not exists overdue_notified boolean not null default false;
