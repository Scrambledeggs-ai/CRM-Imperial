"use client";

import { useState, useTransition } from "react";
import { mergeTopics } from "@/lib/actions";

type Topic = { id: string; name: string; contactCount: number; postCount: number };

export function MergeTopicsForm({ topics }: { topics: Topic[] }) {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectClass =
    "bg-content border border-panel-border rounded-[var(--radius-control)] px-3 py-2 text-sm outline-none focus:border-accent";

  function submit() {
    if (!source || !target || source === target) return;
    startTransition(async () => {
      await mergeTopics(source, target);
      setSource("");
      setTarget("");
      setConfirming(false);
    });
  }

  return (
    <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel p-5 flex flex-col gap-3">
      <p className="text-sm text-muted">
        Fusioná temas duplicados (ej: &quot;ia&quot; + &quot;inteligencia artificial&quot;) — el tema de
        origen desaparece, todo lo que tenía queda vinculado al de destino.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={selectClass}
        >
          <option value="">Fusionar tema…</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.contactCount + t.postCount})
            </option>
          ))}
        </select>
        <span className="text-sm text-muted">dentro de</span>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className={selectClass}
        >
          <option value="">elige destino…</option>
          {topics
            .filter((t) => t.id !== source)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.contactCount + t.postCount})
              </option>
            ))}
        </select>

        {!confirming ? (
          <button
            type="button"
            disabled={!source || !target}
            onClick={() => setConfirming(true)}
            className="px-3 py-2 rounded-[var(--radius-control)] text-sm font-medium bg-accent text-accent-ink disabled:opacity-50"
          >
            Fusionar
          </button>
        ) : (
          <>
            <span className="text-sm text-muted">¿Seguro? No se puede deshacer.</span>
            <button
              type="button"
              disabled={isPending}
              onClick={submit}
              className="px-3 py-2 rounded-[var(--radius-control)] text-sm text-red-400 border border-red-400/40"
            >
              {isPending ? "Fusionando…" : "Sí, fusionar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="px-3 py-2 rounded-[var(--radius-control)] text-sm border border-panel-border"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
