# Next steps — CRM Imperial

**Ver primero:** `memory.md` en esta misma carpeta — tiene el contexto completo del proyecto (stack, modelo de datos, decisiones, cómo prefiere trabajar el usuario). Este archivo es solo "qué sigue ahora", no repite lo que ya está en memory.md.

## Estado: build de pendientes libres terminado (2026-07-13)

El plan que estaba pendiente (ver historial en `memory.md`) se construyó completo:

- Migración `0006_pendings.sql` aplicada en producción (tabla `pendings` propia, migró los 31 pendientes existentes, borró las columnas viejas de `contact_topics`/`posts`).
- Panel de pendientes en la ficha: lista libre, "+ agregar pendiente", checkbox, fecha opcional, borrar.
- Campo "Tema" en la ficha: editable con doble-click, sincroniza agregar/sacar temas.
- Dashboard, `/app/pendientes`, webhook y exportadores (JSON/SQL) actualizados al nuevo modelo.
- Verificado: `npm run build` limpio, test insert→verificar→limpiar contra la base real, y chequeo del HTML renderizado en `/app`, `/app/pendientes`, ficha de contacto y de post con datos reales de producción.

**No hay tareas pendientes conocidas en este momento.** Falta únicamente el `git push` — el usuario lo hace con su propio token (Claude solo commitea local).

## Si se retoma sin memoria de sesión

Correr `npm run lint` señala 7 errores preexistentes en `ThemeToggle.tsx`, `compartir/page.tsx` y `MergeTopicsForm.tsx` — no están relacionados con este build, quedaron fuera de esta tanda a propósito.
