import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * A list of small cards on the canvas, one per thing, with a little air between them instead of lines: conversations,
 * tickets, tasks. Each card has a first line (who or what, and a time at the end), and under it a line or two in the
 * page's words. The selected card is lifted onto the page color with a highlighter bar at its start, so it reads as
 * the sheet beside it, open. For rows in a bordered box use ItemList; for columns that line up use Table.
 */
function CardList({ className, ...props }: React.ComponentProps<"ul">) {
  // The list has no markers, and Safari stops announcing such a list unless the role says so.
  return <ul role="list" data-slot="card-list" className={cn("flex min-w-0 flex-col gap-0.5", className)} {...props} />;
}

function CardListItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="card-list-item" className={cn("min-w-0", className)} {...props} />;
}

/**
 * The card. As a link or a button (`asChild`) the whole card takes the pointer and the focus. `selected` lifts it and
 * draws the bar; it is visual only, so the page gives aria-current on a link or aria-pressed on a button. `unread`
 * sets the first line in bold and lights its dot (CardListDot), whose `label` says so to a screen reader.
 */
function CardListCard({
  className,
  asChild = false,
  selected = false,
  unread = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean; selected?: boolean; unread?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card-list-card"
      data-selected={selected || undefined}
      data-unread={unread || undefined}
      className={cn(
        "group/card relative grid w-full min-w-0 gap-0.5 rounded-mark border border-transparent px-2.5 py-2 text-left text-sm",
        "[&:is(a,button)]:cursor-pointer [&:is(a,button)]:transition-[background-color,border-color,box-shadow] [&:is(a,button)]:duration-100 motion-reduce:transition-none [&:is(a,button)]:focus-visible:-outline-offset-2 [&:is(a,button)]:disabled:pointer-events-none [&:is(a,button)]:disabled:opacity-50",
        selected
          ? "border-input bg-background shadow-sheet before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:rounded-full before:bg-highlight"
          : "[&:is(a,button)]:hover:bg-control",
        className,
      )}
      {...props}
    />
  );
}

/** The first line: the dot (CardListDot), who or what (CardListTitle), then its end, such as the time (CardListMeta). */
function CardListHeader({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="card-list-header" className={cn("flex min-w-0 items-center gap-2", className)} {...props} />;
}

/** Who or what the card is, cut to one line; bold while the card is unread. */
function CardListTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="card-list-title"
      className={cn("min-w-0 flex-1 truncate font-medium group-data-unread/card:font-semibold", className)}
      {...props}
    />
  );
}

/**
 * A small dot before the title, in the signal color while the card is unread and hidden once it is read. The dot is
 * decoration; `label` ("Unread") is read out in its place while the card is unread, so the state is not only a look.
 */
function CardListDot({
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  /** Read out while the card is unread, such as "Unread", in the page's language. */
  label?: string;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        data-slot="card-list-dot"
        className={cn("hidden size-1.5 shrink-0 rounded-full bg-signal group-data-unread/card:inline-block", className)}
        {...props}
      />
      {label && <span className="sr-only hidden group-data-unread/card:inline">{label}</span>}
    </>
  );
}

/** What sits at the end of the first line: the time, a count, an icon. Numbers keep their width. */
function CardListMeta({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="card-list-meta"
      className={cn("flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

/** A line under the first: the subject, cut to one line. */
function CardListLine({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="card-list-line" className={cn("block min-w-0 truncate", className)} {...props} />;
}

/** The quiet last line: the start of the message, the latest note. Cut to one line. */
function CardListPreview({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="card-list-preview"
      className={cn("block min-w-0 truncate text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  CardList,
  CardListItem,
  CardListCard,
  CardListHeader,
  CardListTitle,
  CardListDot,
  CardListMeta,
  CardListLine,
  CardListPreview,
};
