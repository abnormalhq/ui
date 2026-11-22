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
    subject: "secondDomain",
    updated: "updatedTwoHours",
    status: "open",
    tone: "pending",
  },
  { id: "1038", subject: "invoiceAddress", updated: "updatedYesterday", status: "answered", tone: "success" },
] as const;

export const defaultCopy = {
  secondDomain: "Cannot add a second domain",
  updatedTwoHours: "Updated 2 hours ago",
  open: "Open",
  invoiceAddress: "Invoice address",
  updatedYesterday: "Updated yesterday",
  answered: "Answered",
  thisDevice: "This device",
  firefoxOnMac: "Firefox on macOS",
  mailOnIphone: "Mail on iPhone",
  lastSeen: "Last seen 3 days ago",
  signOut: "Sign out",
};

export default function ItemListDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-md gap-8">
      <ItemList>
        {tickets.map((ticket) => (
          <ItemListItem key={ticket.id}>
            <ItemListRow asChild>
              <a href={`#ticket-${ticket.id}`}>
                <ItemListContent>
                  <ItemListTitle>{copy[ticket.subject]}</ItemListTitle>
                  <ItemListDescription>{copy[ticket.updated]}</ItemListDescription>
                </ItemListContent>
                <StatusLabel tone={ticket.tone}>{copy[ticket.status]}</StatusLabel>
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
              <ItemListTitle>{copy.firefoxOnMac}</ItemListTitle>
              <ItemListDescription>{copy.thisDevice}</ItemListDescription>
            </ItemListContent>
          </ItemListRow>
        </ItemListItem>
        <ItemListItem>
          <ItemListRow>
            <ItemListContent>
              <ItemListTitle>{copy.mailOnIphone}</ItemListTitle>
              <ItemListDescription>{copy.lastSeen}</ItemListDescription>
            </ItemListContent>
            <ItemListMeta>
              <Button variant="outline" size="sm">
                {copy.signOut}
              </Button>
            </ItemListMeta>
          </ItemListRow>
        </ItemListItem>
      </ItemList>
    </div>
  );
}
