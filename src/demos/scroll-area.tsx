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

export default function ScrollAreaDemo() {
  return (
    <ScrollArea aria-label="Folders" className="h-56 w-full max-w-64 rounded-panel border border-border">
      <ul className="p-2">
        {folders.map((folder) => (
          <li key={folder} className="rounded-control px-2.5 py-2">
            {folder}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
