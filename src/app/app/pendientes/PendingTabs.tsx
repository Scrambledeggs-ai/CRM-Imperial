"use client";

import { useState } from "react";
import { toggleContactPendingDone, togglePostPendingDone } from "@/lib/actions";
import { PendingListItem } from "./PendingListItem";

type ContactPending = {
  contact: { id: string; name: string };
  topic: { id: string; name: string } | null;
  pending_action: string;
  pending_done: boolean;
};
type PostPending = {
  id: string;
  title: string;
  url: string;
  pending_action: string;
  pending_done: boolean;
};

export function PendingTabs({
  contacts,
  posts,
}: {
  contacts: ContactPending[];
  posts: PostPending[];
}) {
  const [tab, setTab] = useState<"todos" | "personas" | "posts">("todos");

  const showContacts = tab === "todos" || tab === "personas";
  const showPosts = tab === "todos" || tab === "posts";

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-medium ${
      active ? "bg-accent text-accent-ink" : "border border-panel-border text-muted"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <button className={tabClass(tab === "todos")} onClick={() => setTab("todos")}>
          Todos
        </button>
        <button
          className={tabClass(tab === "personas")}
          onClick={() => setTab("personas")}
        >
          Personas
        </button>
        <button className={tabClass(tab === "posts")} onClick={() => setTab("posts")}>
          Posts
        </button>
      </div>

      {showContacts && (
        <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel px-5">
          {contacts.length === 0 && (
            <p className="text-sm text-muted py-4">Nada pendiente por acá.</p>
          )}
          {contacts.map((item, i) => (
            <PendingListItem
              key={i}
              label={item.pending_action}
              done={item.pending_done}
              href={`/app/contactos/${item.contact.id}`}
              meta={`Contacto · ${item.contact.name}${
                item.topic ? ` · ${item.topic.name}` : ""
              }`}
              onToggle={toggleContactPendingDone.bind(
                null,
                item.contact.id,
                item.topic?.id ?? "",
              )}
            />
          ))}
        </div>
      )}

      {showPosts && (
        <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel px-5">
          {posts.length === 0 && (
            <p className="text-sm text-muted py-4">Nada pendiente por acá.</p>
          )}
          {posts.map((post) => (
            <PendingListItem
              key={post.id}
              label={post.pending_action}
              done={post.pending_done}
              href={`/app/posts/${post.id}`}
              meta={`Post · ${post.title}`}
              onToggle={togglePostPendingDone.bind(null, post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
