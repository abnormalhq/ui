import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

export default function DatePickerDemo() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="date-picker-renewal">Renewal date</Label>
      <DatePicker
        id="date-picker-renewal"
        name="renewal"
        locale="en-GB"
        today="2026-11-10"
        defaultValue="2026-11-18"
        placeholder="Choose a date"
        calendarLabel="Choose a renewal date"
        previousLabel="Previous month"
        nextLabel="Next month"
      />
    </div>
  );
}
