import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * A key on the keyboard, as a small cap: in a shortcut list, a menu hint or a search box's "/".
 * `default` sits quietly on the page; `raised` is the larger cap with a control fill, for a list of shortcuts where
 * the keys are the point. The text is the key as it is printed ("Esc", "↵", "K"): the page passes the names of its
 * keyboard, including the modifier, which `useModifierKey` (in use-modifier-key.ts) can tell for the platform.
 * KbdCombo holds the keys pressed together, or one after another, with the page's own separator between them if any.
 * Give a combo `aria-label` with the shortcut in words when the caps alone would be read as symbols.
 */
const kbdVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-chip border font-sans font-medium text-muted-foreground tabular-nums [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default: "h-5 min-w-5 border-border bg-card px-1 text-xs",
        raised: "h-6 min-w-6 border-input bg-control px-1.5 text-xs shadow-[inset_0_-1px_0_var(--input)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Kbd({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"kbd"> & VariantProps<typeof kbdVariants>) {
  return <kbd data-slot="kbd" data-variant={variant} className={cn(kbdVariants({ variant }), className)} {...props} />;
}

/** Keys pressed together or in a row: `<KbdCombo><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdCombo>`. A `kbd` around `kbd`s, as HTML marks a combination. */
function KbdCombo({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd-combo"
      className={cn("inline-flex items-center gap-1 font-sans text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Kbd, KbdCombo, kbdVariants };
