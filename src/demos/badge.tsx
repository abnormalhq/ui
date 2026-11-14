import { MenuIcon } from "lucide-react";
import { Badge, BadgeCount, BadgeDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BadgeDemo() {
  return (
    <div className="grid justify-items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="brand">New</Badge>
        <Badge size="sm">Small</Badge>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <BadgeCount count={3} aria-hidden="true" />
        <BadgeCount count={42} variant="destructive" aria-hidden="true" />
        <BadgeCount count={1204} max={99} variant="destructive" aria-hidden="true" />
        <Button variant="ghost" size="icon-sm" aria-label="Folders, unread mail" className="relative">
          <MenuIcon />
          <BadgeDot className="absolute top-1 right-1" />
        </Button>
      </div>
    </div>
  );
}
