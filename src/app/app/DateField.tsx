"use client";

import { useState, useTransition } from "react";

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function formatDisplay(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DateField({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (isoOrEmpty: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <input
        type="datetime-local"
        autoFocus
        defaultValue={toLocalInputValue(value)}
        disabled={isPending}
        onBlur={(e) => {
          setEditing(false);
          const iso = e.target.value ? new Date(e.target.value).toISOString() : "";
          startTransition(() => onSave(iso));
        }}
        className="text-xs bg-panel border border-panel-border rounded-[var(--radius-control)] px-2 py-1 outline-none focus:border-accent"
      />
    );
  }

  const display = formatDisplay(value);

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`text-xs ${display ? "text-muted" : "text-muted italic"} hover:text-accent`}
    >
      {display ?? "+ fecha"}
    </button>
  );
}
