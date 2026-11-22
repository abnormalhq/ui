import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

export const defaultCopy = {
  label: "Renewal date",
  placeholder: "Choose a date",
  calendarLabel: "Choose a renewal date",
  previous: "Previous month",
  next: "Next month",
};

export default function DatePickerDemo({
  copy: overrides = {},
  locale = "en-GB",
}: { copy?: Partial<typeof defaultCopy>; locale?: string } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid gap-2">
      <Label htmlFor="date-picker-renewal">{copy.label}</Label>
      <DatePicker
        id="date-picker-renewal"
        name="renewal"
        locale={locale}
        today="2026-11-10"
        defaultValue="2026-11-18"
        placeholder={copy.placeholder}
        calendarLabel={copy.calendarLabel}
        previousLabel={copy.previous}
        nextLabel={copy.next}
      />
    </div>
  );
}
