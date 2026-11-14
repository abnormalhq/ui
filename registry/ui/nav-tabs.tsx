"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { scrollIntoRow, useScrollFade, useWheelSideways } from "@/components/ui/use-scroll-fade";

/** The row per look; the items take theirs from navTabVariants. */
const NAV_TABS_LISTS = {
  underline: "items-end gap-1 border-b border-border",
  pill: "items-center gap-2 py-0.5",
  segmented: "w-fit max-w-full items-center rounded-control border border-border bg-card p-0.5",
};

/** The current tab is the one with aria-current, which NavTab sets from `current`. */
const navTabVariants = cva(
  "relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-muted-foreground transition-colors duration-150 select-none hover:text-foreground focus-visible:-outline-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        underline:
          "h-9 px-2.5 text-base font-medium after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-signal after:opacity-0 after:transition-opacity after:duration-150 aria-[current]:text-foreground aria-[current]:after:opacity-100",
        pill: "h-8 rounded-control px-3 text-base font-semibold aria-[current]:bg-highlight aria-[current]:text-highlight-foreground aria-[current]:hover:text-highlight-foreground",
        segmented:
          "h-7 rounded-[calc(var(--radius-control)-2px)] px-3 text-sm aria-[current]:bg-accent aria-[current]:font-medium aria-[current]:text-foreground",
      },
    },
    defaultVariants: { variant: "underline" },
  },
);

type NavTabsVariant = keyof typeof NAV_TABS_LISTS;

const NavTabsContext = React.createContext<NavTabsVariant>("underline");

/**
 * Tabs that are links: each view has its own address (a settings page, a period of a report, a tool of a section),
 * so the choice survives a reload, a shared link and the back button. They are a navigation landmark of links, named
 * by `label`, and the current one carries aria-current, "page" or, for a section of the same page, "location";
 * a screen reader reads it as the current link, not as a selected tab. For views that swap in place use Tabs.
 * Three looks: `underline`, Tabs' hairline with the signal bar; `pill`, highlighted pills for the sections under a
 * page title; `segmented`, a small bordered control for a period or a mode beside a chart.
 * The row stays one line and scrolls sideways without a scrollbar of its own: its edges fade where tabs are cut off,
 * a vertical mouse wheel scrolls it, and the current tab is brought into view whenever it changes, without moving the
 * page. It renders on the server, links and all, and works before any script runs.
 */
function NavTabs({
  label,
  variant = "underline",
  className,
  listClassName,
  children,
  ...props
}: Omit<React.ComponentProps<"nav">, "aria-label"> & {
  /** The landmark's name, such as "Settings sections". */
  label: string;
  variant?: NavTabsVariant;
  /** Classes for the scrolling row; `className` goes to the landmark around it. */
  listClassName?: string;
}) {
  const list = React.useRef<HTMLUListElement>(null);
  useScrollFade(list, "x");
  useWheelSideways(list);

  React.useEffect(() => {
    const row = list.current;
    if (!row) return;
    let current: Element | null = null;
    const reveal = (behavior: ScrollBehavior) => {
      const item = row.querySelector<HTMLElement>("[aria-current]:not([aria-current='false'])");
      if (!item || item === current) return;
      current = item;
      scrollIntoRow(row, item, behavior);
    };
    reveal("auto");
    // The current tab moves with the router, which may keep this row mounted: follow the attribute itself.
    const observer = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(() => reveal("smooth"));
    observer?.observe(row, { attributes: true, attributeFilter: ["aria-current"], subtree: true, childList: true });
    return () => observer?.disconnect();
  }, []);

  return (
    <nav data-slot="nav-tabs" data-variant={variant} aria-label={label} className={cn("min-w-0", className)} {...props}>
      <ul
        ref={list}
        data-slot="nav-tabs-list"
        className={cn(
          "flex min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          NAV_TABS_LISTS[variant],
          listClassName,
        )}
      >
        <NavTabsContext.Provider value={variant}>{children}</NavTabsContext.Provider>
      </ul>
    </nav>
  );
}

/**
 * One tab: a link, or with asChild the router's link (or a button that opens something, such as a custom period).
 * `current` marks it with aria-current: true for "page", or "location" for a section of the page being read.
 */
function NavTab({
  current = false,
  asChild = false,
  className,
  ...props
}: Omit<React.ComponentProps<"a">, "aria-current"> & {
  current?: boolean | "page" | "location";
  asChild?: boolean;
}) {
  const variant = React.useContext(NavTabsContext);
  const Comp = asChild ? Slot.Root : "a";
  return (
    <li data-slot="nav-tab-item" className="flex shrink-0">
      <Comp
        data-slot="nav-tab"
        aria-current={current === false ? undefined : current === true ? "page" : current}
        className={cn(navTabVariants({ variant }), className)}
        {...props}
      />
    </li>
  );
}

export { NavTabs, NavTab };
