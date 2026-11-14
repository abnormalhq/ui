import { InboxIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";

export default function EmptyStateDemo() {
  return (
    <div className="grid w-full max-w-xl gap-6">
      <EmptyState>
        <EmptyStateIcon>
          <InboxIcon />
        </EmptyStateIcon>
        <EmptyStateTitle>No mailboxes yet</EmptyStateTitle>
        <EmptyStateDescription>Create the first one, or import a list of addresses from a file.</EmptyStateDescription>
        <EmptyStateActions>
          <Button>
            <PlusIcon />
            New mailbox
          </Button>
          <Button variant="outline">Import</Button>
        </EmptyStateActions>
      </EmptyState>
      <EmptyState variant="compact">
        <EmptyStateDescription>No log entries in the last 24 hours.</EmptyStateDescription>
      </EmptyState>
    </div>
  );
}
