import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const defaultCopy = {
  hover: "Hover me",
  archived: "Archived after 30 days",
  inbox: "Inbox",
  unread: "12 unread",
  spam: "Spam",
  emptied: "Emptied every 30 days",
};

export default function TooltipDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">{copy.hover}</Button>
        </TooltipTrigger>
        <TooltipContent>{copy.archived}</TooltipContent>
      </Tooltip>
      {/* A provider shares the delay: once one of these is open, moving to the next opens it at once. */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">{copy.inbox}</Button>
          </TooltipTrigger>
          <TooltipContent>{copy.unread}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">{copy.spam}</Button>
          </TooltipTrigger>
          <TooltipContent>{copy.emptied}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
