"use client";

import { useState, useTransition } from "react";
import { TopicChip } from "./TopicChip";

export function TopicsField({
  topicNames,
  onSave,
}: {
  topicNames: string[];
  onSave: (raw: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(topicNames.join(", "));
  const [isPending, startTransition] = useTransition();

  function commit() {
    setEditing(false);
    startTransition(() => onSave(draft));
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        disabled={isPending}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setDraft(topicNames.join(", "));
            setEditing(false);
          }
        }}
        placeholder="separados por coma"
        className="text-sm px-2 py-1 rounded-md border border-accent bg-panel outline-none w-64 max-w-full"
      />
    );
  }

  return (
    <div
      onDoubleClick={() => {
        setDraft(topicNames.join(", "));
        setEditing(true);
      }}
      title="Doble click para editar los temas"
      className={`flex flex-wrap items-center gap-1.5 cursor-text rounded-md px-0.5 -mx-0.5 hover:bg-panel-border/30 ${
        isPending ? "opacity-50" : ""
      }`}
    >
      {topicNames.length > 0 ? (
        topicNames.map((name) => <TopicChip key={name} name={name} />)
      ) : (
        <span className="text-sm text-muted italic">Sin tema — doble click para agregar</span>
      )}
    </div>
  );
}
