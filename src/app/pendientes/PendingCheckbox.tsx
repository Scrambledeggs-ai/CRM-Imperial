"use client";

import { useTransition } from "react";

export function PendingCheckbox({
  done,
  label,
  onToggle,
}: {
  done: boolean;
  label: string;
  onToggle: (done: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={done}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.checked;
          startTransition(() => onToggle(next));
        }}
        className="mt-1"
      />
      <span
        className={
          done
            ? "line-through opacity-50"
            : "text-amber-600 dark:text-amber-400"
        }
      >
        {label}
      </span>
    </label>
  );
}
