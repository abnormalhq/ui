import { Calendar } from "@/components/ui/calendar";

/* The page passes today, so the server and the browser draw the same month. */
export default function CalendarDemo() {
  return (
    <Calendar
      locale="en-GB"
      today="2026-11-10"
      defaultValue="2026-11-18"
      min="2026-11-03"
      previousLabel="Previous month"
      nextLabel="Next month"
    />
  );
}
