# Memoria del proyecto — CRM Imperial

Archivo vivo en la carpeta del proyecto (no en la memoria oculta de Claude Code) — así cualquier sesión nueva que se abra acá lo puede leer directo, sin depender de en qué "cajón" de memoria haya caído la sesión. Complementa a `NEXT_STEPS.md` (que es efímero, "qué falta ahora") — esto es el conocimiento durable: qué es el proyecto, cómo está armado, y por qué se tomaron las decisiones importantes.

## Qué es

CRM personal + guardador de posts para la comunidad de Skool "Imperio". Dos tablas — **Contactos** y **Posts** — cruzadas por **tema de interés**, para responder "¿de qué posts hablé con Fulano sobre tal tema?" sin copiar links a mano en un doc aparte. Un solo usuario, sin login — cada persona que lo use corre su propia instancia con su propio Supabase (no es multitenant).

Se construyó como mini-app propia (no Airtable/Notion) por elección explícita del usuario, después de comparar opciones de fricción mínima.

## Stack y dónde vive cada cosa

- **Next.js 16** (App Router, sin Cache Components — se descartó por complejidad innecesaria a esta escala) + **Supabase** (Postgres) + **Vercel**.
- Proyecto Vercel: `carlos-casares-projects/crm-imperial`. Proyecto Supabase dedicado (ref `bizzzoqgzxbytdyygloo`, org `gyxibosiuvnbwtzhykve`) — separado del que usa afiapp a propósito.
- Repo: **github.com/Scrambledeggs-ai/CRM-Imperial** (público — para que la comunidad lo pueda clonar). El usuario pushea él mismo con su token; Claude solo hace commits locales, nunca `git push`.
- Producción: **https://crm-imperial.vercel.app**
- Auth: server-only, `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (sin anon key, sin prefijo `NEXT_PUBLIC_`) — todo el acceso a datos pasa por Server Actions/Server Components, nunca desde el navegador.

## Modelo de datos

Tablas: `contacts`, `posts`, `topics`, joins N:N `contact_topics` y `post_topics` (el tema conecta ambas), y `pendings` (texto + `done` + `due_date` opcional, vinculada a `contact_id` o `post_id` — nunca ambos, constraint `pendings_one_owner` — cantidad libre por contacto/post). Migraciones en `supabase/migrations/`.

**Historial:** hasta la migración `0006_pendings.sql` (2026-07-13), el pendiente vivía atado al tema (`contact_topics.pending_action`, uno por tema vinculado) o único por post (`posts.pending_action`). Eso impedía tener más de un pendiente libre y arriesgaba con perder un pendiente al sacar un tema. La 0006 creó `pendings`, migró los datos existentes (31 filas en producción) y borró las columnas viejas. Confirmado con test insert→verificar→limpiar contra la base real antes de darlo por cerrado.

## Decisiones de arquitectura importantes (por qué quedó así)

- **Se descartó el Postgres self-hosted de `/agency-stack`** (compartido con n8n, sin puerto publicado) — hubiera requerido exponer el puerto 5432 en el firewall del VPS, demasiado riesgo/fricción para una app personal.
- **Se descartó reusar el Supabase de afiapp** — mezclaría datos de dos productos distintos; se creó un proyecto Supabase dedicado.
- **Búsqueda:** coincidencia parcial simple (`ILIKE`), no full-text de Postgres ni búsqueda semántica — cubre el caso real ("me acuerdo de una palabra suelta") sin sumar migraciones ni dependencias de IA.
- **Listas largas:** sidebar `sticky` + buscador, sin paginación — la paginación se consideró fricción innecesaria a este volumen.
- **Menciones `@Nombre`:** se guardan por ID (`@[Nombre](contactId)`), no por texto plano — sobrevive a que renombres el contacto después. Autocompleta contra `/api/contacts/search`.
- **Webhook:** configurable desde `/app/exportar` (tabla `settings` key/value en la base), con `WEBHOOK_URL` como fallback por env var — el usuario prefería no depender de entrar a Vercel para esto.
- **Exportar:** JSON + SQL (dump con INSERTs, restaurable en cualquier Postgres) + CSV — se descartó Excel nativo (CSV ya lo abre) y se descartó invocar la CLI de Supabase desde un botón (técnicamente imposible desde un server de Vercel).
- **PWA:** share target completo en Android/Chrome/Brave; en iOS/Safari el soporte queda limitado a propósito, sin perseguir paridad (implicaría una app nativa, fuera de alcance).

Historial completo de decisiones, con la pregunta/motivo de cada una: `bitacora-decisiones.html` en la raíz del proyecto (armada con la skill `/bitacora`, tiene sesiones colapsables).

## Build de pendientes libres — terminado (2026-07-13)

Se construyó completo el plan que estaba en "en curso":

1. `pendings` como tabla propia, cantidad libre por contacto/post, migración de datos + borrado de columnas viejas.
2. Panel "Pendientes" en la ficha: lista real con checkbox, texto editable (doble-click), fecha opcional, borrar (✕), y "+ agregar pendiente" — componente `PendingsPanel.tsx` compartido entre contacto y post.
3. Campo "Tema" en la ficha: pasó de botón "+ tema" a campo de texto editable con doble-click (`TopicsField.tsx`), mismo formato que la creación (separado por coma), sincroniza agregar y sacar temas libremente vía `updateContactTopics`/`updatePostTopics`.
4. Ajustado: tarjetas del dashboard (`ContactCard`/`PostCard` ahora leen `pendings[]`), `/app/pendientes` (query unificada contra la tabla `pendings`), webhook (`pending.updated` se dispara al cambiar la fecha de un pendiente), y `sqlDump.ts`/export JSON (incluyen la tabla `pendings`).

**Sigue sin hacer falta** un botón "Editar contacto/post" que reabra la ficha completa — la ficha ya creada tiene todos los campos visibles y editables en el lugar (doble-click), patrón que el usuario prefiere.

## Menciones @ en el modal de captura rápida — terminado (2026-07-18)

El campo Nota del modal (+Contacto/+Post) era un textarea plano desde que existen las menciones — nunca estuvo conectado a `EditableField`, así que el autocompletado de `@` solo funcionaba editando la ficha ya creada, no al crear. El usuario lo interpretó como una regresión ("andaba y dejó de andar") hasta que se confirmó con el historial de git que nunca estuvo cableado ahí.

Fix (rama `feat/menciones-captura-rapida`, mergeada a `main` en fast-forward): se sacó `findActiveMention` de `EditableField.tsx` a `src/lib/mentions.tsx` (ya tenía `renderWithMentions`, queda como el archivo compartido de lógica de menciones) y se creó `MentionTextarea.tsx` — mismo comportamiento de detectar `@` y mostrar `MentionDropdown`, pero como campo siempre-editable (controlado, con `name` para que lo lea el `FormData` del form nativo) en vez del patrón ver/editar de `EditableField`. Probado a mano contra producción vía `npm run dev` local (mismo Supabase) antes del merge.

**Resuelto el mismo día, commit aparte (`3056f41`):** el error de hidratación de `layout.tsx` (se agregó `suppressHydrationWarning` al `<html>`), `ThemeToggle.tsx` reescrito con `useSyncExternalStore` en vez de `useState`+`useEffect` (sacaba el error de lint `react-hooks/set-state-in-effect`), y los 7 errores de lint preexistentes en `compartir/page.tsx`/`MergeTopicsForm.tsx` (comillas sin escapar). De paso, todo el copy de la app se pasó a español neutro — estaba en voseo argentino ("Guardá", "Escribí", "¿Querés?") por default de sesiones anteriores, pero el usuario pidió específicamente que no lleve modismos regionales.

## Menciones en Pendientes, buscar por @mención, "Quién sabe de esto" y recordatorios vencidos — terminado (2026-07-18)

Cuatro features en una sola tanda (rama `feat/menciones-quien-sabe-recordatorios`, mergeada a `main` fast-forward), pedidos por el usuario tras una sesión de debugging del sistema de menciones:

1. **Menciones en Pendientes**: `PendingsPanel.tsx` — el texto de un pendiente (existente, vía `EditableField enableMentions`, y el de "+ agregar pendiente", con la misma lógica de `findActiveMention`/`MentionDropdown` inline ya que ese input es controlado y no pasa por `EditableField`).
2. **Buscar por @mención desde `/app`**: si el término de búsqueda empieza con `@`, `getContacts`/`getPosts` (en `queries.ts`) ya no hacen texto plano — resuelven el nombre a un contacto real (`findContactsByName`) y buscan menciones reales `](id)` en notas (`findMentionMatches`), no coincidencias de texto suelto. Antes, escribir "@Nombre" no encontraba nada (el campo `name` no tiene `@`) y a veces traía falsos positivos si alguien había escrito "@Nombre" a mano sin usar el desplegable.
3. **"Quién sabe de esto"**: `getTopicExperts(topicId)` en `queries.ts` — ranking de contactos por tema, sumando 2 puntos por estar tagueado directo con el tema y 1 punto por cada mención en notas de posts/contactos tagueados con ese tema (parseadas con `extractMentionedIds`, nuevo helper en `mentions.tsx`). Se muestra como panel en `/app` cuando hay un `?topic=` activo.
4. **Recordatorio de pendientes vencidos**: migración `0007_overdue_notified.sql` agrega `pendings.overdue_notified`. Al entrar a `/app/pendientes` (`OverdueChecker.tsx`, patrón `useEffect` igual que `ServiceWorkerRegister.tsx`), se llama a `checkOverduePendings()` (`actions.ts`) que dispara el webhook `pending.overdue` una sola vez por pendiente vencido y no marcado. Decisión explícita del usuario: chequeo al visitar la página, no un cron job — más simple, sin infraestructura nueva.

Probado contra producción real vía `npm run dev` local antes de mergear: búsqueda `@jhon` (trae al contacto + posts que lo mencionan de verdad) y `@Carlos Dominguez` (ya no trae el post con el falso positivo de texto plano), ranking de un tema real, y `/app/pendientes` antes/después de que el usuario corriera la migración 0007 en el SQL Editor de Supabase.

## Deploy a producción — el auto-deploy por GitHub nunca estuvo realmente activo

Se investigó a fondo (2026-07-18) por qué un `git push` a `main` no actualizaba `crm-imperial.vercel.app`. Hallazgo, confirmado con evidencia dura: **los 18 commits del historial completo del repo, incluido el primerísimo, tienen 0 status checks de Vercel en GitHub** (`gh api repos/.../commits/<sha>/status` → `pending`, 0 statuses, siempre). O sea, la integración Git nunca estuvo conectada de verdad — todos los deployments que aparecen en `vercel ls` salieron de `vercel deploy --prod` manual (probablemente corridos por Claude Code en sesiones anteriores), no de pushes. El usuario reconectó el repo dos veces (desde la web de Vercel y con `vercel git connect` por CLI) sin que cambiara nada — se descartó que sea un tema de permisos de organización (la cuenta de GitHub es personal, no una org). Razón exacta sin confirmar todavía.

**Mientras tanto: el flujo real de deploy es manual.** Después de cada `git push`, hay que correr `vercel deploy --prod` aparte (Claude sí puede correr este comando, a diferencia de `git push` — no es una limitación técnica, es la CLI de Vercel vs. la convención de que el usuario pushea con su token).

## Gotchas específicos de este proyecto

- **Vercel marca las env vars como "sensibles" (write-only) por defecto en Production**, aunque no lo pida explícitamente — si una var vuelve vacía después de cargada, es la causa más probable. Arreglar con `vercel env rm <name> <env> --yes` + `vercel env add <name> <env> --no-sensitive --force --value "..."`.
- Procesos en background con `&`/`nohup`/`disown` no sobreviven entre llamadas de Bash en este entorno — usar el parámetro nativo de background de la herramienta.
- `CRM Imperial.pdf` y la carpeta `capturas/` (material del post del concurso, no código) se movieron fuera del repo, a `../CRM-Imperial-historial/` (carpeta hermana en `agency-stack/projects/`, sin git) — ya no aparecen como untracked.
- `bitacora-decisiones.html` u otros cambios sueltos que ya estén modificados sin commitear al empezar una tarea quedan **fuera** de cualquier commit de esa tarea por defecto, sin necesidad de volver a preguntarlo — solo se comitea lo que pertenece al alcance de la tarea en curso.

## Cómo prefiere trabajar el usuario en este proyecto

- Explicar el *por qué* de una decisión antes de dar el próximo paso — no solo comandos en cadena.
- Comandos de terminal: aclarar siempre si van pegados o de a uno (los que abren prompts interactivos, uno por uno).
- Probar contra la base de datos real (insert → verificar → limpiar) antes de dar algo por terminado, no solo confiar en que el build pase.
- Nunca pedirle secrets/keys por el chat — si hace falta algo así, dar el comando para que lo corra él en su propia terminal.
- No asumir que la memoria de Claude Code va a estar disponible entre sesiones — por eso existe este archivo.
