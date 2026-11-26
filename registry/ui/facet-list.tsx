import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * The column beside a list that narrows it: saved views, the statuses with their counts, the domains or owners the
 * rows belong to. Each choice is a whole-row link (a filter with its own address) or a button, with a name that is
 * cut to one line and a count at the end. A group has a small heading and, where the choices are many, its own search
 * and a "show more" row at the end: the page loads the next choices from the server rather than drawing thousands.
 * Not navigation between pages: the column filters the list beside it, so it sits on paper next to the list.
 */
function FacetGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="facet-group" className={cn("grid min-w-0 gap-1", className)} {...props} />;
}

/** The group's heading, with room at the end for a small action such as a search toggle. Give it an id and name the list by it. */
function FacetGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="facet-group-label"
      className={cn(
        "flex h-7 min-w-0 items-center justify-between gap-2 px-2 text-2xs font-medium tracking-wide text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

function FacetList({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="facet-list" className={cn("grid min-w-0 gap-px", className)} {...props} />;
}

function FacetItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="facet-item" className={cn("min-w-0", className)} {...props} />;
}

/**
 * One choice, as a link or a button (`asChild`), or a plain row. `selected` marks the choice the list is filtered by
 * with the selected tint; it is visual only, so the page also sets `aria-current` on a link or `aria-pressed` on
 * a toggle button. Put a status dot or an icon first, then FacetLabel and FacetCount.
 */
function FacetRow({
  className,
  asChild = false,
  selected = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean; selected?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="facet-row"
      data-selected={selected || undefined}
      className={cn(
        "flex h-8 w-full min-w-0 items-center gap-2 rounded-control px-2 text-left text-sm",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        "[&:is(a,button)]:cursor-pointer [&:is(a,button)]:transition-colors [&:is(a,button)]:duration-100 motion-reduce:transition-none [&:is(a,button)]:focus-visible:-outline-offset-2 [&:is(a,button)]:disabled:pointer-events-none [&:is(a,button)]:disabled:opacity-50",
        selected
          ? "bg-selected font-medium text-foreground"
          : "text-foreground/85 [&:is(a,button)]:hover:bg-accent [&:is(a,button)]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** The choice's name, cut with an ellipsis; give the row a `title` when the whole name matters. */
function FacetLabel({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="facet-label" className={cn("min-w-0 flex-1 truncate", className)} {...props} />;
}

/** How many rows the choice holds, kept to its width so the column does not move as counts change. */
function FacetCount({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="facet-count"
      className={cn("shrink-0 text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

/**
 * The quiet row at the end of a long group: "Show 50 more", "No more domains", or a note that the search found
 * nothing. As a button (`asChild`) it loads the next page of choices; plain, it is a line of text.
 */
function FacetMore({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="facet-more"
      className={cn(
        "flex h-8 w-full min-w-0 items-center gap-2 rounded-control px-2 text-left text-xs text-muted-foreground",
        "[&:is(a,button)]:cursor-pointer [&:is(a,button)]:hover:bg-accent [&:is(a,button)]:hover:text-foreground [&:is(a,button)]:focus-visible:-outline-offset-2 [&:is(a,button)]:disabled:pointer-events-none [&:is(a,button)]:disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { FacetGroup, FacetGroupLabel, FacetList, FacetItem, FacetRow, FacetLabel, FacetCount, FacetMore };
