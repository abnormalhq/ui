import { InboxIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";

export const defaultCopy = {
  title: "No mailboxes yet",
  description: "Create the first one, or import a list of addresses from a file.",
  newMailbox: "New mailbox",
  import: "Import",
  noRecentLogs: "No log entries in the last 24 hours.",
};

export default function EmptyStateDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-xl gap-6">
      <EmptyState>
        <EmptyStateIcon>
          <InboxIcon />
        </EmptyStateIcon>
        <EmptyStateTitle>{copy.title}</EmptyStateTitle>
        <EmptyStateDescription>{copy.description}</EmptyStateDescription>
        <EmptyStateActions>
          <Button>
            <PlusIcon />
            {copy.newMailbox}
          </Button>
          <Button variant="outline">{copy.import}</Button>
        </EmptyStateActions>
      </EmptyState>
      <EmptyState variant="compact">
        <EmptyStateDescription>{copy.noRecentLogs}</EmptyStateDescription>
      </EmptyState>
    </div>
  );
}
