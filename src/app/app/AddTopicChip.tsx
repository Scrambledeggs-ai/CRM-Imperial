"use client";

import { useState, useTransition } from "react";

export function AddTopicChip({
  onAdd,
}: {
  onAdd: (topicName: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs px-2.5 py-1 rounded-full border border-dashed border-panel-border text-muted hover:text-accent hover:border-accent"
      >
        + tema
      </button>
    );
  }

  function submit() {
    const name = value.trim();
    if (!name) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await onAdd(name);
      setValue("");
      setOpen(false);
    });
  }

  return (
    <input
      autoFocus
      value={value}
      disabled={isPending}
      onChange={(e) => setValue(e.target.value)}
      onBlur={submit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submit();
        }
        if (e.key === "Escape") {
          setValue("");
          setOpen(false);
        }
      }}
      placeholder="nombre del tema"
      className="text-xs px-2.5 py-1 rounded-full border border-accent bg-panel outline-none w-32"
    />
  );
}
