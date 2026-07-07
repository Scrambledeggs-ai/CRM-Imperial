"use client";

import { useRef, useState, useTransition } from "react";

export function EditableField({
  value,
  onSave,
  as = "text",
  className = "",
  placeholder = "Doble click para editar",
}: {
  value: string;
  onSave: (next: string) => Promise<void>;
  as?: "text" | "textarea";
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  function commit() {
    setEditing(false);
    if (draft === value) return;
    startTransition(() => onSave(draft));
  }

  if (editing) {
    const Field = as === "textarea" ? "textarea" : "input";
    return (
      <Field
        ref={ref as never}
        autoFocus
        value={draft}
        rows={as === "textarea" ? 4 : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && as === "text") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`bg-panel border border-panel-border rounded-md px-2 py-1 w-full outline-none focus:border-accent ${className}`}
      />
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
      {value || placeholder}
    </span>
  );
}
