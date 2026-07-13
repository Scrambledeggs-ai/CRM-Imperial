import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost } from "@/lib/queries";
import { updatePostField, updatePostTopics, deletePost } from "@/lib/actions";
import { EditableField } from "../../EditableField";
import { TopicsField } from "../../TopicsField";
import { DeleteButton } from "../../DeleteButton";
import { PendingsPanel } from "../../PendingsPanel";

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link href="/app" className="text-sm text-muted hover:text-accent w-fit">
          ← Volver
        </Link>
        <DeleteButton label="Borrar post" onDelete={deletePost.bind(null, post.id)} />
      </div>

      <header>
        <h1 className="text-[30px] font-bold leading-tight">
          <EditableField
            value={post.title}
            onSave={updatePostField.bind(null, post.id, "title")}
          />
        </h1>
        <div className="mt-2">
          <TopicsField
            topicNames={post.topics.map((t) => t.name)}
            onSave={updatePostTopics.bind(null, post.id)}
          />
        </div>
      </header>

      <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg shrink-0">↗</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              <EditableField
                value={post.url}
                onSave={updatePostField.bind(null, post.id, "url")}
              />
            </p>
            <p className="text-xs text-muted truncate">{domainOf(post.url)}</p>
          </div>
        </div>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 rounded-[var(--radius-control)] text-sm font-medium bg-accent text-accent-ink"
        >
          Abrir post ↗
        </a>
      </div>

      <section className="grid gap-6 sm:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel p-5">
          <h2 className="font-mono text-[13px] uppercase tracking-wide text-muted mb-3">
            Notas
          </h2>
          <EditableField
            as="textarea"
            enableMentions
            value={post.notes ?? ""}
            placeholder="Doble click para agregar notas. Escribí @ para mencionar a un contacto."
            onSave={updatePostField.bind(null, post.id, "notes")}
            className="text-sm leading-relaxed block"
          />
        </div>

        <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel p-5">
          <h2 className="font-mono text-[13px] uppercase tracking-wide text-muted mb-3">
            Pendientes
          </h2>
          <PendingsPanel target={{ postId: post.id }} pendings={post.pendings} />
        </div>
      </section>
    </div>
  );
}
