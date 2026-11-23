"use client";

import * as React from "react";
import { PanelLeftCloseIcon, PanelLeftOpenIcon, PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** A year, renewed by every change, so the choice outlives a session but not an abandoned browser. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type SidePaneSide = "start" | "end";

interface SidePaneState {
  collapsed: boolean;
  side: SidePaneSide;
  toggle: () => void;
  contentId: string;
}

const SidePaneContext = React.createContext<SidePaneState | null>(null);

function useSidePane(): SidePaneState {
  const state = React.useContext(SidePaneContext);
  if (!state) throw new Error("SidePane parts must be inside a SidePane.");
  return state;
}

/**
 * A pane beside a list that folds away to a narrow rail: the column of facets on the start side, the details of the
 * current row on the end side. Folded, only the header stays, turned on its side, with the button that opens it again,
 * so the list beside it gets the room and the pane is one click (or one Tab and Enter) away.
 * Give the pane its open width in `className` (such as `w-56`); folded it is 40px whatever the width says.
 * The state is the pane's own unless the page controls it (`collapsed`, `onCollapsedChange`). To keep it across
 * reloads, read a cookie on the server into `defaultCollapsed` and name it in `cookieName`, which the pane writes after
 * each change; or store it any other way from `onCollapsedChange`. Name the pane with `aria-label`.
 */
function SidePane({
  side = "start",
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  cookieName,
  className,
  children,
  ...props
}: React.ComponentProps<"aside"> & {
  /** Which side of the list the pane is on: it decides the toggle's arrow and which edge the rail keeps. */
  side?: SidePaneSide;
  /** Folded to the rail. Leave it out and the pane keeps its own state, from `defaultCollapsed`. */
  collapsed?: boolean;
  /** The state to start in, such as what the server read from the cookie below. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** A cookie to write after each change, `collapsed` or `expanded`, for a server that renders `defaultCollapsed`. */
  cookieName?: string;
}) {
  const [innerCollapsed, setInnerCollapsed] = React.useState(defaultCollapsed);
  const collapsed = collapsedProp ?? innerCollapsed;
  const contentId = React.useId();
  const latest = React.useRef({ collapsed, collapsedProp, onCollapsedChange, cookieName });
  React.useEffect(() => {
    latest.current = { collapsed, collapsedProp, onCollapsedChange, cookieName };
  });
  const toggle = React.useCallback(() => {
    const {
      collapsed: current,
      collapsedProp: controlled,
      onCollapsedChange: report,
      cookieName: cookie,
    } = latest.current;
    const next = !current;
    if (controlled === undefined) setInnerCollapsed(next);
    if (cookie) {
      document.cookie = `${cookie}=${next ? "collapsed" : "expanded"}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    }
    report?.(next);
  }, []);
  const state = React.useMemo(() => ({ collapsed, side, toggle, contentId }), [collapsed, side, toggle, contentId]);

  return (
    <SidePaneContext.Provider value={state}>
      <aside
        data-slot="side-pane"
        data-side={side}
        data-state={collapsed ? "collapsed" : "expanded"}
        className={cn(
          "group/side-pane flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden",
          // Folded, the rail is 40px whatever width the page gave the open pane, at every breakpoint.
          collapsed && "w-10! min-w-10",
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    </SidePaneContext.Provider>
  );
}

/**
 * The pane's top row: its title and the toggle, with room for a small action. Folded, the row turns on its side down
 * the rail, the toggle first, so the title still says what is folded away.
 */
function SidePaneHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="side-pane-header"
      className={cn(
        "flex min-h-10 shrink-0 items-center gap-1 px-2",
        "group-data-[side=end]/side-pane:flex-row-reverse group-data-[side=end]/side-pane:justify-end",
        "group-data-[state=collapsed]/side-pane:flex-col! group-data-[state=collapsed]/side-pane:items-center group-data-[state=collapsed]/side-pane:gap-2 group-data-[state=collapsed]/side-pane:px-0 group-data-[state=collapsed]/side-pane:py-1.5",
        className,
      )}
      {...props}
    />
  );
}

/** The pane's name, cut to one line; folded, it runs down the rail. */
function SidePaneTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="side-pane-title"
      className={cn(
        "min-w-0 flex-1 truncate px-1 text-xs font-medium text-muted-foreground",
        "group-data-[state=collapsed]/side-pane:flex-none group-data-[state=collapsed]/side-pane:px-0 group-data-[state=collapsed]/side-pane:[writing-mode:vertical-rl]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The button that folds the pane away and opens it again, in the pane's header. It says what it does in the page's
 * words, `collapseLabel` while the pane is open ("Hide filters") and `expandLabel` while it is folded ("Show
 * filters"), and whether the pane is open with aria-expanded.
 */
function SidePaneToggle({
  collapseLabel,
  expandLabel,
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children" | "aria-expanded" | "aria-controls" | "aria-label"> & {
  /** What the button does while the pane is open, such as "Hide filters". */
  collapseLabel: string;
  /** What it does while the pane is folded, such as "Show filters". */
  expandLabel: string;
}) {
  const { collapsed, side, toggle, contentId } = useSidePane();
  const Icon =
    side === "start"
      ? collapsed
        ? PanelLeftOpenIcon
        : PanelLeftCloseIcon
      : collapsed
        ? PanelRightOpenIcon
        : PanelRightCloseIcon;
  const label = collapsed ? expandLabel : collapseLabel;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      data-slot="side-pane-toggle"
      aria-expanded={!collapsed}
      aria-controls={contentId}
      aria-label={label}
      title={label}
      className={cn("shrink-0 text-muted-foreground group-data-[state=collapsed]/side-pane:order-first", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      {...props}
    >
      <Icon />
    </Button>
  );
}

/**
 * What the pane holds, scrolling on its own below the header. Folded, it stays in the page but hidden, so what is in
 * it (a search typed, a page of choices loaded) is still there when the pane opens again. Its `id` is the pane's own,
 * the one the toggle's aria-controls names, and it is hidden exactly while the pane is folded.
 */
function SidePaneContent({ className, ...props }: Omit<React.ComponentProps<"div">, "id" | "hidden">) {
  const { collapsed, contentId } = useSidePane();
  return (
    <div
      data-slot="side-pane-content"
      className={cn("min-h-0 flex-1 overflow-y-auto", className)}
      {...props}
      id={contentId}
      hidden={collapsed}
    />
  );
}

export { SidePane, SidePaneHeader, SidePaneTitle, SidePaneToggle, SidePaneContent };
