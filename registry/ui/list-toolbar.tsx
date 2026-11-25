import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * The row over a list: its search first, then the filters, the grouping and the view, and at the far end what acts
 * on the whole list (export, add). Every list in a product uses the same row, so the search sits in the same place
 * on each and the controls keep one height and one gap. It wraps on a narrow screen, the search taking the full width.
 * It is a `div` unless `asChild` gives the page's own element, such as the `form` that submits the search.
 * Not a role="toolbar": its controls are ordinary tab stops, a search box among them. For a row of formatting
 * buttons with arrow-key focus use Toolbar.
 */
function ListToolbar({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="list-toolbar"
      className={cn("flex w-full min-w-0 flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

/**
 * The search's place: the full width on a narrow screen, a steady width beside the filters on a wider one. A `div`
 * unless `asChild` gives the page's own element, such as the `form` or `label` around the search box.
 */
function ListToolbarSearch({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="list-toolbar-search"
      className={cn("relative w-full min-w-0 sm:w-64 sm:shrink-0", className)}
      {...props}
    />
  );
}

/** A set of filters, kept together when the row wraps. */
function ListToolbarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-toolbar-group"
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

/** The actions on the whole list, pushed to the far end of the row. */
function ListToolbarActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-toolbar-actions"
      className={cn("ms-auto flex shrink-0 flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

/**
 * The line under the row that lists the conditions in force, one chip each with its own remove button, and a way to
 * clear them all at the end. Leave it out while nothing narrows the list.
 */
function ListToolbarChips({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-toolbar-chips"
      className={cn("flex w-full min-w-0 flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

/**
 * One condition as a chip that opens its choices: the field in quiet text, then the value in force and a chevron,
 * 32px like the controls beside it. Pass it as the trigger of a DropdownMenu or Popover (`asChild` there).
 * `value` left out shows the field alone; `add` draws the dashed chip that adds a condition ("Add filter"), without a
 * chevron.
 */
function ListToolbarFilter({
  label,
  value,
  add = false,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  /** The field the condition is on, such as "Status". */
  label?: React.ReactNode;
  /** The value in force, such as "Active". */
  value?: React.ReactNode;
  /** The chip that adds a condition. */
  add?: boolean;
}) {
  return (
    <button
      type="button"
      data-slot="list-toolbar-filter"
      data-add={add || undefined}
      className={cn(
        "inline-flex h-8 max-w-full min-w-0 shrink-0 items-center gap-1.5 rounded-control border px-2.5 text-sm whitespace-nowrap transition-[background-color,border-color,box-shadow] duration-100 select-none focus-visible:-outline-offset-1 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        add
          ? "border-dashed border-input text-muted-foreground hover:border-input-hover hover:text-foreground"
          : "border-input bg-popover text-foreground shadow-control hover:bg-accent active:shadow-none aria-expanded:bg-accent",
        className,
      )}
      {...props}
    >
      {children}
      {label !== undefined && (
        <span className={cn("truncate", value !== undefined && "text-muted-foreground")}>{label}</span>
      )}
      {value !== undefined && <span className="truncate font-medium">{value}</span>}
      {!add && (
        // lucide's chevron-down, drawn inline: lucide-react's icon is a client module, and the row renders on the server.
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-3 text-muted-foreground"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </button>
  );
}

export { ListToolbar, ListToolbarSearch, ListToolbarGroup, ListToolbarActions, ListToolbarChips, ListToolbarFilter };
