"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TableVariant = "default" | "plain";

/** Table variants: `default` has a header background and row lines (tables inside panels such as the settings page); `plain` is the list style: no row lines, a light header, rounded hover rows. */
const TableVariantContext = React.createContext<TableVariant>("default");

/**
 * An easy-to-scan data table, keeping horizontal scrolling and clear row-selection feedback.
 * When there is content to the right of the container not yet revealed it carries `data-overflow="end"`, from which `pinned` columns draw a shadow separator on their left.
 * When the container has a limited height (ListSection on list pages) it is also the vertical scroll container: the plain header sticks to the top, and after scrolling down it carries `data-scrolled`, drawing a thin line under the header.
 */
function Table({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"table"> & { variant?: TableVariant }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      setOverflowing(container.scrollLeft + container.clientWidth < container.scrollWidth - 1);
      setScrolled(container.scrollTop > 0);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    if (container.firstElementChild) observer.observe(container.firstElementChild);
    container.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <TableVariantContext.Provider value={variant}>
      <div
        ref={containerRef}
        data-slot="table-container"
        data-overflow={overflowing ? "end" : undefined}
        data-scrolled={scrolled || undefined}
        className="relative min-h-0 w-full overflow-x-auto"
      >
        <table
          data-slot="table"
          data-variant={variant}
          className={cn(
            "w-full caption-bottom text-base",
            variant === "plain" && "border-separate border-spacing-0",
            className,
          )}
          {...props}
        />
      </div>
    </TableVariantContext.Provider>
  );
}

/**
 * A column pinned to the right (usually "Actions"): always visible while scrolling horizontally.
 * A sticky cell must carry its own opaque background, so here the background is completed according to the header / row hover and selected states.
 */
const pinnedEnd =
  "sticky right-0 z-[1] in-data-[overflow=end]:shadow-[inset_1px_0_0_var(--border),-10px_0_12px_-10px_rgb(0_0_0/0.18)]";

/** Pinned column of a plain table: there are no row lines to connect to, so no separator is drawn; on overflow a fade in the page color is laid on the left so scrolled-past content fades out naturally. */
const pinnedPlain =
  "sticky right-0 z-[1] in-data-[overflow=end]:before:pointer-events-none in-data-[overflow=end]:before:absolute in-data-[overflow=end]:before:inset-y-0 in-data-[overflow=end]:before:-left-6 in-data-[overflow=end]:before:w-6 in-data-[overflow=end]:before:bg-linear-to-r in-data-[overflow=end]:before:from-transparent in-data-[overflow=end]:before:to-background [tr:hover>&]:before:hidden [tr:has([aria-expanded=true])>&]:before:hidden";

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const variant = React.useContext(TableVariantContext);
  return (
    <thead
      data-slot="table-header"
      className={cn(
        variant === "plain" ? "[&_tr]:hover:bg-transparent" : "bg-muted/50 [&_tr]:border-b [&_tr]:hover:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

/**
 * Secondary actions inside a row (copy, edit, ⋯ menu): hidden normally, shown only when the mouse is over the row, keyboard focus is on the button, the menu is open, or it was just copied;
 * touch screens have no hover, so they are always shown.
 */
const rowActionClassName =
  "opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 data-[feedback=copied]:opacity-100 [@media(hover:none)]:opacity-100";

/** The click targets that open the details do not include these: buttons, links and inputs in the row keep handling their own clicks. */
const ROW_IGNORE =
  "a,button,input,textarea,select,label,summary,[role=checkbox],[role=combobox],[role=menuitem],[role=option],[data-row-ignore]";

/**
 * Click the whole row to open details: clicks on buttons, links or inputs in the row, or while selecting text, do not count;
 * clicks inside a dialog popped out of the row (Portal) also bubble up along the React tree, so only clicks that really land inside this row's DOM are accepted.
 * Keyboard users use the links / buttons the row already has; this is only a shortcut for the mouse.
 */
function rowClickHandler(activate: (event: React.MouseEvent<HTMLTableRowElement>) => void) {
  return (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    const target = event.target as Element;
    if (!event.currentTarget.contains(target) || target.closest(ROW_IGNORE)) return;
    if (window.getSelection()?.toString()) return;
    activate(event);
  };
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  const variant = React.useContext(TableVariantContext);
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group/row data-flash:animate-flash",
        // plain: the row itself draws no background or row lines (the radius is drawn on the cells); for the hover / selected / menu-open backgrounds see TableCell.
        variant === "plain"
          ? ""
          : "border-b transition-colors duration-100 hover:bg-accent has-aria-expanded:bg-accent data-[state=selected]:bg-highlight-muted",
        props.onClick && "cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, pinned = false, ...props }: React.ComponentProps<"th"> & { pinned?: boolean }) {
  const plain = React.useContext(TableVariantContext) === "plain";
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-4 text-left align-middle whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0",
        // The plain header sticks to the top of the table container (when the container has no height limit it does not scroll, so it is effectively not sticky); it needs its own background to cover the rows scrolled past.
        plain
          ? "sticky top-0 z-[2] h-8 bg-background text-xs font-normal in-data-scrolled:shadow-[inset_0_-1px_0_var(--border)]"
          : "h-9 text-sm font-medium",
        pinned &&
          (plain
            ? [pinnedPlain, "z-[3] bg-background"]
            : [pinnedEnd, "bg-[color-mix(in_oklab,var(--muted)_50%,var(--card))]"]),
        className,
      )}
      {...props}
    />
  );
}

/** Cell background of a plain table: hover, menu-open and selected are all drawn on the cells, with the first and last cells rounded so together they form one rounded row; rows such as empty states carry `data-static` and do not respond to hover. */
const plainCell =
  "transition-colors duration-100 first:rounded-l-control last:rounded-r-control [tr:not([data-static]):hover>&]:bg-accent [tr:has([aria-expanded=true])>&]:bg-accent [tr[data-state=selected]>&]:bg-highlight-muted";

function TableCell({ className, pinned = false, ...props }: React.ComponentProps<"td"> & { pinned?: boolean }) {
  const plain = React.useContext(TableVariantContext) === "plain";
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        plain && plainCell,
        pinned &&
          plain && [
            pinnedPlain,
            "bg-background [tr:has([aria-expanded=true])>&]:bg-accent [tr:hover>&]:bg-accent [tr[data-state=selected]>&]:bg-highlight-muted",
          ],
        pinned &&
          !plain && [
            pinnedEnd,
            // When Chrome draws collapsed borders, a sticky cell's background covers the row's bottom border (every other row loses its line): the pinned column patches one in with an inset shadow, and the last row draws none.
            "shadow-[inset_0_-1px_0_var(--border)] [tr:last-child>&]:shadow-none",
            "in-data-[overflow=end]:shadow-[inset_1px_0_0_var(--border),inset_0_-1px_0_var(--border),-10px_0_12px_-10px_rgb(0_0_0/0.18)]",
            "in-data-[overflow=end]:[tr:last-child>&]:shadow-[inset_1px_0_0_var(--border),-10px_0_12px_-10px_rgb(0_0_0/0.18)]",
            "bg-card transition-colors duration-100 [tr:has([aria-expanded=true])>&]:bg-accent [tr:hover>&]:bg-accent [tr[data-state=selected]>&]:bg-highlight-muted",
          ],
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption data-slot="table-caption" className={cn("mt-3 text-sm text-muted-foreground", className)} {...props} />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  rowActionClassName,
  rowClickHandler,
};
