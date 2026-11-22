"use client";

import { useState } from "react";
import { ConfirmButton } from "@/components/ui/confirm-dialog";

export const defaultCopy = {
  title: "Delete this mailbox?",
  description: "Its mail is removed for good and cannot be restored.",
  confirm: "Delete",
  cancel: "Cancel",
  trigger: "Delete mailbox",
  deleted: "Deleted",
};

export default function ConfirmDialogDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <ConfirmButton
        variant="destructive"
        title={copy.title}
        description={copy.description}
        confirmLabel={copy.confirm}
        cancelLabel={copy.cancel}
        destructive
        onConfirm={() => setDeleted(true)}
      >
        {copy.trigger}
      </ConfirmButton>
      <span className="text-sm text-muted-foreground" role="status">
        {deleted ? copy.deleted : ""}
      </span>
    </div>
  );
}
