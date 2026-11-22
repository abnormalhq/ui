import { BoldIcon, PinIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export const defaultCopy = {
  bold: "Bold",
  pinned: "Pinned",
  unreadOnly: "Unread only",
  disabled: "Disabled",
};

export default function ToggleDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label={copy.bold} defaultPressed>
        <BoldIcon />
      </Toggle>
      <Toggle variant="outline">
        <PinIcon />
        {copy.pinned}
      </Toggle>
      <Toggle size="sm">{copy.unreadOnly}</Toggle>
      <Toggle disabled>{copy.disabled}</Toggle>
    </div>
  );
}
