import { MenuIcon } from "lucide-react";
import { Badge, BadgeCount, BadgeDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const defaultCopy = {
  default: "Default",
  outline: "Outline",
  success: "Success",
  destructive: "Destructive",
  new: "New",
  small: "Small",
  unreadFolders: "Folders, unread mail",
};

export default function BadgeDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid justify-items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        <Badge>{copy.default}</Badge>
        <Badge variant="outline">{copy.outline}</Badge>
        <Badge variant="success">{copy.success}</Badge>
        <Badge variant="destructive">{copy.destructive}</Badge>
        <Badge variant="brand">{copy.new}</Badge>
        <Badge size="sm">{copy.small}</Badge>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <BadgeCount count={3} aria-hidden="true" />
        <BadgeCount count={42} variant="destructive" aria-hidden="true" />
        <BadgeCount count={1204} max={99} variant="destructive" aria-hidden="true" />
        <Button variant="ghost" size="icon-sm" aria-label={copy.unreadFolders} className="relative">
          <MenuIcon />
          <BadgeDot className="absolute top-1 right-1" />
        </Button>
      </div>
    </div>
  );
}
