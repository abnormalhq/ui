import { ScrollArea } from "@/components/ui/scroll-area";

export const defaultCopy = {
  folders: "Folders",
  inbox: "Inbox",
  drafts: "Drafts",
  sent: "Sent",
  archive: "Archive",
  spam: "Spam",
  trash: "Trash",
  invoices: "Invoices",
  receipts: "Receipts",
  travel: "Travel",
  newsletters: "Newsletters",
  hiring: "Hiring",
  legal: "Legal",
  suppliers: "Suppliers",
  press: "Press",
  filters: "Filters",
  all: "All",
  unread: "Unread",
  flagged: "Flagged",
  attachments: "Attachments",
  fromPeople: "From people",
};

const folders = [
  "inbox",
  "drafts",
  "sent",
  "archive",
  "spam",
  "trash",
  "invoices",
  "receipts",
  "travel",
  "newsletters",
  "hiring",
  "legal",
  "suppliers",
  "press",
] as const;
const filters = ["all", "unread", "flagged", "attachments", "fromPeople", "newsletters", "receipts", "travel"] as const;

export default function ScrollAreaDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-64 gap-6">
      <ScrollArea aria-label={copy.folders} fade className="h-56 rounded-panel border border-border">
        <ul className="p-2">
          {folders.map((folder) => (
            <li key={folder} className="rounded-control px-2.5 py-2">
              {copy[folder]}
            </li>
          ))}
        </ul>
      </ScrollArea>
      {/* A one-line strip: a mouse wheel scrolls it sideways. */}
      <ScrollArea aria-label={copy.filters} strip fade>
        <div className="flex gap-1.5 pb-2.5">
          {filters.map((filter) => (
            <span key={filter} className="shrink-0 rounded-full border border-border px-2.5 py-1 text-sm">
              {copy[filter]}
            </span>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
