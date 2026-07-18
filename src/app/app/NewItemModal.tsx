"use client";

import { useRef, useState, useTransition } from "react";
import { createContact, createPost } from "@/lib/actions";
import { MentionTextarea } from "./MentionTextarea";

export function NewItemModal({
  defaultTab,
  onClose,
}: {
  defaultTab: "contacto" | "post";
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"contacto" | "post">(defaultTab);
  const [wantsPending, setWantsPending] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(action: (formData: FormData) => Promise<void>) {
    return (formData: FormData) => {
      const rawDate = formData.get("pending_date");
      if (rawDate && typeof rawDate === "string") {
        formData.set("pending_date", new Date(rawDate).toISOString());
      }
      startTransition(async () => {
        await action(formData);
        onClose();
      });
    };
  }

  const labelClass =
    "font-mono text-[13px] uppercase tracking-wide text-muted";
  const inputClass =
    "bg-content border border-panel-border rounded-[var(--radius-control)] px-3 py-2 text-sm outline-none focus:border-accent w-full";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] bg-panel border border-panel-border rounded-[var(--radius-panel)] p-6 flex flex-col gap-4"
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("contacto")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              tab === "contacto"
                ? "bg-accent text-accent-ink"
                : "border border-panel-border text-muted"
            }`}
          >
            Contacto
          </button>
          <button
            type="button"
            onClick={() => setTab("post")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              tab === "post"
                ? "bg-accent text-accent-ink"
                : "border border-panel-border text-muted"
            }`}
          >
            Post
          </button>
        </div>

        {tab === "contacto" ? (
          <form
            key="contacto"
            ref={formRef}
            action={handleSubmit(createContact)}
            className="flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Nombre</span>
              <input name="name" required className={inputClass} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>URL de perfil</span>
              <input name="skool_url" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Tema</span>
              <input
                name="topics"
                placeholder="separados por coma"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Nota</span>
              <MentionTextarea
                name="notes"
                rows={3}
                className={inputClass}
                placeholder="También puedes @mencionar contactos"
              />
            </label>
            <PendingToggle
              wantsPending={wantsPending}
              setWantsPending={setWantsPending}
              labelClass={labelClass}
              inputClass={inputClass}
            />
            <Footer onClose={onClose} isPending={isPending} />
          </form>
        ) : (
          <form
            key="post"
            ref={formRef}
            action={handleSubmit(createPost)}
            className="flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1">
              <span className={labelClass}>URL del post</span>
              <input name="url" required className={inputClass} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Título</span>
              <input name="title" required className={inputClass} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Tema</span>
              <input
                name="topics"
                placeholder="separados por coma"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelClass}>Nota</span>
              <MentionTextarea
                name="notes"
                rows={3}
                className={inputClass}
                placeholder="También puedes @mencionar contactos"
              />
            </label>
            <PendingToggle
              wantsPending={wantsPending}
              setWantsPending={setWantsPending}
              labelClass={labelClass}
              inputClass={inputClass}
            />
            <Footer onClose={onClose} isPending={isPending} />
          </form>
        )}
      </div>
    </div>
  );
}

function PendingToggle({
  wantsPending,
  setWantsPending,
  labelClass,
  inputClass,
}: {
  wantsPending: boolean;
  setWantsPending: (v: boolean) => void;
  labelClass: string;
  inputClass: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={wantsPending}
          onChange={(e) => setWantsPending(e.target.checked)}
        />
        Añadir un pendiente
      </label>
      {wantsPending && (
        <>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Pendiente</span>
            <input name="pending_action" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Fecha (opcional)</span>
            <input type="datetime-local" name="pending_date" className={inputClass} />
          </label>
        </>
      )}
    </div>
  );
}

function Footer({
  onClose,
  isPending,
}: {
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-[var(--radius-control)] text-sm border border-panel-border"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 rounded-[var(--radius-control)] text-sm font-medium bg-accent text-accent-ink disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Guardar"}
      </button>
    </div>
  );
}
