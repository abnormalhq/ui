"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, type CalendarJumpProps } from "@/components/ui/calendar";
import { parseISODate } from "@/components/ui/calendar-date";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFormReset } from "@/components/ui/use-form-reset";

/**
 * A field that may be left empty: `clearable` adds a button under the calendar, named by `clearLabel`, that empties
 * it. Both or neither.
 */
type DatePickerClearProps = { clearable: true; clearLabel: string } | { clearable?: false; clearLabel?: undefined };

const DATE_PICKER_SIZES = {
  sm: "h-7 px-2 text-sm",
  default: "h-8 px-3 text-base",
  lg: "h-10 px-3.5 text-base",
};

/**
 * A date field: a button showing the chosen day, written the way the `locale` writes dates, that opens a Calendar in
 * a popover. Choosing a day closes it and focus returns to the button; Escape closes it without choosing.
 * The value is text ("2026-11-10"), as for Calendar and for <input type="date">, and with a `name` it submits with a
 * form in that form. With or without a name, and disabled or not, a reset of the form the button belongs to puts an
 * uncontrolled field back on its default, unless the page cancels the reset; a controlled one follows its value prop.
 * The button is a combobox to assistive technology, one whose popup is a dialog, as in the date picker of the ARIA
 * Authoring Practices: its value is the chosen day, so a screen reader reads the field's name and then the date.
 * `formatValue` writes the day on the button the page's way instead, such as "2026-11-14".
 * The words are the page's: `placeholder` while no day is chosen, `calendarLabel` to name the popover ("Choose a
 * date"), and the two month button names. A combobox takes no name from its content, so give the button one: a
 * Label (`id` and htmlFor), aria-label or aria-labelledby. `monthLabel` and `yearLabel` turn the calendar's caption
 * into two lists that jump to a month and a year.
 * For a date that may be left empty (an expiry, the start of an import) pass `clearable` and `clearLabel`: while a
 * day is chosen, a button under the calendar empties the field, which then submits an empty value and calls
 * onValueChange with "".
 * On phones, or for a date typed far more often than picked (a date of birth), the browser's own
 * <input type="date"> in an Input is the better control.
 */
function DatePicker({
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
  formatValue,
  today,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  clearable = false,
  clearLabel,
  name,
  form,
  size = "default",
  align = "start",
  className,
  disabled,
  open: openProp,
  onOpenChange,
  ref,
  ...props
}: Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "children" | "type"> &
  Pick<
    React.ComponentProps<typeof Calendar>,
    "locale" | "today" | "min" | "max" | "isDateDisabled" | "weekStartsOn" | "previousLabel" | "nextLabel"
  > &
  CalendarJumpProps &
  DatePickerClearProps & {
    value?: string | null;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Shown on the button while no day is chosen. */
    placeholder: React.ReactNode;
    /** The accessible name of the popover that holds the calendar. */
    calendarLabel: string;
    /** How the chosen day is written on the button; the locale's medium date unless given. */
    dateFormat?: Intl.DateTimeFormatOptions;
    /**
     * Writes the chosen day on the button in place of Intl, from the value as the field holds it ("2026-11-14"), for a
     * page with a date style of its own, such as the value itself. The calendar keeps the locale's names.
     */
    formatValue?: (value: string) => React.ReactNode;
    size?: keyof typeof DATE_PICKER_SIZES;
    align?: "start" | "center" | "end";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) {
  // An empty value is no day, as an empty <input type="date"> is: "" reaches the calendar as null.
  const [innerValue, setInnerValue] = React.useState(defaultValue || null);
  // A form reset (a reset button, form.reset(), or the reset React runs after a form action) puts an uncontrolled
  // field back on its default, as it does a native one, unless the page cancels the reset. A controlled field follows
  // its value prop.
  // The button finds the form, not the hidden input: a field without a name, or a disabled one, has none to ask.
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement, []);
  const submits = name !== undefined && !disabled;
  useFormReset(buttonRef, () => setInnerValue(defaultValue || null));
  const value = (valueProp === undefined ? innerValue : valueProp) || null;
  const [innerOpen, setInnerOpen] = React.useState(false);
  const open = openProp ?? innerOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };
  // Both names or neither, as Calendar takes them.
  const jump: CalendarJumpProps = monthLabel !== undefined && yearLabel !== undefined ? { monthLabel, yearLabel } : {};
  const chosen = parseISODate(value);
  const intlText = React.useMemo(
    () =>
      chosen &&
      new Intl.DateTimeFormat(locale, { ...(dateFormat ?? { dateStyle: "medium" }), timeZone: "UTC" }).format(chosen),
    // The day is compared as text: a new Date object for the same day is not a change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, dateFormat, value],
  );
  const text = chosen && value && formatValue ? formatValue(value) : intlText;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          // PopoverTrigger adds aria-expanded, aria-controls and aria-haspopup="dialog" to the button.
          // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
          role="combobox"
          data-slot="date-picker-trigger"
          data-size={size}
          data-placeholder={chosen ? undefined : ""}
          disabled={disabled}
          form={form}
          ref={buttonRef}
          className={cn(
            "flex w-56 min-w-0 items-center gap-2 rounded-control border border-input bg-popover text-left text-foreground shadow-control transition-[border-color,background-color,box-shadow] duration-100 select-none hover:bg-accent active:shadow-none focus-visible:-outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:bg-accent aria-invalid:border-destructive data-placeholder:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
            DATE_PICKER_SIZES[size],
            className,
          )}
          {...props}
        >
          <CalendarIcon className="text-muted-foreground" aria-hidden="true" />
          <span data-slot="date-picker-value" className="min-w-0 flex-1 truncate">
            {text ?? placeholder}
          </span>
          {/* A day that does not exist submits as no day, as a date input sanitizes it. */}
          {submits && <input type="hidden" name={name} value={(chosen && value) || ""} form={form} />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={calendarLabel}
        align={align}
        className="w-auto p-3"
        // The popover opens on the grid, at the chosen day or today, not on the month buttons.
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
          locale={locale}
          // A day that is no day, such as "2026-13-10" from a hand-edited link, opens on today as no day does.
          value={chosen ? value : null}
          today={today}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          weekStartsOn={weekStartsOn}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          {...jump}
          onValueChange={(next) => {
            if (valueProp === undefined) setInnerValue(next);
            if (next !== value) onValueChange?.(next);
            setOpen(false);
          }}
        />
        {clearable && chosen && (
          <div data-slot="date-picker-footer" className="mt-3 flex justify-end border-t border-border pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-slot="date-picker-clear"
              onClick={() => {
                if (valueProp === undefined) setInnerValue(null);
                onValueChange?.("");
                setOpen(false);
              }}
            >
              {clearLabel}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
