import { ArchiveIcon, MoreHorizontalIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Kbd } from "@/components/ui/kbd";

export const defaultCopy = {
  archive: "Archive",
  delete: "Delete",
  more: "More actions",
  add: "Add a mailbox",
};

export default function IconButtonDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* The tooltip says the name and the key that does the same. */}
      <IconButton
        variant="ghost"
        label={copy.archive}
        tooltip={
          <span className="flex items-center gap-1.5">
            {copy.archive} <Kbd>E</Kbd>
          </span>
        }
      >
        <ArchiveIcon />
      </IconButton>
      <IconButton variant="ghost" label={copy.delete}>
        <Trash2Icon />
      </IconButton>
      <IconButton variant="ghost" size="icon-sm" label={copy.more} tooltipSide="bottom">
        <MoreHorizontalIcon />
      </IconButton>
      <IconButton variant="outline" label={copy.add}>
        <PlusIcon />
      </IconButton>
    </div>
  );
}
