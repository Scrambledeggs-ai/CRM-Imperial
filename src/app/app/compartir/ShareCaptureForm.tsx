"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/lib/actions";

export function ShareCaptureForm({
  defaultUrl,
  defaultTitle,
}: {
  defaultUrl: string;
  defaultTitle: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const inputClass =
    "bg-panel border border-panel-border rounded-[var(--radius-control)] px-3 py-2 text-sm outline-none focus:border-accent w-full";
  const labelClass = "font-mono text-[13px] uppercase tracking-wide text-muted";

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await createPost(formData);
          router.push("/app");
        })
      }
      className="flex flex-col gap-3 max-w-lg"
    >
      <label className="flex flex-col gap-1">
        <span className={labelClass}>URL del post</span>
        <input name="url" required defaultValue={defaultUrl} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Título</span>
        <input name="title" required defaultValue={defaultTitle} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Tema</span>
        <input name="topics" placeholder="separados por coma" className={inputClass} />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="self-start px-4 py-2 rounded-[var(--radius-control)] text-sm font-medium bg-accent text-accent-ink disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Guardar post"}
      </button>
    </form>
  );
}
