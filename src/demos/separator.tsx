import { Separator } from "@/components/ui/separator";

export const defaultCopy = {
  storage: "Storage",
  shared: "Shared by every mailbox.",
  inbox: "Inbox",
  sent: "Sent",
  archive: "Archive",
};

export default function SeparatorDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div>
        <p className="font-medium">{copy.storage}</p>
        <p className="text-sm text-muted-foreground">{copy.shared}</p>
      </div>
      <Separator />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>{copy.inbox}</span>
        <Separator orientation="vertical" />
        <span>{copy.sent}</span>
        <Separator orientation="vertical" />
        <span>{copy.archive}</span>
      </div>
    </div>
  );
}
