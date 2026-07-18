import { notFound } from "next/navigation";
import Link from "next/link";
import { getContact, getContactMentions } from "@/lib/queries";
import { updateContactField, updateContactTopics, deleteContact } from "@/lib/actions";
import { topicColor } from "@/lib/topicColor";
import { EditableField } from "../../EditableField";
import { TopicsField } from "../../TopicsField";
import { DeleteButton } from "../../DeleteButton";
import { PendingsPanel } from "../../PendingsPanel";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();
  const mentions = await getContactMentions(id);

  const initials = contact.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const avatarColor = topicColor(contact.topics[0]?.topic.name ?? contact.name);

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link href="/app" className="text-sm text-muted hover:text-accent w-fit">
          ← Volver
        </Link>
        <DeleteButton label="Borrar contacto" onDelete={deleteContact.bind(null, contact.id)} />
      </div>

      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold shrink-0"
            style={{ backgroundColor: avatarColor.bg, color: avatarColor.hex }}
          >
            {initials}
          </div>
          <div>
            <h1 className="text-[30px] font-bold leading-tight">
              <EditableField
                value={contact.name}
                onSave={updateContactField.bind(null, contact.id, "name")}
              />
            </h1>
            <div className="mt-2">
              <TopicsField
                topicNames={contact.topics.map((t) => t.topic.name)}
                onSave={updateContactTopics.bind(null, contact.id)}
              />
            </div>
            <div className="mt-2 text-sm text-muted">
              <EditableField
                value={contact.skool_url ?? ""}
                placeholder="Doble click para agregar URL de perfil"
                onSave={updateContactField.bind(null, contact.id, "skool_url")}
              />
              {contact.skool_url && (
                <a
                  href={contact.skool_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-accent hover:underline"
                >
                  ↗ Ver perfil en Skool
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel p-5">
          <h2 className="font-mono text-[13px] uppercase tracking-wide text-muted mb-3">
            Notas
          </h2>
          <EditableField
            as="textarea"
            enableMentions
            value={contact.notes ?? ""}
            placeholder="Doble click para agregar notas — qué sabe, a qué se dedica. En tus notas también puedes @mencionar a otros contactos."
            onSave={updateContactField.bind(null, contact.id, "notes")}
            className="text-sm leading-relaxed block"
          />
        </div>

        <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel p-5">
          <h2 className="font-mono text-[13px] uppercase tracking-wide text-muted mb-3">
            Pendientes
          </h2>
          <PendingsPanel target={{ contactId: contact.id }} pendings={contact.pendings} />
        </div>
      </section>

      {(mentions.contacts.length > 0 || mentions.posts.length > 0) && (
        <section className="rounded-[var(--radius-panel)] border border-panel-border bg-panel p-5">
          <h2 className="font-mono text-[13px] uppercase tracking-wide text-muted mb-3">
            Mencionado en
          </h2>
          <div className="flex flex-wrap gap-2">
            {mentions.contacts.map((c) => (
              <Link
                key={c.id}
                href={`/app/contactos/${c.id}`}
                className="text-sm px-2.5 py-1 rounded-full border border-panel-border hover:border-accent"
              >
                {c.name}
              </Link>
            ))}
            {mentions.posts.map((p) => (
              <Link
                key={p.id}
                href={`/app/posts/${p.id}`}
                className="text-sm px-2.5 py-1 rounded-full border border-panel-border hover:border-accent"
              >
                {p.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
