import Link from "next/link";
import type { ReactNode } from "react";

// Formato de mención: @[Nombre](contactId) — guarda el ID, no el nombre,
// así sobrevive a que renombres al contacto más adelante.
const MENTION_RE = /@\[([^\]]+)\]\(([a-f0-9-]{36})\)/g;

export function renderWithMentions(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  MENTION_RE.lastIndex = 0;
  while ((match = MENTION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const [, name, id] = match;
    parts.push(
      <Link
        key={`mention-${key++}`}
        href={`/app/contactos/${id}`}
        className="text-accent hover:underline"
      >
        @{name}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}
