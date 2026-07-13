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

## Gotchas específicos de este proyecto

- **Vercel marca las env vars como "sensibles" (write-only) por defecto en Production**, aunque no lo pida explícitamente — si una var vuelve vacía después de cargada, es la causa más probable. Arreglar con `vercel env rm <name> <env> --yes` + `vercel env add <name> <env> --no-sensitive --force --value "..."`.
- Procesos en background con `&`/`nohup`/`disown` no sobreviven entre llamadas de Bash en este entorno — usar el parámetro nativo de background de la herramienta.
- `CRM Imperial.pdf` y la carpeta `capturas/` en la raíz quedan fuera del repo a propósito (material del post del concurso, no código).

## Cómo prefiere trabajar el usuario en este proyecto

- Explicar el *por qué* de una decisión antes de dar el próximo paso — no solo comandos en cadena.
- Comandos de terminal: aclarar siempre si van pegados o de a uno (los que abren prompts interactivos, uno por uno).
- Probar contra la base de datos real (insert → verificar → limpiar) antes de dar algo por terminado, no solo confiar en que el build pase.
- Nunca pedirle secrets/keys por el chat — si hace falta algo así, dar el comando para que lo corra él en su propia terminal.
- No asumir que la memoria de Claude Code va a estar disponible entre sesiones — por eso existe este archivo.
