"use client";

import { useState } from "react";

export function FeedbackCta() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function send() {
    const subject = encodeURIComponent("CRM Imperial v2.0 - idea");
    const body = encodeURIComponent(text);
    window.location.href = `mailto:flow@zenau.ai?subject=${subject}&body=${body}`;
    setOpen(false);
    setText("");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-center px-3 py-2 rounded-[var(--radius-control)] text-xs font-mono border border-dashed border-panel-border text-muted hover:text-accent hover:border-accent"
      >
        ¿Quieres v2.0?
        <br />
        Pide tu función →
      </button>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-[var(--radius-control)] border border-panel-border p-3">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
        Tu idea para v2.0
      </span>
      <textarea
        autoFocus
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Cuéntanos qué función te gustaría..."
        className="bg-content border border-panel-border rounded-[var(--radius-control)] px-2 py-1.5 text-sm outline-none focus:border-accent resize-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 px-2 py-1.5 rounded-[var(--radius-control)] text-xs border border-panel-border"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={send}
          disabled={!text.trim()}
          className="flex-1 px-2 py-1.5 rounded-[var(--radius-control)] text-xs font-medium bg-accent text-accent-ink disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
