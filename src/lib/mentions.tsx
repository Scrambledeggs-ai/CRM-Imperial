import Link from "next/link";
import type { ReactNode } from "react";

// Formato de mención: @[Nombre](contactId) — guarda el ID, no el nombre,
// así sobrevive a que renombres al contacto más adelante.
const MENTION_RE = /@\[([^\]]+)\]\(([a-f0-9-]{36})\)/g;

// Detecta si el cursor está en medio de escribir una mención (después de un
// "@" sin espacio ni cierre todavía) y devuelve dónde empieza y qué se
// escribió hasta ahora, para buscar contactos que matcheen.
export function findActiveMention(
  text: string,
  cursor: number,
): { start: number; query: string } | null {
  const upToCursor = text.slice(0, cursor);
  const at = upToCursor.lastIndexOf("@");
  if (at === -1) return null;
  const between = upToCursor.slice(at + 1);
  if (/[\s\]\)]/.test(between)) return null;
  return { start: at, query: between };
}

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
