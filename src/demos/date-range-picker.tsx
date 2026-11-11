import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";

/* A report's period: nothing after today, and the two days submit as from=2026-11-02&to=2026-11-10. */
export default function DateRangePickerDemo() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="date-range-picker-period">Period</Label>
      <DateRangePicker
        id="date-range-picker-period"
        fromName="from"
        toName="to"
        locale="en-GB"
        today="2026-11-10"
        max="2026-11-10"
        defaultValue={{ from: "2026-11-02", to: "2026-11-10" }}
        placeholder="Choose a period"
        calendarLabel="Choose a period"
        previousLabel="Previous month"
        nextLabel="Next month"
        monthLabel="Month"
        yearLabel="Year"
      />
    </div>
  );
}
