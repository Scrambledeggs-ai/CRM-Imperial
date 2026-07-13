# Next steps — CRM Imperial

**Estado:** 2026-07-13, fin de sesión. Producción funcionando en https://crm-imperial.vercel.app. Sesión muy larga (usuario la marcó "75%+ pasada de eficiencia") — retomar en sesión nueva, no hace falta repetir contexto, está todo acá.

## Decisión tomada, falta construir mañana

**Pedido original del usuario** (no una alternativa mía): poder editar un contacto/post ya creado reabriendo **la misma ficha completa de creación** (el modal de "+ Contacto" / "+ Post"), pre-cargada con los valores actuales — nombre, tema(s), notas, pendiente — todo junto, en un solo lugar.

Yo había ofrecido en su lugar la edición campo-por-campo con doble-click, que al usuario le gustó y quedó para nombre/notas/URL/pendiente-texto — **pero eso no era su pedido original**, y no logró resolver el caso de "tema" después de varias vueltas (ver abajo). Conclusión de la sesión: agregar un botón **"Editar"** en la ficha de contacto y en la de post, que reabra el formulario de creación pre-cargado. Aplica a **ambos** (contacto y post — mismo problema, mismo arreglo en los dos, no solo contacto).

**No tocar lo que ya funciona bien:** el doble-click en nombre/notas/URL/pendiente sigue gustándole al usuario — no hay que sacarlo. La pregunta abierta es si el botón "Editar" **reemplaza** o **convive** con el doble-click; no se llegó a definir, preguntar al retomar.

## Bug de fondo que motivó todo esto (no resuelto, posiblemente ya no haga falta resolver si se construye el "Editar")

El usuario reportó, probando en vivo en producción: al agregar un tema con el botón "+" (`AddTopicChip`) a un contacto/post ya creado, el tema nuevo **aparece solo en el panel de Pendientes, no al lado del chip de tema original** (cerca del nombre). Mi propia verificación con `curl` contra producción sugería que sí aparecía en los dos lugares, pero **el usuario lo probó en vivo y confirmó que no** — hay que confiar en su reporte por sobre mi verificación con curl, algo no está bien ahí (posible problema de revalidación/cache de React Server Components, no investigado a fondo). Si se construye el botón "Editar contacto"/"Editar post" (arriba), es probable que este bug quede obsoleto — pero si por algún motivo se decide seguir con doble-click para tema, hay que investigar esto primero.

## Cambio sin commitear en este momento

`src/app/app/contactos/[id]/PendingRow.tsx` — le saqué el `<TopicChip>` redundante que se mostraba dentro de cada fila de Pendientes (quedaba duplicado con el chip de arriba, cerca del nombre). Es un cambio chico y correcto en sí mismo (reduce ruido visual), pero **no resuelve el problema de fondo** — el usuario lo confirmó explícitamente. Decidir mañana si se mantiene tal cual, se lleva a post también (hoy solo está en contacto), o se descarta.

## Contexto para no repetir

- Todo el resto de las últimas dos tandas grandes (CRUD completo, exportar JSON/CSV/SQL, webhook configurable desde `/app/exportar`, menciones @, fusión de temas, PWA) está **en producción y funcionando**, confirmado.
- Repo: github.com/Scrambledeggs-ai/CRM-Imperial (público). El usuario pushea él mismo con su token — Claude solo hace commits locales, nunca push.
- `CRM Imperial.pdf` y `capturas/` en la raíz quedan fuera del repo a propósito (material del post del concurso).
