import Link from "next/link";
import { TopicChip } from "./TopicChip";
import type { ContactWithTopics } from "@/lib/types";

export function ContactCard({ contact }: { contact: ContactWithTopics }) {
  const pending = contact.topics.filter(
    (t): t is typeof t & { pending_action: string } => Boolean(t.pending_action),
  );

  return (
    <Link
      href={`/app/contactos/${contact.id}`}
      className="block rounded-[var(--radius-panel)] border border-panel-border bg-panel p-4 hover:border-accent transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[17px] font-semibold">{contact.name}</span>
        {contact.topics[0] && <TopicChip name={contact.topics[0].topic.name} />}
      </div>
      {contact.notes && (
        <p className="text-sm text-muted mt-1 line-clamp-2">{contact.notes}</p>
      )}
      {pending.length > 0 && (
        <p className="text-sm text-amber-400 mt-2">⏳ {pending[0].pending_action}</p>
      )}
    </Link>
  );
}
