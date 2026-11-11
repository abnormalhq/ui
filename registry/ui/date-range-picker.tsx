"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar, type CalendarJumpProps } from "@/components/ui/calendar";
import { type ClosedDateRange, type DateRange, parseISODate } from "@/components/ui/calendar-date";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFormReset } from "@/components/ui/use-form-reset";

const DATE_RANGE_PICKER_SIZES = {
  sm: "h-7 px-2 text-sm",
  default: "h-8 px-3 text-base",
  lg: "h-10 px-3.5 text-base",
};

/**
 * A field for a span of days, such as the period of a report: a button showing the range, written the way the
 * `locale` writes one ("10 – 18 Nov 2026"), that opens a Calendar in range mode in a popover. The first day chosen is
 * one end, the second closes the range, the popover and the choice: the field changes, and onValueChange is called,
 * only with both ends. Escape, or a click outside, closes it and keeps the range it had.
 * The value is { from, to } with both days as text ("2026-11-10"), as for Calendar. With `fromName` and `toName` it
 * submits with a form as two fields in that form, both empty while no range is chosen. With or without the names, a
 * reset of the form the button belongs to puts an uncontrolled field back on its default, unless the page cancels the
 * reset. A range left half chosen is dropped when the popover closes, whoever closes it, and when the form resets.
 * The button is a combobox to assistive technology, one whose popup is a dialog, as DatePicker's is: its value is
 * the chosen range. The words are the page's: `placeholder`, `calendarLabel` to name the popover, the two month
 * button names and, for the lists that jump to a month and a year, `monthLabel` and `yearLabel`. Give the button a
 * name: a Label (`id` and htmlFor), aria-label or aria-labelledby.
 */
function DateRangePicker({
  locale,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder,
  calendarLabel,
  previousLabel,
  nextLabel,
  monthLabel,
  yearLabel,
  dateFormat,
  today,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  fromName,
  toName,
  form,
  size = "default",
  align = "start",
  className,
  disabled,
  open: openProp,
  onOpenChange,
  ref,
  ...props
}: Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "children" | "type" | "name"> &
  Pick<
    React.ComponentProps<typeof Calendar>,
    "locale" | "today" | "min" | "max" | "isDateDisabled" | "weekStartsOn" | "previousLabel" | "nextLabel"
  > &
  CalendarJumpProps & {
    value?: ClosedDateRange | null;
    defaultValue?: ClosedDateRange;
    /** Called once both ends are chosen, with the earlier day as `from`. */
    onValueChange?: (value: ClosedDateRange) => void;
    /** Shown on the button while no range is chosen. */
    placeholder: React.ReactNode;
    /** The accessible name of the popover that holds the calendar. */
    calendarLabel: string;
    /** How the two days are written on the button; the locale's medium date unless given. */
    dateFormat?: Intl.DateTimeFormatOptions;
    /** The names of the two form fields, such as "from" and "to". */
    fromName?: string;
    toName?: string;
    size?: keyof typeof DATE_RANGE_PICKER_SIZES;
    align?: "start" | "center" | "end";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) {
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? null);
  const value = valueProp === undefined ? innerValue : valueProp;
  // The range being chosen in the open popover: one end, until the second makes it the value.
  const [draft, setDraft] = React.useState<DateRange | null>(null);
  // The button finds the form, not the hidden inputs: a field without names, or a disabled one, has none to ask.
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement, []);
  const submits = !disabled;
  useFormReset(buttonRef, () => {
    setDraft(null);
    setInnerValue(defaultValue ?? null);
  });
  const [innerOpen, setInnerOpen] = React.useState(false);
  const open = openProp ?? innerOpen;
  // A page that holds `open` closes the popover without a word to setOpen: the draft goes with any close.
  if (!open && draft !== null) setDraft(null);
  const setOpen = (next: boolean) => {
    setDraft(null);
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };
  // Both names or neither, as Calendar takes them.
  const jump: CalendarJumpProps = monthLabel !== undefined && yearLabel !== undefined ? { monthLabel, yearLabel } : {};
  const from = parseISODate(value?.from);
  const to = parseISODate(value?.to);
  const text = React.useMemo(
    () =>
      from &&
      to &&
      new Intl.DateTimeFormat(locale, { ...(dateFormat ?? { dateStyle: "medium" }), timeZone: "UTC" }).formatRange(
        from,
        to,
      ),
    // The days are compared as text: a new Date object for the same day is not a change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, dateFormat, value?.from, value?.to],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          // PopoverTrigger adds aria-expanded, aria-controls and aria-haspopup="dialog" to the button.
          // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
          role="combobox"
          data-slot="date-range-picker-trigger"
          data-size={size}
          data-placeholder={text ? undefined : ""}
          disabled={disabled}
          form={form}
          ref={buttonRef}
          className={cn(
            "flex w-64 min-w-0 items-center gap-2 rounded-control border border-input bg-control text-left text-foreground transition-[border-color,background-color] duration-150 select-none hover:bg-accent focus-visible:-outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:bg-accent aria-invalid:border-destructive data-placeholder:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
            DATE_RANGE_PICKER_SIZES[size],
            className,
          )}
          {...props}
        >
          <CalendarIcon className="text-muted-foreground" aria-hidden="true" />
          {/* The spaces around the dash of a range differ from one release of the Intl data to the next, so the
              server's text may not be the browser's to the character: both are right, and hydration keeps the first. */}
          <span data-slot="date-range-picker-value" className="min-w-0 flex-1 truncate" suppressHydrationWarning>
            {text ?? placeholder}
          </span>
          {submits && fromName !== undefined && (
            <input type="hidden" name={fromName} value={value?.from ?? ""} form={form} />
          )}
          {submits && toName !== undefined && <input type="hidden" name={toName} value={value?.to ?? ""} form={form} />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={calendarLabel}
        align={align}
        className="w-auto p-3"
        // The popover opens on the grid, at the start of the range or today, not on the month buttons.
        onOpenAutoFocus={(event) => {
          const day =
            event.currentTarget instanceof HTMLElement
              ? event.currentTarget.querySelector<HTMLElement>('[data-slot="calendar-day"][tabindex="0"]')
              : null;
          if (!day) return;
          event.preventDefault();
          day.focus();
        }}
      >
        <Calendar
          mode="range"
          locale={locale}
          value={draft ?? value}
          today={today}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          weekStartsOn={weekStartsOn}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          {...jump}
          onValueChange={(next) => {
            if (next.to === null) return setDraft(next);
            const chosen = { from: next.from, to: next.to };
            if (valueProp === undefined) setInnerValue(chosen);
            if (chosen.from !== value?.from || chosen.to !== value?.to) onValueChange?.(chosen);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DateRangePicker };
