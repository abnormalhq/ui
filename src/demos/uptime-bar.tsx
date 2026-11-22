import { UptimeBar, UptimeValue, uptimeStatus, type UptimeBucket } from "@/components/ui/uptime-bar";

// Thirty days of checks, one bucket a day: mostly up, one partial outage, one full one, and two days without data.
const days: { up: number; total: number }[] = Array.from({ length: 30 }, (_, day) => {
  if (day < 2) return { up: 0, total: 0 };
  if (day === 17) return { up: 250, total: 288 };
  if (day === 23) return { up: 0, total: 288 };
  return { up: 288, total: 288 };
});

export const defaultCopy = {
  noData: "Day {day}: no data",
  checksPassed: "Day {day}: {up} of {total} checks passed",
  mailDelivery: "Mail delivery",
  uptime: "Uptime over the last 30 days",
  thirtyDaysAgo: "30 days ago",
  today: "Today",
};

export default function UptimeBarDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const buckets: UptimeBucket[] = days.map(({ up, total }, day) => ({
    status: uptimeStatus(up, total),
    title:
      total === 0
        ? copy.noData.replace("{day}", String(day + 1))
        : copy.checksPassed
            .replace("{day}", String(day + 1))
            .replace("{up}", String(up))
            .replace("{total}", String(total)),
  }));
  return (
    <div className="grid w-full max-w-md gap-2 text-sm">
      <div className="flex items-baseline justify-between">
        <span className="font-medium">{copy.mailDelivery}</span>
        <UptimeValue percent={96.6} className="font-medium">
          96.6%
        </UptimeValue>
      </div>
      <UptimeBar buckets={buckets} label={copy.uptime} />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{copy.thirtyDaysAgo}</span>
        <span>{copy.today}</span>
      </div>
    </div>
  );
}
