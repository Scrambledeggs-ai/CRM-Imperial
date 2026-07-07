"use client";

import Link from "next/link";
import { useTransition } from "react";

export function PendingListItem({
  label,
  done,
  meta,
  href,
  onToggle,
}: {
  label: string;
  done: boolean;
  meta: string;
  href: string;
  onToggle: (done: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-start gap-3 py-3 border-b border-panel-border last:border-0">
      <input
        type="checkbox"
        checked={done}
        disabled={isPending}
        onChange={(e) => startTransition(() => onToggle(e.target.checked))}
        className="mt-1 w-5 h-5 accent-[var(--accent)]"
      />
      <div className="min-w-0">
        <p className={`text-[17px] ${done ? "line-through opacity-50" : ""}`}>
          {label}
        </p>
        <Link href={href} className="text-xs text-muted hover:text-accent">
          {meta}
        </Link>
      </div>
    </div>
  );
}
