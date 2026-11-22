import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";

export const defaultCopy = {
  label: "Period",
  placeholder: "Choose a period",
  calendarLabel: "Choose a period",
  previous: "Previous month",
  next: "Next month",
  month: "Month",
  year: "Year",
};

/* A report's period: nothing after today, and the two days submit as from=2026-11-02&to=2026-11-10. */
export default function DateRangePickerDemo({
  copy: overrides = {},
  locale = "en-GB",
}: { copy?: Partial<typeof defaultCopy>; locale?: string } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid gap-2">
      <Label htmlFor="date-range-picker-period">{copy.label}</Label>
      <DateRangePicker
        id="date-range-picker-period"
        fromName="from"
        toName="to"
        locale={locale}
        today="2026-11-10"
        max="2026-11-10"
        defaultValue={{ from: "2026-11-02", to: "2026-11-10" }}
        placeholder={copy.placeholder}
        calendarLabel={copy.calendarLabel}
        previousLabel={copy.previous}
        nextLabel={copy.next}
        monthLabel={copy.month}
        yearLabel={copy.year}
      />
    </div>
  );
}
