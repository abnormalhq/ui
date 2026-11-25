import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * A product's window drawn as one canvas: the navigation, a list and a narrow rail sit straight on it, and the work in
 * hand is a single sheet set into it, with a status bar along the bottom. The canvas follows the page's theme (the
 * surface in light, the sidebar in dark), so the sheet in the page color stands out without a border of its own.
 * A Sidebar on the canvas drops its own fill. The frame takes no height or scrolling: give it `h-dvh` or the place it
 * fills, and let each column or the sheet scroll on its own. Use Workspace instead for the ink frame.
 */
function AppFrame({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="app-frame"
      className={cn(
        "flex min-h-0 min-w-0 flex-col bg-canvas text-foreground [&_[data-slot=sidebar]]:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

/** The row of columns above the status bar; it stacks on a small screen. */
function AppFrameBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-frame-body"
      className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 p-1.5 md:flex-row", className)}
      {...props}
    />
  );
}

/**
 * Something that sits on the canvas without a sheet: a list of cards, a tool rail, a column of facets. Give it a width
 * on wider screens; `asChild` supplies the section, nav or aside its content needs.
 */
function AppFrameColumn({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp data-slot="app-frame-column" className={cn("flex min-h-0 min-w-0 shrink-0 flex-col", className)} {...props} />
  );
}

/**
 * The one sheet: the page color, the panel radius and a soft edge, taking the room left. Its corners clip what scrolls
 * inside without making it a scroll container, so a sticky header in it still sticks. Keep one per frame; split it
 * with hairlines, not more sheets. `asChild` supplies main, section or article.
 */
function AppFrameSheet({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="app-frame-sheet"
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-clip rounded-panel bg-background text-foreground shadow-sheet",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The sheet's top row: the title of what is open and its actions, 44px, over a hairline. Put a second row under it
 * with AppFrameSheetBar for the labels, the people or the state of what is open.
 */
function AppFrameSheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-frame-sheet-header"
      className={cn("flex h-11 shrink-0 items-center gap-1.5 border-b border-border ps-4 pe-3", className)}
      {...props}
    />
  );
}

/** The title in the sheet's top row, cut to one line; an h2 unless `asChild` gives another heading. */
function AppFrameSheetTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h2"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "h2";
  return (
    <Comp
      data-slot="app-frame-sheet-title"
      className={cn("me-auto min-w-0 truncate text-base font-semibold", className)}
      {...props}
    />
  );
}

/** The quieter second row: labels, the people on a thread, a state. Small secondary text over a hairline. */
function AppFrameSheetBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-frame-sheet-bar"
      className={cn(
        "flex min-h-9 shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-1.5 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A box docked at the foot of the sheet, raised off it: a reply, a note, a prompt. It draws the edge and lifts its
 * border while anything inside has the focus; the field inside drops its own border.
 */
function AppFrameDock({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-frame-dock"
      className={cn(
        "mx-3 mb-3 flex shrink-0 flex-col gap-2 rounded-mark border border-input bg-popover p-2 shadow-control transition-[border-color] duration-100 focus-within:border-input-hover motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export {
  AppFrame,
  AppFrameBody,
  AppFrameColumn,
  AppFrameSheet,
  AppFrameSheetHeader,
  AppFrameSheetTitle,
  AppFrameSheetBar,
  AppFrameDock,
};
