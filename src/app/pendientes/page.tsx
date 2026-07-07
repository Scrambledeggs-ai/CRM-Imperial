import Link from "next/link";
import { getPendingItems } from "@/lib/queries";
import { toggleContactPendingDone, togglePostPendingDone } from "@/lib/actions";
import { PendingCheckbox } from "./PendingCheckbox";

export default async function PendientesPage() {
  const { contacts, posts } = await getPendingItems();
  const pendingCount =
    contacts.filter((c) => !c.pending_done).length +
    posts.filter((p) => !p.pending_done).length;

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8 max-w-4xl mx-auto flex flex-col gap-8">
      <header>
        <Link href="/" className="text-sm underline opacity-80">
          ← Volver
        </Link>
        <h1 className="text-xl font-semibold mt-2">
          Pendientes ({pendingCount})
        </h1>
        <p className="text-sm opacity-60">
          Todo lo que quedó por hacer, de contactos y posts, en un solo lugar.
          Tildá para marcar como hecho.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-60">
          Contactos
        </h2>
        {contacts.length === 0 && (
          <p className="text-sm opacity-60">Nada pendiente por acá.</p>
        )}
        {contacts.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-black/10 dark:border-white/15 p-3"
          >
            <PendingCheckbox
              done={item.pending_done}
              label={item.pending_action}
              onToggle={toggleContactPendingDone.bind(
                null,
                item.contact.id,
                item.topic?.id ?? "",
              )}
            />
            <p className="text-sm mt-1 pl-6">
              <span className="font-medium">{item.contact.name}</span>
              {item.topic && (
                <span className="opacity-60"> — tema: {item.topic.name}</span>
              )}
            </p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-60">
          Posts
        </h2>
        {posts.length === 0 && (
          <p className="text-sm opacity-60">Nada pendiente por acá.</p>
        )}
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-lg border border-black/10 dark:border-white/15 p-3"
          >
            <PendingCheckbox
              done={post.pending_done}
              label={post.pending_action}
              onToggle={togglePostPendingDone.bind(null, post.id)}
            />
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline pl-6 block"
            >
              {post.title}
            </a>
          </div>
        ))}
      </section>
    </div>
  );
}
