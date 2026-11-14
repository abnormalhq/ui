import { UptimeBar, UptimeValue, uptimeStatus, type UptimeBucket } from "@/components/ui/uptime-bar";

// Thirty days of checks, one bucket a day: mostly up, one partial outage, one full one, and two days without data.
const days: { up: number; total: number }[] = Array.from({ length: 30 }, (_, day) => {
  if (day < 2) return { up: 0, total: 0 };
  if (day === 17) return { up: 250, total: 288 };
  if (day === 23) return { up: 0, total: 288 };
  return { up: 288, total: 288 };
});

const buckets: UptimeBucket[] = days.map(({ up, total }, day) => ({
  status: uptimeStatus(up, total),
  label: total === 0 ? `Day ${day + 1}: no data` : `Day ${day + 1}: ${up} of ${total} checks passed`,
}));

export default function UptimeBarDemo() {
  return (
    <div className="grid w-full max-w-md gap-2 text-sm">
      <div className="flex items-baseline justify-between">
        <span className="font-medium">Mail delivery</span>
        <UptimeValue percent={96.6} className="font-medium">
          96.6%
        </UptimeValue>
      </div>
      <UptimeBar buckets={buckets} label="Uptime over the last 30 days" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
