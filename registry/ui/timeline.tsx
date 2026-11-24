import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Events in order, such as a maintenance's updates, a message's delivery steps or what an agent did: an ordered list
 * with a rail down the left and a mark on it for each event. Name the list with `aria-label` ("Updates"), in the
 * page's language; the rail and the marks are decoration, since the list order already says what came first.
 * An item's mark is a small dot in the tone of the event, or, given `icon`, a round tile holding that icon, for a
 * timeline whose steps differ in kind. The rail stops at the last item's mark.
 */
const timelineMarkVariants = cva("relative z-[1] flex shrink-0 items-center justify-center rounded-full", {
  variants: {
    tone: {
      default: "",
      success: "",
      pending: "",
      destructive: "",
      /** Happening now: the signal color. */
      current: "",
    },
    kind: {
      dot: "mt-1.75 size-[7px]",
      icon: "size-7 border bg-background [&_svg:not([class*='size-'])]:size-3.5",
    },
  },
  compoundVariants: [
    { kind: "dot", tone: "default", className: "bg-muted-foreground" },
    { kind: "dot", tone: "success", className: "bg-success" },
    { kind: "dot", tone: "pending", className: "bg-warning" },
    { kind: "dot", tone: "destructive", className: "bg-destructive" },
    { kind: "dot", tone: "current", className: "bg-signal" },
    { kind: "icon", tone: "default", className: "border-border text-muted-foreground" },
    { kind: "icon", tone: "success", className: "border-success/40 text-success" },
    { kind: "icon", tone: "pending", className: "border-warning/40 text-warning" },
    { kind: "icon", tone: "destructive", className: "border-destructive/40 text-destructive" },
    { kind: "icon", tone: "current", className: "border-signal/50 text-signal" },
  ],
  defaultVariants: { tone: "default", kind: "dot" },
});

function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="timeline" className={cn("grid min-w-0", className)} {...props} />;
}

function TimelineItem({
  className,
  tone = "default",
  icon,
  children,
  ...props
}: React.ComponentProps<"li"> &
  Pick<VariantProps<typeof timelineMarkVariants>, "tone"> & {
    /** An icon for the mark, instead of a dot. */
    icon?: React.ReactNode;
  }) {
  const kind = icon === undefined ? "dot" : "icon";
  return (
    <li
      data-slot="timeline-item"
      data-tone={tone}
      className={cn(
        "group/timeline-item relative grid min-w-0 gap-x-3 pb-4 last:pb-0",
        kind === "dot" ? "grid-cols-[7px_minmax(0,1fr)]" : "grid-cols-[1.75rem_minmax(0,1fr)]",
        className,
      )}
      {...props}
    >
      {/* The rail runs from this mark down to the next one, through the item's bottom padding; the last item has none. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute w-px -translate-x-1/2 bg-border group-last/timeline-item:hidden",
          kind === "dot" ? "top-1.75 -bottom-1.75 left-[3.5px]" : "inset-y-0 left-3.5",
        )}
      />
      <span aria-hidden="true" className={timelineMarkVariants({ tone, kind })}>
        {icon}
      </span>
      <div className={cn("grid min-w-0 content-start gap-1", kind === "icon" && "pt-1")}>{children}</div>
    </li>
  );
}

/** The first line of an event: what happened, with its TimelineTime at the end. */
function TimelineHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-header"
      className={cn("flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm", className)}
      {...props}
    />
  );
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="timeline-title" className={cn("min-w-0 font-medium", className)} {...props} />;
}

/**
 * When it happened, as a `<time>`: give `dateTime` the machine-readable value and children the text the page
 * formatted for its locale. `title` can carry the full date where the text is only the time of day.
 */
function TimelineTime({ className, ...props }: React.ComponentProps<"time">) {
  return (
    <time
      data-slot="timeline-time"
      className={cn("text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

/**
 * What there is to say about it: a message, the details of a step. Line breaks the text carries are kept, and a long
 * word or address wraps anywhere, since these are often typed by people.
 */
function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-content"
      className={cn(
        "text-sm leading-relaxed text-pretty whitespace-pre-line wrap-anywhere text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Timeline, TimelineItem, TimelineHeader, TimelineTitle, TimelineTime, TimelineContent, timelineMarkVariants };
