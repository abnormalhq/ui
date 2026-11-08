"use client";

import { useState } from "react";
import { ConfirmButton } from "@/components/ui/confirm-dialog";

export default function ConfirmDialogDemo() {
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <ConfirmButton
        variant="destructive"
        title="Delete this mailbox?"
        description="Its mail is removed for good and cannot be restored."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => setDeleted(true)}
      >
        Delete mailbox
      </ConfirmButton>
      <span className="text-sm text-muted-foreground" role="status">
        {deleted ? "Deleted" : ""}
      </span>
    </div>
  );
}
