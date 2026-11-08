import { BoldIcon, PinIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export default function ToggleDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Bold" defaultPressed>
        <BoldIcon />
      </Toggle>
      <Toggle variant="outline">
        <PinIcon />
        Pinned
      </Toggle>
      <Toggle size="sm">Unread only</Toggle>
      <Toggle disabled>Disabled</Toggle>
    </div>
  );
}
