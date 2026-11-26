"use client";

import * as React from "react";
import { Toolbar as ToolbarPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LabelTooltip } from "@/components/ui/tooltip";

/**
 * A row of controls that act on one thing, such as the formatting buttons over an editor: one tab stop for the whole
 * row (role="toolbar"), with the arrow keys moving between its controls, Home and End jumping to the ends, and the
 * focus wrapping around. A disabled control, or one a narrow layout hides with display: none, is passed over.
 * Name it with `label`, in the page's language. ToolbarGroup and ToolbarSeparator split the row into sets; a select,
 * a menu trigger or the page's own control joins the roving focus inside ToolbarItem.
 * An editor's toolbar usually keeps the caret where it was: stop the press from taking the focus
 * (`onMouseDown={(event) => event.preventDefault()}` on a button) and run the command on the editor.
 */
function Toolbar({
  label,
  className,
  ...props
}: Omit<React.ComponentProps<typeof ToolbarPrimitive.Root>, "aria-label"> & {
  /** The toolbar's name, such as "Formatting". */
  label: string;
}) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      aria-label={label}
      className={cn(
        "flex min-w-0 items-center gap-0.5 data-[orientation=vertical]:w-fit data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

/** A set of related controls, such as the text styles. Name it with aria-label when the set has a name of its own. */
function ToolbarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="toolbar-group"
      className={cn("flex items-center gap-0.5 in-data-[orientation=vertical]:flex-col", className)}
      {...props}
    />
  );
}

/** A hairline between two sets of controls, across the toolbar's direction. */
function ToolbarSeparator({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        "mx-1 shrink-0 bg-border data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-4 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A Button in the toolbar's roving focus, ghost and icon-sized unless told otherwise. `pressed` makes it a toggle
 * (aria-pressed), shown with the control fill: bold, italic, a list. An icon-only button needs aria-label, which
 * an icon-sized one also shows in the theme's tooltip; `tooltip` shows more than the name instead, such as the
 * shortcut, and on any size.
 */
function ToolbarButton({
  pressed,
  disabled,
  tooltip,
  variant = "ghost",
  size = "icon-sm",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "asChild" | "aria-pressed" | "title"> & {
  /** The toggle's state; leave it out for a plain button. */
  pressed?: boolean;
  /** The hint, when it says more than the name, such as "Bold (Ctrl+B)". */
  tooltip?: string;
}) {
  const name = props["aria-label"];
  const button = (
    // The primitive reads `disabled` to pass the button over; the button itself needs it to be disabled.
    <ToolbarPrimitive.Button asChild disabled={disabled}>
      <Button
        type="button"
        data-slot="toolbar-button"
        disabled={disabled}
        variant={variant}
        size={size}
        aria-pressed={pressed}
        className={cn("aria-pressed:bg-accent aria-pressed:text-foreground", className)}
        {...props}
      />
    </ToolbarPrimitive.Button>
  );
  const iconName = typeof size === "string" && size.startsWith("icon") ? name : undefined;
  // The name is on the button inside the primitive, so a hint that only repeats it does not describe the button too.
  return (
    <LabelTooltip label={tooltip ?? iconName} describe={tooltip !== undefined && tooltip !== name}>
      {button}
    </LabelTooltip>
  );
}

/**
 * Any other control in the roving focus: the child (a SelectTrigger, a DropdownMenuTrigger with its button, a link)
 * becomes a toolbar item and keeps its own look.
 */
function ToolbarItem({ ...props }: Omit<React.ComponentProps<typeof ToolbarPrimitive.Button>, "asChild">) {
  return <ToolbarPrimitive.Button data-slot="toolbar-item" asChild {...props} />;
}

export { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarButton, ToolbarItem };
