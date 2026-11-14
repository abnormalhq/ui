"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, type CalendarJumpProps } from "@/components/ui/calendar";
import { type ClosedDateRange, type DateRange, parseISODate } from "@/components/ui/calendar-date";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFormReset } from "@/components/ui/use-form-reset";

/** A range that may be open at one end, or at both while nothing is chosen: { from: "2026-11-10", to: null }. */
type OpenDateRange = { from: string | null; to: string | null };

/** The keys every mode below names, so the props can be read whichever mode the page chose. */
type RangeModeKeys = {
  allowPartial?: boolean;
  fromOnlyLabel?: string;
  toOnlyLabel?: string;
  clearable?: boolean;
  clearLabel?: string;
};

/**
 * What the field holds and hands back. Closed, the default: both ends or nothing, and onValueChange only ever gets
 * both. `clearable` (with `clearLabel`) lets it be emptied, and onValueChange then gets null. `allowPartial` (with
 * `fromOnlyLabel` and `toOnlyLabel`) lets one end stand alone, such as "since 10 November".
 */
type DateRangePickerModeProps = RangeModeKeys &
  (
    | {
        allowPartial?: false;
        fromOnlyLabel?: undefined;
        toOnlyLabel?: undefined;
        clearable?: false;
        clearLabel?: undefined;
        value?: ClosedDateRange | null;
        defaultValue?: ClosedDateRange;
        /** Called once both ends are chosen, with the earlier day as `from`. */
        onValueChange?: (value: ClosedDateRange) => void;
      }
    | {
        allowPartial?: false;
        fromOnlyLabel?: undefined;
        toOnlyLabel?: undefined;
        /** A button under the calendar empties the field. */
        clearable: true;
        /** The clear button's text, such as "Clear". */
        clearLabel: string;
        value?: ClosedDateRange | null;
        defaultValue?: ClosedDateRange;
        /** Called with both ends once they are chosen, and with null when the field is cleared. */
        onValueChange?: (value: ClosedDateRange | null) => void;
      }
    | ({
        /** One end may stand alone: after the first day, two buttons make it the start or the end. */
        allowPartial: true;
        /** The button that keeps the day as the start only, such as "From this day". */
        fromOnlyLabel: string;
        /** The button that keeps the day as the end only, such as "Until this day". */
        toOnlyLabel: string;
        value?: OpenDateRange | null;
        defaultValue?: OpenDateRange;
        /** Called with the range, either end of it null, and with null when the field is cleared. */
        onValueChange?: (value: OpenDateRange | null) => void;
      } & ({ clearable: true; clearLabel: string } | { clearable?: false; clearLabel?: undefined }))
  );

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
 * For a range that may be left empty pass `clearable` and `clearLabel`: a button under the calendar empties it, and
 * onValueChange gets null. For one that may be open at one end, such as "messages since 10 November", pass
 * `allowPartial` with `fromOnlyLabel` and `toOnlyLabel`: after the first day the popover offers to keep it as the
 * start only or the end only, the value is then { from, to: null } or { from: null, to }, the button shows the day
 * with a dash on the open side, and the missing end submits as an empty field.
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
  allowPartial = false,
  fromOnlyLabel,
  toOnlyLabel,
  clearable = false,
  clearLabel,
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
  CalendarJumpProps &
  DateRangePickerModeProps & {
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
  const [innerValue, setInnerValue] = React.useState<OpenDateRange | null>(defaultValue ?? null);
  const value: OpenDateRange | null = valueProp === undefined ? innerValue : valueProp;
  // Each mode's callback differs only in what it is handed, and the props say which mode this is.
  const report = onValueChange as ((value: OpenDateRange | null) => void) | undefined;
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
  const choose = (chosen: OpenDateRange | null) => {
    if (valueProp === undefined) setInnerValue(chosen);
    if (chosen?.from !== value?.from || chosen?.to !== value?.to) report?.(chosen);
    setOpen(false);
  };
  // Both names or neither, as Calendar takes them.
  const jump: CalendarJumpProps = monthLabel !== undefined && yearLabel !== undefined ? { monthLabel, yearLabel } : {};
  const from = parseISODate(value?.from);
  const to = parseISODate(value?.to);
  const text = React.useMemo(
    () => {
      const format = new Intl.DateTimeFormat(locale, { ...(dateFormat ?? { dateStyle: "medium" }), timeZone: "UTC" });
      if (from && to) return format.formatRange(from, to);
      // An open end has no words in Intl: the day, and a dash on the open side.
      if (from) return `${format.format(from)} –`;
      if (to) return `– ${format.format(to)}`;
      return undefined;
    },
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
          // An open range shows its one day; choosing starts a new range from there.
          value={
            draft ??
            (value && (value.from ?? value.to) ? { from: (value.from ?? value.to)!, to: value.to ?? value.from } : null)
          }
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
            choose({ from: next.from, to: next.to });
          }}
        />
        {((allowPartial && draft !== null) || (clearable && (value?.from || value?.to))) && (
          <div
            data-slot="date-range-picker-footer"
            className="mt-3 flex flex-wrap justify-end gap-1.5 border-t border-border pt-3"
          >
            {allowPartial && draft !== null && (
              <>
                <Button type="button" variant="ghost" size="sm" onClick={() => choose({ from: draft.from, to: null })}>
                  {fromOnlyLabel}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => choose({ from: null, to: draft.from })}>
                  {toOnlyLabel}
                </Button>
              </>
            )}
            {clearable && (value?.from || value?.to) && draft === null && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-slot="date-range-picker-clear"
                onClick={() => choose(null)}
              >
                {clearLabel}
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export { DateRangePicker, type OpenDateRange };
