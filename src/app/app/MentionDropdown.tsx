"use client";

import { useEffect, useState } from "react";

export function MentionDropdown({
  query,
  onPick,
}: {
  query: string;
  onPick: (contact: { id: string; name: string }) => void;
}) {
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      fetch(`/api/contacts/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setResults(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  if (results.length === 0) return null;

  return (
    <div className="absolute z-10 mt-1 w-56 bg-panel border border-panel-border rounded-[var(--radius-control)] shadow-lg overflow-hidden">
      {results.map((c) => (
        <button
          key={c.id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(c);
          }}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-ink"
        >
          @{c.name}
        </button>
      ))}
    </div>
  );
}
