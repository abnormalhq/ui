import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Label } from "@/components/ui/label";

export const defaultCopy = {
  label: "Maintenance starts",
  placeholder: "Choose a date",
  calendarLabel: "Choose the start date",
  previous: "Previous month",
  next: "Next month",
  time: "Start time",
  timeZone: "Times are in Europe/London.",
};

export default function DateTimePickerDemo({
  copy: overrides = {},
  locale = "en-GB",
}: { copy?: Partial<typeof defaultCopy>; locale?: string } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="date-time-picker-start">{copy.label}</Label>
      <DateTimePicker
        id="date-time-picker-start"
        name="start"
        locale={locale}
        today="2026-11-10"
        defaultValue="2026-11-18T22:00"
        defaultTime="09:00"
        min="2026-11-10T00:00"
        step={900}
        placeholder={copy.placeholder}
        calendarLabel={copy.calendarLabel}
        previousLabel={copy.previous}
        nextLabel={copy.next}
        timeLabel={copy.time}
        aria-describedby="date-time-picker-zone"
      />
      <p id="date-time-picker-zone" className="text-xs text-muted-foreground">
        {copy.timeZone}
      </p>
    </div>
  );
}
