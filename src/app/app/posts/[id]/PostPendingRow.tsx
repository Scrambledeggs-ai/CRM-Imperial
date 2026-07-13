"use client";

import { useTransition } from "react";
import {
  togglePostPendingDone,
  updatePostPending,
  updatePostPendingDate,
} from "@/lib/actions";
import { EditableField } from "../../EditableField";
import { DateField } from "../../DateField";

export function PostPendingRow({
  postId,
  pendingAction,
  pendingDone,
  pendingDate,
}: {
  postId: string;
  pendingAction: string | null;
  pendingDone: boolean;
  pendingDate: string | null;
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
      <div className="flex-1">
        <EditableField
          value={pendingAction ?? ""}
          placeholder="Sin pendientes en este post. Doble click para agregar."
          className={pendingDone ? "line-through opacity-50 text-sm" : "text-sm"}
          onSave={updatePostPending.bind(null, postId)}
        />
        <div className="mt-1">
          <DateField value={pendingDate} onSave={updatePostPendingDate.bind(null, postId)} />
        </div>
      </div>
    </div>
  );
}
