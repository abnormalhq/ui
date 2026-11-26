import { MoreHorizontalIcon } from "lucide-react";
import { StatusLabel } from "@/components/ui/status-label";
import { SortableHead, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { rowActionClassName } from "@/components/ui/table-row";
import { IconButton } from "@/components/ui/icon-button";

const mailboxes = [
  { address: "hello@example.com", owner: "Support", status: "Enabled", tone: "success" },
  { address: "billing@example.com", owner: "Finance", status: "Pending", tone: "pending" },
  { address: "old@example.com", owner: "Nobody", status: "Disabled", tone: "muted" },
] as const;

export const defaultCopy = {
  sortDescending: "Sort descending",
  sortAscending: "Sort ascending",
  address: "Address",
  owner: "Owner",
  status: "Status",
  actions: "Actions",
  enabled: "Enabled",
  pending: "Pending",
  disabled: "Disabled",
  nobody: "Nobody",
  moreFor: "More for {address}",
};

function Mailboxes({ variant, copy }: { variant: "default" | "plain"; copy: typeof defaultCopy }) {
  const statusLabels = { Enabled: copy.enabled, Pending: copy.pending, Disabled: copy.disabled };
  return (
    <Table variant={variant}>
      <TableHeader>
        <TableRow>
          <SortableHead direction="asc" href="?sort=-address" title={copy.sortDescending}>
            {copy.address}
          </SortableHead>
          <SortableHead href="?sort=owner" title={copy.sortAscending}>
            {copy.owner}
          </SortableHead>
          <TableHead>{copy.status}</TableHead>
          <TableHead pinned>
            <span className="sr-only">{copy.actions}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mailboxes.map(({ address, owner, status, tone }) => (
          <TableRow key={address}>
            <TableCell className="font-medium">{address}</TableCell>
            <TableCell>{owner === "Nobody" ? copy.nobody : owner}</TableCell>
            <TableCell>
              <StatusLabel tone={tone}>{statusLabels[status]}</StatusLabel>
            </TableCell>
            <TableCell pinned className="w-10">
              <IconButton
                variant="ghost"
                size="icon-sm"
                className={rowActionClassName}
                label={copy.moreFor.replace("{address}", address)}
              >
                <MoreHorizontalIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function TableDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full gap-8">
      <Mailboxes variant="default" copy={copy} />
      <Mailboxes variant="plain" copy={copy} />
    </div>
  );
}
