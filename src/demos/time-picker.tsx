import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";

export const defaultCopy = {
  label: "Quiet hours start",
  listLabel: "Choose a time",
  hint: "Notifications pause from this time until 08:00.",
};

export default function TimePickerDemo({
  copy: overrides = {},
  locale = "en-GB",
}: { copy?: Partial<typeof defaultCopy>; locale?: string } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-xs gap-2">
      <Label htmlFor="time-picker-quiet">{copy.label}</Label>
      <TimePicker
        id="time-picker-quiet"
        name="quietFrom"
        locale={locale}
        defaultValue="22:00"
        min="18:00"
        listLabel={copy.listLabel}
        aria-describedby="time-picker-quiet-hint"
        className="w-fit"
      />
      <p id="time-picker-quiet-hint" className="text-xs text-muted-foreground">
        {copy.hint}
      </p>
    </div>
  );
}
