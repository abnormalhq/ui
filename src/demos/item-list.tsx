import { Button } from "@/components/ui/button";
import {
  ItemList,
  ItemListChevron,
  ItemListContent,
  ItemListDescription,
  ItemListItem,
  ItemListMeta,
  ItemListRow,
  ItemListTitle,
} from "@/components/ui/item-list";
import { StatusLabel } from "@/components/ui/status-label";

const tickets = [
  {
    id: "1042",
    subject: "Cannot add a second domain",
    updated: "Updated 2 hours ago",
    status: "Open",
    tone: "pending",
  },
  { id: "1038", subject: "Invoice address", updated: "Updated yesterday", status: "Answered", tone: "success" },
] as const;

export default function ItemListDemo() {
  return (
    <div className="grid w-full max-w-md gap-8">
      <ItemList>
        {tickets.map((ticket) => (
          <ItemListItem key={ticket.id}>
            <ItemListRow asChild>
              <a href={`#ticket-${ticket.id}`}>
                <ItemListContent>
                  <ItemListTitle>{ticket.subject}</ItemListTitle>
                  <ItemListDescription>{ticket.updated}</ItemListDescription>
                </ItemListContent>
                <StatusLabel tone={ticket.tone}>{ticket.status}</StatusLabel>
                <ItemListChevron />
              </a>
            </ItemListRow>
          </ItemListItem>
        ))}
      </ItemList>
      <ItemList>
        <ItemListItem>
          <ItemListRow>
            <ItemListContent>
              <ItemListTitle>Firefox on macOS</ItemListTitle>
              <ItemListDescription>This device</ItemListDescription>
            </ItemListContent>
          </ItemListRow>
        </ItemListItem>
        <ItemListItem>
          <ItemListRow>
            <ItemListContent>
              <ItemListTitle>Mail on iPhone</ItemListTitle>
              <ItemListDescription>Last seen 3 days ago</ItemListDescription>
            </ItemListContent>
            <ItemListMeta>
              <Button variant="outline" size="sm">
                Sign out
              </Button>
            </ItemListMeta>
          </ItemListRow>
        </ItemListItem>
      </ItemList>
    </div>
  );
}
