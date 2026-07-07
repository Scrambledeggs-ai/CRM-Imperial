"use client";

import { useRef, useState, useTransition } from "react";
import { createContact, createPost } from "@/lib/actions";

export function QuickCapture() {
  const [tab, setTab] = useState<"post" | "contact">("post");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(action: (formData: FormData) => Promise<void>) {
    return (formData: FormData) => {
      startTransition(async () => {
        await action(formData);
        formRef.current?.reset();
      });
    };
  }

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab("post")}
          className={`px-3 py-1.5 rounded text-sm font-medium ${
            tab === "post"
              ? "bg-foreground text-background"
              : "bg-black/5 dark:bg-white/10"
          }`}
        >
          + Post
        </button>
        <button
          type="button"
          onClick={() => setTab("contact")}
          className={`px-3 py-1.5 rounded text-sm font-medium ${
            tab === "contact"
              ? "bg-foreground text-background"
              : "bg-black/5 dark:bg-white/10"
          }`}
        >
          + Contacto
        </button>
      </div>

      {tab === "post" ? (
        <form
          key="post"
          ref={formRef}
          action={handleSubmit(createPost)}
          className="grid gap-2"
        >
          <input
            name="url"
            required
            placeholder="URL del post en Skool"
            className="rounded border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <input
            name="title"
            required
            placeholder="Título / resumen corto"
            className="rounded border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <input
            name="topics"
            placeholder="Temas, separados por coma (ej: marketing, ia)"
            className="rounded border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <textarea
            name="notes"
            placeholder="Notas (opcional)"
            rows={2}
            className="rounded border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <input
            name="pending_action"
            placeholder="Pendiente (ej: terminar de leerlo, comentar)"
            className="rounded border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="justify-self-start rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Guardar post"}
          </button>
        </form>
      ) : (
        <form
          key="contact"
          ref={formRef}
          action={handleSubmit(createContact)}
          className="grid gap-2"
        >
          <input
            name="name"
            required
            placeholder="Nombre del compañero"
            className="rounded border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <input
            name="skool_url"
            placeholder="URL de su perfil en Skool (opcional)"
            className="rounded border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <input
            name="topics"
            placeholder="Temas de los que hablaron, separados por coma"
            className="rounded border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <textarea
            name="notes"
            placeholder="Qué sabe / a qué se dedica (opcional)"
            rows={2}
            className="rounded border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <input
            name="pending_action"
            placeholder="Pendiente (ej: enviarle el link del curso)"
            className="rounded border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="justify-self-start rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Guardar contacto"}
          </button>
        </form>
      )}
    </div>
  );
}
