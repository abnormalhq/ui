import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Label } from "@/components/ui/label";

export default function DateTimePickerDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="date-time-picker-start">Maintenance starts</Label>
      <DateTimePicker
        id="date-time-picker-start"
        name="start"
        locale="en-GB"
        today="2026-11-10"
        defaultValue="2026-11-18T22:00"
        defaultTime="09:00"
        min="2026-11-10T00:00"
        step={900}
        placeholder="Choose a date"
        calendarLabel="Choose the start date"
        previousLabel="Previous month"
        nextLabel="Next month"
        timeLabel="Start time"
        aria-describedby="date-time-picker-zone"
      />
      <p id="date-time-picker-zone" className="text-xs text-muted-foreground">
        Times are in Europe/London.
      </p>
    </div>
  );
}
