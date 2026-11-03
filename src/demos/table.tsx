import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusLabel } from "@/components/ui/status-label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  rowActionClassName,
} from "@/components/ui/table";

const mailboxes = [
  { address: "hello@example.com", owner: "Support", status: "Enabled", tone: "success" },
  { address: "billing@example.com", owner: "Finance", status: "Pending", tone: "pending" },
  { address: "old@example.com", owner: "Nobody", status: "Disabled", tone: "muted" },
] as const;

function Mailboxes({ variant }: { variant: "default" | "plain" }) {
  return (
    <Table variant={variant}>
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead pinned>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mailboxes.map(({ address, owner, status, tone }) => (
          <TableRow key={address} className="group/row">
            <TableCell className="font-medium">{address}</TableCell>
            <TableCell>{owner}</TableCell>
            <TableCell>
              <StatusLabel tone={tone}>{status}</StatusLabel>
            </TableCell>
            <TableCell pinned className="w-10">
              <Button variant="ghost" size="icon-sm" className={rowActionClassName} aria-label={`More for ${address}`}>
                <MoreHorizontalIcon />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function TableDemo() {
  return (
    <div className="grid w-full gap-8">
      <Mailboxes variant="default" />
      <Mailboxes variant="plain" />
    </div>
  );
}
