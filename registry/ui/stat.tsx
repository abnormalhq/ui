import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The headline numbers of a page: a row of tiles, each a small name, the number and a line saying what it covers.
 * StatGrid is the `dl` that holds them, two to a row on a phone and then as many as `columns` says. `tiles` keeps each
 * one a card of its own; `joined` draws them as cells of one bordered block, for an overview that reads as one thing.
 * Values come formatted from the page (its locale's digits, units and separators), and "—" for nothing to show.
 */
const statGridVariants = cva("grid min-w-0 grid-cols-2", {
  variants: {
    variant: {
      tiles: "gap-3",
      joined: "gap-px overflow-hidden rounded-panel border border-border bg-border",
    },
    columns: {
      2: "",
      3: "sm:grid-cols-3",
      4: "md:grid-cols-4",
      6: "sm:grid-cols-3 xl:grid-cols-6",
    },
  },
  defaultVariants: { variant: "tiles", columns: 4 },
});

function StatGrid({
  className,
  variant = "tiles",
  columns,
  ...props
}: React.ComponentProps<"dl"> & VariantProps<typeof statGridVariants>) {
  return (
    <dl
      data-slot="stat-grid"
      data-variant={variant}
      className={cn("group/stat-grid", statGridVariants({ variant, columns }), className)}
      {...props}
    />
  );
}

/**
 * One number. Children follow the value, such as a StatDelta or a StatHint; each is its own `dd`, so a screen reader
 * hears them as more about the same name. `muted` greys the value out, for a number that is not known yet or not in
 * use.
 */
function Stat({
  className,
  label,
  value,
  muted = false,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode;
  value: React.ReactNode;
  muted?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="stat"
      className={cn(
        "flex min-w-0 flex-col gap-1 rounded-panel border border-border bg-card p-4 group-data-[variant=joined]/stat-grid:rounded-none group-data-[variant=joined]/stat-grid:border-0 group-data-[variant=joined]/stat-grid:bg-background group-data-[variant=joined]/stat-grid:px-4 group-data-[variant=joined]/stat-grid:py-3.5",
        className,
      )}
      {...props}
    >
      <dt data-slot="stat-label" className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
        {label}
      </dt>
      <dd
        data-slot="stat-value"
        className={cn("truncate text-2xl font-semibold tracking-tight tabular-nums", muted && "text-muted-foreground")}
      >
        {value}
      </dd>
      {children}
    </div>
  );
}

/** A line under the value: what it covers ("Last 30 days"), or how it was counted. */
function StatHint({ className, ...props }: React.ComponentProps<"dd">) {
  return (
    <dd
      data-slot="stat-hint"
      className={cn("text-xs text-pretty text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

const statDeltaVariants = cva("inline-flex w-fit items-center gap-0.5 text-xs font-medium tabular-nums", {
  variants: {
    /** Whether the change is good news: the color says so, not the direction, since fewer bounces is good. */
    tone: {
      muted: "text-muted-foreground",
      success: "text-success",
      destructive: "text-destructive",
    },
  },
  defaultVariants: { tone: "muted" },
});

const directionIcons = { up: ArrowUpRightIcon, down: ArrowDownRightIcon, flat: ArrowRightIcon };

/**
 * The change since the period before, such as "+12%" against "last week". The arrow shows `direction` and is
 * decoration, so the text has to carry the sign itself; `tone` says whether the change is good.
 */
function StatDelta({
  className,
  direction,
  tone,
  children,
  ...props
}: React.ComponentProps<"dd"> &
  VariantProps<typeof statDeltaVariants> & {
    direction?: keyof typeof directionIcons;
  }) {
  const Icon = direction === undefined ? null : directionIcons[direction];
  return (
    <dd data-slot="stat-delta" className={cn(statDeltaVariants({ tone }), className)} {...props}>
      {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
      {children}
    </dd>
  );
}

export { StatGrid, Stat, StatHint, StatDelta, statGridVariants, statDeltaVariants };
