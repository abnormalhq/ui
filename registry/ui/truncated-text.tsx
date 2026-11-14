"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Text cut to one line with an ellipsis when it does not fit, such as a subject or an address in a table cell, which
 * shows the whole of it in a tooltip on hover, but only when it was really cut: a cell whose text fits opens nothing.
 * The whole text stays in the page, so a screen reader and a search find all of it; the tooltip is for the eyes.
 * `className` decides how it is cut: one line by default, or `line-clamp-2` and the like for a few lines, which the
 * check sees too. `text` is what the tooltip shows, and children what the cell shows when that is not plain text.
 */
function TruncatedText({
  text,
  className,
  children,
  side = "top",
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  /** The full text, shown in the tooltip. */
  text: string;
  /** What shows in place, when it is not `text` itself (a highlighted match, a link). */
  children?: React.ReactNode;
  side?: React.ComponentProps<typeof TooltipContent>["side"];
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <Tooltip
      open={open}
      onOpenChange={(next) => {
        const element = ref.current;
        // Measured as it opens, so a column that was resized since is read as it is now.
        setOpen(
          next &&
            element !== null &&
            (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1),
        );
      }}
    >
      <TooltipTrigger asChild>
        <span ref={ref} data-slot="truncated-text" className={cn("block min-w-0 truncate", className)} {...props}>
          {children ?? text}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-sm font-normal break-words whitespace-pre-wrap">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export { TruncatedText };
