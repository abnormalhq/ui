import { ScrollArea } from "@/components/ui/scroll-area";

const folders = [
  "Inbox",
  "Drafts",
  "Sent",
  "Archive",
  "Spam",
  "Trash",
  "Invoices",
  "Receipts",
  "Travel",
  "Newsletters",
  "Hiring",
  "Legal",
  "Suppliers",
  "Press",
];

const filters = ["All", "Unread", "Flagged", "Attachments", "From people", "Newsletters", "Receipts", "Travel"];

export default function ScrollAreaDemo() {
  return (
    <div className="grid w-full max-w-64 gap-6">
      <ScrollArea aria-label="Folders" fade className="h-56 rounded-panel border border-border">
        <ul className="p-2">
          {folders.map((folder) => (
            <li key={folder} className="rounded-control px-2.5 py-2">
              {folder}
            </li>
          ))}
        </ul>
      </ScrollArea>
      {/* A one-line strip: a mouse wheel scrolls it sideways. */}
      <ScrollArea aria-label="Filters" strip fade>
        <div className="flex gap-1.5 pb-2.5">
          {filters.map((filter) => (
            <span key={filter} className="shrink-0 rounded-full border border-border px-2.5 py-1 text-sm">
              {filter}
            </span>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
