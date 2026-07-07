"use client";

import { useTransition } from "react";
import { togglePostPendingDone, updatePostPending } from "@/lib/actions";
import { EditableField } from "../../EditableField";

export function PostPendingRow({
  postId,
  pendingAction,
  pendingDone,
}: {
  postId: string;
  pendingAction: string | null;
  pendingDone: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        checked={pendingDone}
        disabled={!pendingAction || isPending}
        onChange={(e) =>
          startTransition(() => togglePostPendingDone(postId, e.target.checked))
        }
        className="mt-1"
      />
      <EditableField
        value={pendingAction ?? ""}
        placeholder="Sin pendientes en este post. Doble click para agregar."
        className={pendingDone ? "line-through opacity-50 text-sm" : "text-sm"}
        onSave={updatePostPending.bind(null, postId)}
      />
    </div>
  );
}
