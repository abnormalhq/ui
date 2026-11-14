import * as React from "react";
import { cn } from "@/lib/utils";

/** How a span of time went: every check passed, some failed, all failed, or none ran. */
type UptimeStatus = "up" | "degraded" | "down" | "none";

/**
 * One span of the strip: its status and, as `title`, the words for it ("12 May: 287 of 288 checks passed"), shown as
 * the bar's native tooltip. `key` identifies it across renders, such as the span's start; the position otherwise.
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

const bucketClassName: Record<UptimeStatus, string> = {
  up: "bg-success",
  degraded: "bg-badge-ink",
  down: "bg-destructive",
  none: "bg-muted",
};

/**
 * A service's history at a glance: a strip of small bars, one per span of time (a day, an hour), oldest first, colored
 * by how that span went. It is drawn on the server with no script: each bar's `title` is its native tooltip,
 * and the strip as a whole is one image named by `label` ("Last 90 days"), since a screen reader would otherwise
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
          title={bucket.title}
          className={cn("min-w-0 flex-1 rounded-[1px]", bucketClassName[bucket.status])}
        />
      ))}
    </div>
  );
}

/**
 * The uptime as a number, in the color of how it went: below `warnBelow` (100) amber, below `badBelow` (99) red.
 * `percent` is the share of checks that passed, from 0 to 100, or null for no checks, which shows `empty` ("—").
 * Children are the number as the page formats it for its locale ("99.95 %"); `title` can carry the counts.
 */
function UptimeValue({
  percent,
  warnBelow = 100,
  badBelow = 99,
  empty,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  percent: number | null;
  warnBelow?: number;
  badBelow?: number;
  /** Shown when there were no checks, such as "—". */
  empty?: React.ReactNode;
}) {
  const tone = percent === null ? "none" : percent < badBelow ? "down" : percent < warnBelow ? "degraded" : "up";
  return (
    <span
      data-slot="uptime-value"
      data-status={tone}
      className={cn(
        "tabular-nums",
        tone === "none" && "text-muted-foreground",
        tone === "degraded" && "text-badge-ink",
        tone === "down" && "text-destructive",
        className,
      )}
      {...props}
    >
      {percent === null ? empty : children}
    </span>
  );
}

export { UptimeBar, UptimeValue, uptimeStatus, type UptimeBucket, type UptimeStatus };
