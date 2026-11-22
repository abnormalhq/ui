import { Calendar } from "@/components/ui/calendar";

export const defaultCopy = { previous: "Previous month", next: "Next month", month: "Month", year: "Year" };

/* The page passes today, so the server and the browser draw the same month. */
export default function CalendarDemo({
  copy: overrides = {},
  locale = "en-GB",
}: { copy?: Partial<typeof defaultCopy>; locale?: string } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex flex-wrap items-start justify-center gap-10">
      <Calendar
        locale={locale}
        today="2026-11-10"
        defaultValue="2026-11-18"
        min="2026-11-03"
        previousLabel={copy.previous}
        nextLabel={copy.next}
      />
      {/* A range, with the two lists that jump to a month and a year: choose a day, then the other end. */}
      <Calendar
        mode="range"
        locale={locale}
        today="2026-11-10"
        defaultValue={{ from: "2026-11-12", to: "2026-11-18" }}
        max="2027-12-31"
        previousLabel={copy.previous}
        nextLabel={copy.next}
        monthLabel={copy.month}
        yearLabel={copy.year}
      />
    </div>
  );
}
