"use client";

import { useRef, useState, useTransition } from "react";
import { findActiveMention, renderWithMentions } from "@/lib/mentions";
import { MentionDropdown } from "./MentionDropdown";

export function EditableField({
  value,
  onSave,
  as = "text",
  className = "",
  placeholder = "Doble click para editar",
  enableMentions = false,
}: {
  value: string;
  onSave: (next: string) => Promise<void>;
  as?: "text" | "textarea";
  className?: string;
  placeholder?: string;
  enableMentions?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isPending, startTransition] = useTransition();
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  function commit() {
    if (mention) return; // no cerrar mientras se está eligiendo una mención
    setEditing(false);
    if (draft === value) return;
    startTransition(() => onSave(draft));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setDraft(e.target.value);
    if (enableMentions) {
      const cursor = e.target.selectionStart ?? e.target.value.length;
      setMention(findActiveMention(e.target.value, cursor));
    }
  }

  function pickMention(contact: { id: string; name: string }) {
    if (!mention) return;
    const cursor = ref.current?.selectionStart ?? draft.length;
    const token = `@[${contact.name}](${contact.id}) `;
    const next = draft.slice(0, mention.start) + token + draft.slice(cursor);
    setDraft(next);
    setMention(null);
    ref.current?.focus();
  }

  if (editing) {
    const Field = as === "textarea" ? "textarea" : "input";
    return (
      <div className="relative">
        <Field
          ref={ref as never}
          autoFocus
          value={draft}
          rows={as === "textarea" ? 4 : undefined}
          onChange={handleChange}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && as === "text" && !mention) {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              if (mention) {
                setMention(null);
              } else {
                setDraft(value);
                setEditing(false);
              }
            }
          }}
          className={`bg-panel border border-panel-border rounded-md px-2 py-1 w-full outline-none focus:border-accent ${className}`}
        />
        {mention && <MentionDropdown query={mention.query} onPick={pickMention} />}
      </div>
    );
  }

  return (
    <span
      onDoubleClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title="Doble click para editar"
      className={`cursor-text rounded-md px-0.5 -mx-0.5 hover:bg-panel-border/30 ${
        isPending ? "opacity-50" : ""
      } ${!value ? "text-muted italic" : ""} ${className}`}
    >
      {value ? (enableMentions ? renderWithMentions(value) : value) : placeholder}
    </span>
  );
}
