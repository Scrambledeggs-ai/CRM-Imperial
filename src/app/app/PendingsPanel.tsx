"use client";

import { useState, useTransition } from "react";
import {
  addPending,
  deletePending,
  togglePendingDone,
  updatePendingDate,
  updatePendingText,
} from "@/lib/actions";
import { EditableField } from "./EditableField";
import { DateField } from "./DateField";
import type { Pending } from "@/lib/types";

type Target = { contactId: string } | { postId: string };

export function PendingsPanel({ target, pendings }: { target: Target; pendings: Pending[] }) {
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function submitNew() {
    const text = draft.trim();
    if (!text) {
      setAdding(false);
      return;
    }
    startTransition(async () => {
      await addPending(target, text);
      setDraft("");
      setAdding(false);
    });
  }

  return (
    <div className="flex flex-col">
      {pendings.length === 0 && !adding && (
        <p className="text-sm text-muted mb-2">Nada pendiente por acá.</p>
      )}
      {pendings.map((p) => (
        <div
          key={p.id}
          className="group flex items-start gap-2 py-2 border-b border-panel-border last:border-0"
        >
          <input
            type="checkbox"
            checked={p.done}
            disabled={isPending}
            onChange={(e) => startTransition(() => togglePendingDone(p.id, e.target.checked))}
            className="mt-1"
          />
          <div className="flex-1">
            <EditableField
              value={p.text}
              className={p.done ? "line-through opacity-50 text-sm" : "text-sm"}
              onSave={(next) => updatePendingText(p.id, next)}
            />
            <div className="mt-1">
              <DateField value={p.due_date} onSave={(iso) => updatePendingDate(p.id, iso)} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => startTransition(() => deletePending(p.id))}
            title="Borrar pendiente"
            className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 text-xs mt-1 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}

      {adding ? (
        <input
          autoFocus
          value={draft}
          disabled={isPending}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={submitNew}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitNew();
            }
            if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          placeholder="nuevo pendiente"
          className="text-sm bg-content border border-panel-border rounded-[var(--radius-control)] px-2 py-1.5 mt-2 outline-none focus:border-accent"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-sm text-muted hover:text-accent mt-2 text-left"
        >
          + agregar pendiente
        </button>
      )}
    </div>
  );
}
