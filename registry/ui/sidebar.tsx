"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronUpIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarContext, useSidebar } from "@/components/ui/use-sidebar";

/** A year, renewed by every change, so the choice outlives a session but not an abandoned browser. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type SidebarStateProps = {
  /** Collapsed to the icon rail. Leave it out and the sidebar keeps its own state, from `defaultCollapsed`. */
  collapsed?: boolean;
  /** The state to start in, such as what the server read from the cookie below. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * A cookie to write after each change, `collapsed` or `expanded`, for a server that renders `defaultCollapsed` from
   * it so a reload does not open wide and then snap shut. Leave it out to keep the state some other way, or not at all.
   */
  cookieName?: string;
  /** A letter that toggles the sidebar with ⌘ (or Ctrl), such as "b". Not while typing in a field. */
  shortcut?: string;
};

/** A key that belongs to what the person is typing in: a field, a select or an editor. */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target.closest("input, textarea, select, [contenteditable='true']") !== null);

/**
 * Holds the collapsed state for a sidebar and everything that reads it. Sidebar brings its own; wrap a layout in this
 * instead when something outside the sidebar needs the state, such as a toggle in the page header, or when the column
 * is the project's own element (a mail rail, the copy in a drawer, which passes `collapsed={false}`).
 */
function SidebarProvider({
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  cookieName,
  shortcut,
  children,
}: SidebarStateProps & { children?: React.ReactNode }) {
  const [innerCollapsed, setInnerCollapsed] = React.useState(defaultCollapsed);
  const collapsed = collapsedProp ?? innerCollapsed;
  const latest = React.useRef({ collapsed, collapsedProp, onCollapsedChange, cookieName });
  React.useEffect(() => {
    latest.current = { collapsed, collapsedProp, onCollapsedChange, cookieName };
  });

  const setCollapsed = React.useCallback((next: boolean) => {
    const {
      collapsed: current,
      collapsedProp: controlled,
      onCollapsedChange: report,
      cookieName: cookie,
    } = latest.current;
    if (next === current) return;
    if (controlled === undefined) setInnerCollapsed(next);
    if (cookie) {
      document.cookie = `${cookie}=${next ? "collapsed" : "expanded"}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    }
    report?.(next);
  }, []);
  const toggle = React.useCallback(() => setCollapsed(!latest.current.collapsed), [setCollapsed]);

  React.useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.shiftKey || !(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== shortcut.toLowerCase() || isTyping(event.target)) return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut, toggle]);

  const state = React.useMemo(
    () => ({ collapsed, setCollapsed, toggle, shortcut }),
    [collapsed, setCollapsed, toggle, shortcut],
  );
  return (
    <SidebarContext.Provider value={state}>
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

function SidebarColumn({ className, ...props }: React.ComponentProps<"aside">) {
  const { collapsed } = useSidebar();
  return (
    <aside
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden bg-sidebar py-4 whitespace-nowrap text-sidebar-foreground transition-[width,padding] duration-200 ease-out motion-reduce:transition-none",
        collapsed ? "w-16 px-3" : "w-62 px-4",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The column of an app: a header (the brand, an account switcher), navigation and a footer row of icon buttons. It
 * collapses to a 64px icon rail, where each row keeps only its icon and shows its name in a tooltip, and expands to
 * 248px rows. The page gives it a height and a place, such as `sticky top-0 h-dvh`, and `ink` for the brand shell.
 * The state is the sidebar's own unless the page controls it (`collapsed`, `onCollapsedChange`). To keep it across
 * reloads, read a cookie on the server into `defaultCollapsed` and name it in `cookieName`, which the sidebar writes
 * after each change; or store it any other way from `onCollapsedChange`. `shortcut` adds ⌘ or Ctrl and a letter.
 * Rows and menus inside read the state with useSidebar (use-sidebar.ts), so a project's own row can shrink with it.
 * Under a SidebarProvider the sidebar uses that provider's state, and its own state props are ignored.
 */
function Sidebar({
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  cookieName,
  shortcut,
  ...props
}: SidebarStateProps & React.ComponentProps<"aside">) {
  const provided = React.useContext(SidebarContext);
  if (provided) return <SidebarColumn {...props} />;
  return (
    <SidebarProvider
      collapsed={collapsed}
      defaultCollapsed={defaultCollapsed}
      onCollapsedChange={onCollapsedChange}
      cookieName={cookieName}
      shortcut={shortcut}
    >
      <SidebarColumn {...props} />
    </SidebarProvider>
  );
}

/** The top of the column: the brand, an account or workspace switcher. Centred on the rail. */
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { collapsed } = useSidebar();
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex shrink-0 flex-col gap-2 pb-4", collapsed && "items-center", className)}
      {...props}
    />
  );
}

/**
 * A navigation landmark of rows, named by `label` ("Main", "Folders") in the page's language. It scrolls on its own
 * when the rows outgrow the column, so the header and footer stay put.
 */
function SidebarNav({
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"nav">, "aria-label"> & {
  /** The landmark's name. */
  label: string;
}) {
  const { collapsed } = useSidebar();
  return (
    <nav
      data-slot="sidebar-nav"
      aria-label={label}
      className={cn(
        "-mx-1 flex min-h-0 flex-col gap-0.5 overflow-x-hidden overflow-y-auto px-1",
        collapsed && "items-center",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The product or module the sidebar belongs to, at the top of the column, as a button that opens the way to the others:
 * pass it as the trigger of a DropdownMenu (`<DropdownMenuTrigger asChild><SidebarSwitcher … /></DropdownMenuTrigger>`)
 * whose items carry ⌃1, ⌃2 and so on. `icon` is the module's tile or the brand mark; on the rail only the icon shows and
 * `label` stays its accessible name.
 */
function SidebarSwitcher({
  icon,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  /** The module's tile or mark, about 18px; hidden from assistive technology, which reads `label`. */
  icon: React.ReactNode;
  /** The module's name, such as "Mail". */
  label: string;
}) {
  const { collapsed } = useSidebar();
  return (
    <button
      type="button"
      data-slot="sidebar-switcher"
      className={cn(
        "flex h-8 min-w-0 shrink-0 items-center gap-2 rounded-control text-left text-base font-semibold transition-colors duration-100 hover:bg-control focus-visible:-outline-offset-2 aria-expanded:bg-control motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        collapsed ? "size-9 justify-center px-0" : "w-full px-2",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" data-slot="sidebar-switcher-icon" className="inline-flex shrink-0">
        {icon}
      </span>
      <span className={collapsed ? "sr-only" : "min-w-0 flex-1 truncate"}>{label}</span>
      {!collapsed && <ChevronDownIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />}
    </button>
  );
}

/**
 * A named set of rows inside SidebarNav: the shared mailboxes, the labels, the operations pages. The name is a small
 * label above the rows, and it names the group; on the rail the name gives way to a short hairline.
 */
function SidebarGroup({
  label,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "aria-labelledby"> & {
  /** The group's name, in the page's language. */
  label: string;
}) {
  const { collapsed } = useSidebar();
  const id = React.useId();
  return (
    <div
      role="group"
      aria-labelledby={id}
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-0.5 pt-3", collapsed && "items-center", className)}
      {...props}
    >
      <span
        id={id}
        data-slot="sidebar-group-label"
        className={collapsed ? "sr-only" : "truncate px-3 pb-1 text-2xs font-medium text-muted-foreground select-none"}
      >
        {label}
      </span>
      {collapsed && <hr aria-hidden="true" className="mb-1 w-6 shrink-0 border-sidebar-border" />}
      {children}
    </div>
  );
}

/**
 * The rows used less, folded under a "More" row that turns into "Less" once open and shows them below it, so the
 * column shows what is used every day and one row for the rest. The rows stay in the page while folded, hidden, and
 * the toggle says whether they are shown (aria-expanded). The state is the group's own, from `defaultOpen`, unless the
 * page passes `open`.
 */
function SidebarMore({
  moreLabel,
  lessLabel,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  /** The toggle's name while folded, such as "More". */
  moreLabel: string;
  /** The toggle's name while open, such as "Less". */
  lessLabel: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const open = openProp ?? innerOpen;
  const id = React.useId();
  return (
    <>
      <SidebarItem
        icon={open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        label={open ? lessLabel : moreLabel}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          if (openProp === undefined) setInnerOpen(!open);
          onOpenChange?.(!open);
        }}
      />
      <div id={id} data-slot="sidebar-more" hidden={!open} className="contents">
        {children}
      </div>
    </>
  );
}

/** A hairline between two groups of rows; shorter on the rail. */
function SidebarSeparator({ className, ...props }: React.ComponentProps<"hr">) {
  const { collapsed } = useSidebar();
  return (
    <hr
      data-slot="sidebar-separator"
      aria-hidden="true"
      className={cn("my-2 shrink-0 border-sidebar-border", collapsed ? "mx-auto w-6" : "mx-3", className)}
      {...props}
    />
  );
}

/** The bottom row of icon buttons (theme, language, the toggle); a column on the rail. */
function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { collapsed } = useSidebar();
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("mt-auto flex shrink-0 items-center gap-1 pt-3", collapsed && "flex-col", className)}
      {...props}
    />
  );
}

/**
 * One row: an icon, a name, and at the end a count or a dot. `current` marks the page being shown
 * (aria-current="page") with the selected tint and the ink text. A button unless `asChild`, which puts the row's content in the child
 * given, such as the router's link: `<SidebarItem asChild icon={…} label="Inbox"><Link href="/inbox" /></SidebarItem>`.
 * `count` is a quiet number, or any short text such as "3/10"; with `attention` it is a pill in the highlight color,
 * for something waiting on the person (unread, pending). `countLabel` is how it is read ("12 unread"), in place of the
 * bare number. `dot` marks the row without a number. On the rail the row is its icon, the name and count move to a
 * tooltip and stay in its accessible name, and `attention` or `dot` shows as a dot on the icon.
 */
function SidebarItem({
  icon,
  label,
  count,
  countLabel,
  attention = false,
  dot = false,
  current = false,
  asChild = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  /** The row's icon; it is hidden from assistive technology, which reads `label`. */
  icon: React.ReactNode;
  /** The row's name, shown beside the icon and, on the rail, in the tooltip. */
  label: string;
  count?: React.ReactNode;
  /** How the count is read, such as "12 unread"; without it the count is read as shown. */
  countLabel?: string;
  /** The count, or the dot, asks for the person's attention. */
  attention?: boolean;
  /** A dot at the end, or on the icon on the rail, for something new without a number. */
  dot?: boolean;
  current?: boolean;
  asChild?: boolean;
  /** With asChild, the element that becomes the row, such as a link. */
  children?: React.ReactElement;
}) {
  const { collapsed } = useSidebar();
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  // Radix reports a change only against the `open` it was given, so a tooltip shut by an expanded row never hears its
  // close. Forget it on expanding, or every row hovered meanwhile opens at once on the rail.
  if (tooltipOpen && !collapsed) setTooltipOpen(false);
  const Comp = asChild ? Slot.Root : "button";
  const hasCount = count !== undefined && count !== null && count !== false;
  const marked = collapsed ? attention || dot : dot && !hasCount;

  return (
    // Always controlled, so the tooltip never opens over the expanded row that already shows its name.
    <Tooltip open={collapsed && tooltipOpen} onOpenChange={(open) => setTooltipOpen(collapsed && open)}>
      <TooltipTrigger asChild>
        <Comp
          data-slot="sidebar-item"
          data-current={current ? "" : undefined}
          aria-current={current ? "page" : undefined}
          {...(asChild ? {} : { type: "button" as const })}
          className={cn(
            "group/sidebar-item relative flex h-8 shrink-0 items-center gap-2 rounded-control text-left text-base text-muted-foreground hover:bg-control hover:text-foreground focus-visible:-outline-offset-2 disabled:pointer-events-none disabled:opacity-50 data-current:bg-selected data-current:font-medium data-current:text-foreground data-current:hover:bg-selected [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            collapsed ? "size-9 justify-center px-0" : "w-full px-3",
            attention && "text-foreground",
            className,
          )}
          {...props}
        >
          <span aria-hidden="true" data-slot="sidebar-item-icon" className="inline-flex shrink-0">
            {icon}
          </span>
          <span data-slot="sidebar-item-label" className={collapsed ? "sr-only" : "min-w-0 flex-1 truncate"}>
            {label}
          </span>
          {hasCount && (
            <span
              data-slot="sidebar-item-count"
              aria-hidden={countLabel !== undefined ? true : undefined}
              className={cn(
                collapsed
                  ? countLabel !== undefined
                    ? "hidden"
                    : "sr-only"
                  : attention
                    ? "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-highlight px-1.5 text-2xs leading-none font-semibold text-highlight-foreground tabular-nums"
                    : "text-xs text-muted-foreground tabular-nums",
              )}
            >
              {count}
            </span>
          )}
          {countLabel !== undefined && hasCount && <span className="sr-only">{countLabel}</span>}
          {marked && (
            <span
              aria-hidden="true"
              data-slot="sidebar-item-dot"
              className={cn(
                "size-1.5 shrink-0 rounded-full bg-signal",
                collapsed &&
                  "absolute top-1.5 right-1.5 size-2 ring-2 ring-sidebar group-data-current/sidebar-item:ring-selected",
              )}
            />
          )}
          <Slot.Slottable>{children}</Slot.Slottable>
        </Comp>
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {hasCount && <span className="ml-1.5 text-muted-foreground tabular-nums">{countLabel ?? count}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * The button that collapses and expands the sidebar, with the panel icon for what it will do. Its name is what it
 * will do (`collapseLabel` or `expandLabel`), shown in a tooltip with `hint` beside it, such as a `<kbd>` with the
 * shortcut. When the sidebar has a shortcut, aria-keyshortcuts announces it.
 */
function SidebarToggle({
  expandLabel,
  collapseLabel,
  hint,
  className,
  onClick,
  variant = "ghost",
  size = "icon",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children" | "aria-label" | "asChild"> & {
  /** The name while collapsed, such as "Expand sidebar". */
  expandLabel: string;
  /** The name while expanded, such as "Collapse sidebar". */
  collapseLabel: string;
  /** Shown after the name in the tooltip, such as the shortcut. */
  hint?: React.ReactNode;
}) {
  const { collapsed, toggle, shortcut } = useSidebar();
  const label = collapsed ? expandLabel : collapseLabel;
  const key = shortcut?.toUpperCase();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          data-slot="sidebar-toggle"
          variant={variant}
          size={size}
          aria-label={label}
          aria-keyshortcuts={key ? `Meta+${key} Control+${key}` : undefined}
          className={cn("shrink-0", className)}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) toggle();
          }}
          {...props}
        >
          {collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-2">
        {label}
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}

export {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarSwitcher,
  SidebarNav,
  SidebarGroup,
  SidebarMore,
  SidebarSeparator,
  SidebarFooter,
  SidebarItem,
  SidebarToggle,
};
