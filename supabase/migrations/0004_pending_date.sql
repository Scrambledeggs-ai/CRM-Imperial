-- Fecha/hora opcional para un pendiente (ej: "llamar a Carlos, domingo 14:30").
-- Sirve para poder mandarla en el webhook a un calendario externo (Airtable, n8n, etc.).
alter table contact_topics add column if not exists pending_date timestamptz;
alter table posts add column if not exists pending_date timestamptz;
