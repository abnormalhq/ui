import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export const defaultCopy = {
  rightClick: "Right-click here",
  message: "Message",
  reply: "Reply",
  forward: "Forward",
  delete: "Delete",
};

export default function ContextMenuDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <ContextMenu>
      <ContextMenuTrigger className="grid h-32 w-full max-w-sm place-items-center rounded-panel border border-dashed border-border text-muted-foreground">
        {copy.rightClick}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>{copy.message}</ContextMenuLabel>
        <ContextMenuItem>{copy.reply}</ContextMenuItem>
        <ContextMenuItem>{copy.forward}</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">{copy.delete}</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
