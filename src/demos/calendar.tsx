import { Calendar } from "@/components/ui/calendar";

/* The page passes today, so the server and the browser draw the same month. */
export default function CalendarDemo() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-10">
      <Calendar
        locale="en-GB"
        today="2026-11-10"
        defaultValue="2026-11-18"
        min="2026-11-03"
        previousLabel="Previous month"
        nextLabel="Next month"
      />
      {/* A range, with the two lists that jump to a month and a year: choose a day, then the other end. */}
      <Calendar
        mode="range"
        locale="en-GB"
        today="2026-11-10"
        defaultValue={{ from: "2026-11-12", to: "2026-11-18" }}
        max="2027-12-31"
        previousLabel="Previous month"
        nextLabel="Next month"
        monthLabel="Month"
        yearLabel="Year"
      />
    </div>
  );
}
