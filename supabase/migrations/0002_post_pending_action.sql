-- Los posts también pueden tener algo pendiente (ej: "terminar de leerlo", "compartirlo con fulano").
alter table posts add column if not exists pending_action text;
