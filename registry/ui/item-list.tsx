import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * A short list of things in a bordered box, one per row with a line between them: the sessions signed in, the tasks
 * of a mailbox, the tickets of an account. Not a table: a row has a title, a line under it and a little at the end,
 * and nothing lines up in columns.
 * A row that opens something is a whole-row link or button: wrap the row's content in ItemListRow with asChild and
 * an `<a>` or `<button type="button">`, and end it with an ItemListChevron. A row that only shows things, or holds its
 * own buttons (revoke a session), is a plain ItemListRow.
 */
function ItemList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="item-list"
      className={cn(
        "grid min-w-0 divide-y divide-border overflow-hidden rounded-control border border-border",
        className,
      )}
      {...props}
    />
  );
}

function ItemListItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="item-list-item" className={cn("min-w-0", className)} {...props} />;
}

/**
 * The row itself: what it shows, in a line. As a link or a button (asChild) the whole row takes the pointer and the
 * focus, and lights up under either; the focus ring is drawn inside the box, which clips anything outside it.
 * `density="compact"` reduces row spacing without shrinking its text; the default spacing is unchanged.
 * `selected` takes the selected tint, the same surface as the current navigation item. It is visual only:
 * the page supplies aria-current on a link, aria-pressed on a toggle button, or the semantics its widget requires.
 */
function ItemListRow({
  className,
  asChild = false,
  density = "comfortable",
  selected = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
  density?: "compact" | "comfortable";
  selected?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="item-list-row"
      data-density={density}
      data-selected={selected || undefined}
      className={cn(
        "flex w-full min-w-0 items-center gap-3 text-left",
        density === "compact" ? "px-3 py-2" : "px-4 py-3",
        "[&:is(a,button)]:cursor-pointer [&:is(a,button)]:transition-colors [&:is(a,button)]:duration-100 motion-reduce:transition-none [&:is(a,button)]:focus-visible:-outline-offset-2 [&:is(a,button)]:disabled:pointer-events-none [&:is(a,button)]:disabled:opacity-50",
        selected
          ? "bg-selected text-foreground [&:is(a,button)]:hover:bg-selected [&:is(a,button)]:focus-visible:bg-selected"
          : "[&:is(a,button)]:hover:bg-accent [&:is(a,button)]:focus-visible:bg-accent",
        className,
      )}
      {...props}
    />
  );
}

/** The title and the line under it, taking the free width; each is cut to one line. */
function ItemListContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="item-list-content" className={cn("grid min-w-0 flex-1 gap-0.5", className)} {...props} />;
}

function ItemListTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="item-list-title"
      className={cn("block min-w-0 truncate text-sm font-medium", className)}
      {...props}
    />
  );
}

function ItemListDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="item-list-description"
      className={cn("block truncate text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

/** What sits at the end of the row before the chevron: a StatusLabel, a time, a count, the row's own buttons. */
function ItemListMeta({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="item-list-meta"
      className={cn("flex shrink-0 items-center gap-2 text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

/** The arrow at the end of a row that opens something. It is decoration: the link or button says where it goes. */
function ItemListChevron({ className, ...props }: Omit<React.ComponentProps<"svg">, "children">) {
  // lucide's chevron-right, drawn inline: lucide-react's icon is a client module, and a list of links needs no script.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-slot="item-list-chevron"
      className={cn("size-4 shrink-0 text-muted-foreground", className)}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export {
  ItemList,
  ItemListItem,
  ItemListRow,
  ItemListContent,
  ItemListTitle,
  ItemListDescription,
  ItemListMeta,
  ItemListChevron,
};
