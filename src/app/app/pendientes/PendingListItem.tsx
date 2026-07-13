"use client";

import Link from "next/link";
import { useTransition } from "react";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PendingListItem({
  label,
  done,
  meta,
  href,
  date,
  onToggle,
}: {
  label: string;
  done: boolean;
  meta: string;
  href: string;
  date?: string | null;
  onToggle: (done: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const formattedDate = formatDate(date ?? null);

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
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={href} className="text-xs text-muted hover:text-accent">
            {meta}
          </Link>
          {formattedDate && (
            <span className="text-xs text-accent">📅 {formattedDate}</span>
          )}
        </div>
      </div>
    </div>
  );
}
