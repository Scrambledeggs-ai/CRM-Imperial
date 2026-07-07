"use client";

import { updateContactTopicPending, toggleContactPendingDone } from "@/lib/actions";
import { EditableField } from "../../EditableField";
import { TopicChip } from "../../TopicChip";
import { useTransition } from "react";

export function PendingRow({
  contactId,
  topicId,
  topicName,
  pendingAction,
  pendingDone,
}: {
  contactId: string;
  topicId: string;
  topicName: string;
  pendingAction: string | null;
  pendingDone: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-start gap-2 py-2 border-b border-panel-border last:border-0">
      <input
        type="checkbox"
        checked={pendingDone}
        disabled={!pendingAction || isPending}
        onChange={(e) =>
          startTransition(() =>
            toggleContactPendingDone(contactId, topicId, e.target.checked),
          )
        }
        className="mt-1"
      />
      <div className="flex-1">
        <EditableField
          value={pendingAction ?? ""}
          placeholder="Doble click para agregar un pendiente"
          className={pendingDone ? "line-through opacity-50 text-sm" : "text-sm"}
          onSave={(next) => updateContactTopicPending(contactId, topicId, next)}
        />
        <div className="mt-1">
          <TopicChip name={topicName} />
        </div>
      </div>
    </div>
  );
}
