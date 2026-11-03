import { MailIcon } from "lucide-react";
import { IconTile } from "@/components/ui/icon-tile";

export default function IconTileDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <IconTile>
        <MailIcon className="size-5" />
      </IconTile>
      <IconTile variant="highlight">
        <MailIcon className="size-5" />
      </IconTile>
      <IconTile variant="outline">
        <MailIcon className="size-5" />
      </IconTile>
      <IconTile size="sm">
        <MailIcon className="size-4" />
      </IconTile>
    </div>
  );
}
