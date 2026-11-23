import * as React from "react";
import { Slot } from "radix-ui";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

/**
 * The thin strip along the bottom of an app window: the connection, a queue, the version on one side, the keys that
 * work on the screen on the other. Every entry is short and quiet, in the small secondary text, and numbers keep their
 * width so a count that changes does not push its neighbours. It is a `footer` unless `asChild` gives the page's own
 * element; put `ink` on it for the dark strip that continues an ink navigation column under the page.
 * The bar takes no fixed position: the page places it (fixed to the viewport, or the last row of its own frame).
 */
function StatusBar({ className, asChild = false, ...props }: React.ComponentProps<"footer"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "footer";
  return (
    <Comp
      data-slot="status-bar"
      className={cn(
        "flex h-10 min-w-0 items-center gap-4 overflow-hidden px-4 text-xs whitespace-nowrap text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

/**
 * One entry: a word, a dot and a word, a count. As a link or a button (`asChild`) it takes the full height of the bar,
 * so it is easy to hit, and lights up to the foreground under the pointer or the focus.
 */
function StatusBarItem({ className, asChild = false, ...props }: React.ComponentProps<"span"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp
      data-slot="status-bar-item"
      className={cn(
        "inline-flex h-full min-w-0 shrink-0 items-center gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        "[&:is(a,button)]:cursor-pointer [&:is(a,button)]:transition-colors [&:is(a,button)]:hover:text-foreground [&:is(a,button)]:focus-visible:text-foreground [&:is(a,button)]:focus-visible:-outline-offset-2 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

/** Pushes what follows to the far end of the bar. */
function StatusBarSpacer({ className, ...props }: Omit<React.ComponentProps<"span">, "children">) {
  return <span aria-hidden="true" data-slot="status-bar-spacer" className={cn("flex-1", className)} {...props} />;
}

/** A hairline between two groups of entries. */
function StatusBarSeparator({ className, ...props }: Omit<React.ComponentProps<"span">, "children">) {
  return (
    <span
      aria-hidden="true"
      data-slot="status-bar-separator"
      className={cn("h-4 w-px shrink-0 bg-border", className)}
      {...props}
    />
  );
}

/**
 * A key and what it does on this screen: `keys` are the caps as printed ("J", "K", "⌘K"), pressed together or in
 * turn, and the children say what they do in the page's words. A screen reader reads the caps as symbols, so give
 * the hint `aria-label` with the shortcut in words where that matters. The hint is a reminder for the keyboard,
 * never the only way to reach the action.
 */
function StatusBarShortcut({
  className,
  keys,
  children,
  ...props
}: React.ComponentProps<"span"> & { keys: readonly string[] }) {
  return (
    <span
      data-slot="status-bar-shortcut"
      className={cn("inline-flex shrink-0 items-center gap-1.5", className)}
      {...props}
    >
      <span className="inline-flex items-center gap-0.5">
        {keys.map((key, index) => (
          <Kbd key={`${key}-${index}`} className="h-4 min-w-4 bg-transparent px-0.5 text-2xs">
            {key}
          </Kbd>
        ))}
      </span>
      {children}
    </span>
  );
}

export { StatusBar, StatusBarItem, StatusBarSpacer, StatusBarSeparator, StatusBarShortcut };
