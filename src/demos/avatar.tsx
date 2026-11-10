import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar";

/* A picture made here, so the demo fetches nothing: a project passes the URL of a real one. */
const picture = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#ffe14d"/><circle cx="20" cy="16" r="7" fill="#141412"/><path d="M6 40c0-9 6-14 14-14s14 5 14 14z" fill="#141412"/></svg>',
)}`;

export default function AvatarDemo() {
  return (
    <div className="grid justify-items-center gap-6">
      <div className="flex items-center gap-4">
        <Avatar size="sm">
          <AvatarFallback>AK</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={picture} alt="Ada King" />
          <AvatarFallback>AK</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          {/* A picture that cannot load leaves the initials. */}
          <AvatarImage src="data:image/png;base64,AAAA" alt="Lin Wei" />
          <AvatarFallback>LW</AvatarFallback>
        </Avatar>
        <Avatar size="lg" square>
          <AvatarFallback>Ab</AvatarFallback>
        </Avatar>
        <Avatar size="xl" role="img" aria-label="No picture">
          <AvatarFallback>
            <UserIcon aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-3">
        <AvatarGroup>
          <Avatar>
            <AvatarImage src={picture} alt="" />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>LW</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>MO</AvatarFallback>
          </Avatar>
        </AvatarGroup>
        <span className="text-sm text-muted-foreground">Ada, Lin and Maya can read this mailbox</span>
      </div>
    </div>
  );
}
