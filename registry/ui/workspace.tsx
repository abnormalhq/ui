import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * An ink frame around a product's navigation and paper panes. Only WorkspaceNavigation carries `ink`: the panes
 * are its siblings, so they follow the page's light or dark theme instead of inheriting the navigation's dark values.
 * Stacks on small screens; the page owns navigation collapse, pane widths, height and scrolling. No viewport lock,
 * hidden mobile navigation or extra landmark is imposed. Use `asChild` for the element the page's outline needs.
 */
function Workspace({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="workspace"
      className={cn("flex min-h-0 min-w-0 flex-col gap-1 rounded-panel bg-ink p-1 md:flex-row", className)}
      {...props}
    />
  );
}

/**
 * The permanent ink navigation surface. Give it a width on wider screens, or put a Sidebar inside with `className="p-0"`
 * here so the Sidebar keeps its own padding and collapsed width. Name navigation with the page's own nav or SidebarNav.
 */
function WorkspaceNavigation({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="workspace-navigation"
      className={cn("ink flex shrink-0 flex-col gap-4 rounded-mark p-3", className)}
      {...props}
    />
  );
}

/** Padding is local to the pane, not a global density switch: a reading pane can sit beside a compact list. */
const workspacePaneVariants = cva(
  "flex min-h-0 min-w-0 flex-none flex-col rounded-mark bg-background text-foreground md:flex-1",
  {
    variants: {
      padding: {
        none: "",
        compact: "p-3",
        comfortable: "p-5 md:p-6",
      },
    },
    defaultVariants: { padding: "comfortable" },
  },
);

/**
 * One continuous paper work surface, not a raised card. Keep lists, headers and reading content on it; use dividers,
 * not a card around every section. `none` lets rows or a table reach the edge. `asChild` can supply main, section or article.
 */
function WorkspacePane({
  className,
  padding = "comfortable",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof workspacePaneVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="workspace-pane"
      data-padding={padding}
      className={cn(workspacePaneVariants({ padding }), className)}
      {...props}
    />
  );
}

export { Workspace, WorkspaceNavigation, WorkspacePane };
