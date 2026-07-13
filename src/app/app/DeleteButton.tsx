"use client";

import { useState, useTransition } from "react";

export function DeleteButton({
  onDelete,
  label,
}: {
  onDelete: () => Promise<void>;
  label: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">¿Seguro?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => onDelete())}
          className="px-2.5 py-1 rounded-[var(--radius-control)] text-red-400 border border-red-400/40 hover:bg-red-400/10 disabled:opacity-50"
        >
          {isPending ? "Borrando…" : "Sí, borrar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1 rounded-[var(--radius-control)] border border-panel-border"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm text-muted hover:text-red-400"
    >
      {label}
    </button>
  );
}
