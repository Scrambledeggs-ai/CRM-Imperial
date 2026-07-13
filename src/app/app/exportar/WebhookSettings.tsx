"use client";

import { useState, useTransition } from "react";
import { setSetting } from "@/lib/actions";

export function WebhookSettings({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await setSetting("webhook_url", value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel p-5 flex flex-col gap-2">
      <h2 className="font-mono text-[13px] uppercase tracking-wide text-muted">Webhook</h2>
      <p className="text-sm text-muted">
        Si lo completás, cada vez que se crea, edita o borra un contacto o post se
        manda un POST con un JSON a esta URL (útil para Airtable, n8n, etc.).
      </p>
      <div className="flex gap-2 mt-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://..."
          className="flex-1 bg-content border border-panel-border rounded-[var(--radius-control)] px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="px-4 py-2 rounded-[var(--radius-control)] text-sm font-medium bg-accent text-accent-ink disabled:opacity-50"
        >
          {isPending ? "Guardando…" : saved ? "Guardado ✓" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
