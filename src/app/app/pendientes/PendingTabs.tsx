"use client";

import { useState } from "react";
import { togglePendingDone } from "@/lib/actions";
import { PendingListItem } from "./PendingListItem";

type ContactPending = {
  id: string;
  text: string;
  done: boolean;
  due_date: string | null;
  contact: { id: string; name: string };
};
type PostPending = {
  id: string;
  text: string;
  done: boolean;
  due_date: string | null;
  post: { id: string; title: string; url: string };
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
          {contacts.map((item) => (
            <PendingListItem
              key={item.id}
              label={item.text}
              done={item.done}
              date={item.due_date}
              href={`/app/contactos/${item.contact.id}`}
              meta={`Contacto · ${item.contact.name}`}
              onToggle={togglePendingDone.bind(null, item.id)}
            />
          ))}
        </div>
      )}

      {showPosts && (
        <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel px-5">
          {posts.length === 0 && (
            <p className="text-sm text-muted py-4">Nada pendiente por acá.</p>
          )}
          {posts.map((item) => (
            <PendingListItem
              key={item.id}
              label={item.text}
              done={item.done}
              date={item.due_date}
              href={`/app/posts/${item.post.id}`}
              meta={`Post · ${item.post.title}`}
              onToggle={togglePendingDone.bind(null, item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
