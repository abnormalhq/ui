import * as React from "react";
import { cn } from "@/lib/utils";

/** How a span of time went: every check passed, some failed, all failed, or none ran. */
type UptimeStatus = "up" | "degraded" | "down" | "none";

/**
 * One span of the strip: its status and, as `title`, the words for it ("12 May: 287 of 288 checks passed"), shown in
 * the theme's tooltip over the bar on hover. `key` identifies it across renders, such as the span's start; the
 * position otherwise.
 */
type UptimeBucket = { status: UptimeStatus; title?: string; key?: React.Key };

/**
 * The status of a span from its counts: `up` when every check passed, `down` when none did, `degraded` in between,
 * and `none` when no check ran.
 */
function uptimeStatus(up: number, total: number): UptimeStatus {
  if (total <= 0) return "none";
  if (up >= total) return "up";
  return up <= 0 ? "down" : "degraded";
}

/*
 * The theme's tooltip drawn with CSS alone, so the strip still ships no script: an ink label above the hovered bar,
 * the same look as Tooltip. It cannot measure the window, so it leans away from the strip's ends instead: a bar in the
 * first third opens its label to the right, one in the last third to the left, the rest centered, and the label never
 * runs past the strip's own edges. The strip sits in a page's flow, where nothing clips it.
 */
const BUCKET_HINT =
  "pointer-events-none invisible absolute bottom-full z-overlay mb-1.5 w-max max-w-64 ink rounded-control px-2 py-1 text-xs font-medium whitespace-pre-line opacity-0 shadow-popover transition-opacity duration-100 group-hover/bucket:visible group-hover/bucket:opacity-100";

function hintPlacement(index: number, count: number) {
  if (index < count / 3) return "left-0";
  if (index >= (count * 2) / 3) return "right-0";
  return "left-1/2 -translate-x-1/2";
}

const bucketClassName: Record<UptimeStatus, string> = {
  up: "bg-success",
  degraded: "bg-warning",
  down: "bg-destructive",
  none: "bg-muted",
};

/**
 * A service's history at a glance: a strip of small bars, one per span of time (a day, an hour), oldest first, colored
 * by how that span went. It is drawn on the server with no script: each bar's `title` shows above it on hover in the
 * theme's tooltip, made with CSS, and the strip as a whole is one image named by `label` ("Last 90 days"), since a screen reader would otherwise
 * read every bar. Give the uptime in words beside it, with UptimeValue, so the number is not only in the colors.
 */
function UptimeBar({
  buckets,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "role" | "aria-label"> & {
  buckets: readonly UptimeBucket[];
  /** The strip's accessible name: the window it covers, such as "Uptime over the last 90 days". */
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      data-slot="uptime-bar"
      className={cn("flex h-6 min-w-0 items-stretch gap-px", className)}
      {...props}
    >
      {buckets.map((bucket, index) => (
        <span
          key={bucket.key ?? index}
          data-status={bucket.status}
          className={cn("group/bucket relative min-w-0 flex-1 rounded-[1px]", bucketClassName[bucket.status])}
        >
          {bucket.title ? (
            <span data-slot="uptime-bar-hint" className={cn(BUCKET_HINT, hintPlacement(index, buckets.length))}>
              {bucket.title}
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

/**
 * The uptime as a number, in the color of how it went: below `warnBelow` (100) amber, below `badBelow` (99) red.
 * `percent` is the share of checks that passed, from 0 to 100, or null for no checks, which shows `empty` ("—").
 * Children are the number as the page formats it for its locale ("99.95 %"); `hint` can carry the counts, shown above
 * the number on hover in the theme's tooltip, made with CSS like the strip's, so the value too ships no script.
 */
function UptimeValue({
  percent,
  warnBelow = 100,
  badBelow = 99,
  empty,
  hint,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "title"> & {
  percent: number | null;
  warnBelow?: number;
  badBelow?: number;
  /** Shown when there were no checks, such as "—". */
  empty?: React.ReactNode;
  /** Words shown over the number on hover, such as the counts ("287/288"). */
  hint?: React.ReactNode;
}) {
  const tone = percent === null ? "none" : percent < badBelow ? "down" : percent < warnBelow ? "degraded" : "up";
  return (
    <span
      data-slot="uptime-value"
      data-status={tone}
      className={cn(
        "tabular-nums",
        tone === "none" && "text-muted-foreground",
        tone === "degraded" && "text-warning",
        tone === "down" && "text-destructive",
        hint ? "group/bucket relative" : undefined,
        className,
      )}
      {...props}
    >
      {percent === null ? empty : children}
      {hint ? (
        <span data-slot="uptime-value-hint" className={cn(BUCKET_HINT, "left-1/2 -translate-x-1/2")}>
          {hint}
        </span>
      ) : null}
    </span>
  );
}

export { UptimeBar, UptimeValue, uptimeStatus, type UptimeBucket, type UptimeStatus };
