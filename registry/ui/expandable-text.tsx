"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * A long text shown as its first few lines, with a button under it that opens the rest in place and closes it again.
 * The button shows only when the text really runs past those lines, measured again whenever the box changes width, so
 * a short message has none. It names the region it opens (aria-controls) and says whether it is open (aria-expanded);
 * its words, `moreLabel` and `lessLabel`, are the page's.
 * `lines` is how many lines show while it is closed. Children can be any content, a paragraph or rendered Markdown;
 * plain text keeps its line breaks.
 */
function ExpandableText({
  lines = 4,
  moreLabel,
  lessLabel,
  defaultExpanded = false,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Lines shown while closed. */
  lines?: number;
  /** The button's words while closed, such as "Show more". */
  moreLabel: string;
  /** The button's words while open, such as "Show less". */
  lessLabel: string;
  defaultExpanded?: boolean;
}) {
  const id = React.useId();
  const content = React.useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [overflows, setOverflows] = React.useState(false);

  React.useEffect(() => {
    const element = content.current;
    if (!element || expanded) return;
    const measure = () => setOverflows(element.scrollHeight > element.clientHeight + 1);
    // An observer reports the size it starts with, so this measures once on its own too.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded, lines, children]);

  return (
    <div data-slot="expandable-text" className="grid min-w-0 grid-cols-1 justify-items-start gap-1.5">
      <div
        ref={content}
        id={id}
        data-expanded={expanded || undefined}
        className={cn(
          "min-w-0 justify-self-stretch whitespace-pre-line",
          !expanded && "line-clamp-(--lines)",
          className,
        )}
        style={{ "--lines": lines, ...style } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
      {(overflows || expanded) && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="-ml-2"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDownIcon className={cn("transition-transform duration-100", expanded && "rotate-180")} />
          {expanded ? lessLabel : moreLabel}
        </Button>
      )}
    </div>
  );
}

export { ExpandableText };
