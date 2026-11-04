import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TooltipDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Archived after 30 days</TooltipContent>
      </Tooltip>
      {/* A provider shares the delay: once one of these is open, moving to the next opens it at once. */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Inbox</Button>
          </TooltipTrigger>
          <TooltipContent>12 unread</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Spam</Button>
          </TooltipTrigger>
          <TooltipContent>Emptied every 30 days</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
