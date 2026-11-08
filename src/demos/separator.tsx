import { Separator } from "@/components/ui/separator";

export default function SeparatorDemo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div>
        <p className="font-medium">Storage</p>
        <p className="text-sm text-muted-foreground">Shared by every mailbox.</p>
      </div>
      <Separator />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Inbox</span>
        <Separator orientation="vertical" />
        <span>Sent</span>
        <Separator orientation="vertical" />
        <span>Archive</span>
      </div>
    </div>
  );
}
