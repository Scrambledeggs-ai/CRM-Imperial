"use client";

import { useState, useTransition } from "react";

export function AddTopicChip({
  onAdd,
  variant = "chip",
}: {
  onAdd: (topicName: string) => Promise<void>;
  variant?: "chip" | "empty";
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

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

  if (!open) {
    if (variant === "empty") {
      return (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Click para agregar un tema"
          className="text-sm text-muted italic hover:text-accent cursor-text"
        >
          Sin tema — click para agregar
        </button>
      );
    }
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
      className={
        variant === "empty"
          ? "text-sm px-2 py-1 rounded-md border border-accent bg-panel outline-none w-48"
          : "text-xs px-2.5 py-1 rounded-full border border-accent bg-panel outline-none w-32"
      }
    />
  );
}
