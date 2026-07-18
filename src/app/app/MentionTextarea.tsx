"use client";

import { useRef, useState } from "react";
import { findActiveMention } from "@/lib/mentions";
import { MentionDropdown } from "./MentionDropdown";

export function MentionTextarea({
  name,
  rows = 3,
  className = "",
  placeholder,
}: {
  name: string;
  rows?: number;
  className?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const cursor = e.target.selectionStart ?? e.target.value.length;
    setMention(findActiveMention(e.target.value, cursor));
  }

  function pickMention(contact: { id: string; name: string }) {
    if (!mention) return;
    const cursor = ref.current?.selectionStart ?? value.length;
    const token = `@[${contact.name}](${contact.id}) `;
    const next = value.slice(0, mention.start) + token + value.slice(cursor);
    setValue(next);
    setMention(null);
    ref.current?.focus();
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        name={name}
        rows={rows}
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Escape" && mention) setMention(null);
        }}
        placeholder={placeholder}
        className={className}
      />
      {mention && <MentionDropdown query={mention.query} onPick={pickMention} />}
    </div>
  );
}
