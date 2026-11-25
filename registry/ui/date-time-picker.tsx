"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { useFormReset } from "@/components/ui/use-form-reset";

/** A day and a time of day, as the two halves of "2026-11-10T09:30" (or "2026-11-10T09:30:45"). */
type Parts = { date: string; time: string };

/** Omit over each member of a union, so the date picker's "both month names or neither" survives. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

const split = (value: string | null | undefined): Parts => {
  // Seconds, and their fractions, are kept: a `step` under a minute makes the time input write them.
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)/);
  return match ? { date: match[1]!, time: match[2]! } : { date: "", time: "" };
};
const join = ({ date, time }: Parts) => (date && time ? `${date}T${time}` : "");

/**
 * A date and a time of day in one field: a DatePicker for the day and a TimePicker beside it, the browser's own time
 * input with the theme's list of times. The value is local text, "2026-11-10T09:30", exactly what
 * <input type="datetime-local"> submits, so a server that took that field takes this one, and a time zone is the
 * page's to state (in a hint beside the field) and to apply.
 * The value is empty until both halves are set, and empties again when either is cleared. `defaultTime` fills the
 * time when a day is chosen first, such as "09:00". With a `step` under a minute the time carries seconds too,
 * "2026-11-10T09:30:45", as the native field writes it, and the value, `min` and `max` may carry them.
 * `min` and `max` are moments in the same form: the calendar stops at their days, and the time at their times on
 * those days, so the list dims the times out of range and the browser's own validation reports a typed one.
 * With a `name` the value submits as one hidden form field. A reset of the form puts an uncontrolled field back on its
 * default, unless the page cancels the reset; a controlled one follows its value prop.
 * `clearable` with `clearLabel` adds the date picker's clear button, which empties the day and the time together.
 * `formatValue` is the date picker's: it writes the day on the button the page's way ("2026-11-14"), from the day
 * alone; the time input writes the time as the browser does, and the list as the `locale` does.
 * The words are the page's: the date picker's (`placeholder`, `calendarLabel`, the month buttons), `timeLabel`, the
 * time input's name, and `timeListLabel`, the name of the list of times and its clock button ("Choose a time"), which
 * is `timeLabel` unless given. The other props, `id` and the aria ones included, go to the date button, so a Label
 * names it.
 */
function DateTimePicker({
  locale,
  value: valueProp,
  defaultValue,
  onValueChange,
  defaultTime,
  min,
  max,
  timeLabel,
  timeListLabel,
  step,
  name,
  form,
  disabled,
  size = "default",
  className,
  timeClassName,
  ...props
}: DistributiveOmit<
  React.ComponentProps<typeof DatePicker>,
  "value" | "defaultValue" | "onValueChange" | "min" | "max" | "name" | "size"
> & {
  /** The moment, as "2026-11-10T09:30", or empty. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The time a day chosen first starts at, as "09:00". */
  defaultTime?: string;
  /** The first and last moment that can be chosen, as "2026-11-10T09:30". */
  min?: string;
  max?: string;
  /** The time input's accessible name, such as "Time". */
  timeLabel: string;
  /** The name of the list of times and of the button that opens it, such as "Choose a time"; `timeLabel` unless given. */
  timeListLabel?: string;
  /** The time input's step in seconds: 60 by default, 900 for quarter hours. */
  step?: number;
  /** The field the value submits as. */
  name?: string;
  size?: "sm" | "default" | "lg";
  /** Classes for the time field; `className` goes to the row around both. */
  timeClassName?: string;
}) {
  // The halves are kept apart, since a day without a time (or the other way round) is not a value yet.
  const [parts, setParts] = React.useState(() => split(valueProp ?? defaultValue));
  // A controlled value that changed from outside replaces the halves; one this field reported is already in them.
  const [seen, setSeen] = React.useState(valueProp);
  if (valueProp !== undefined && valueProp !== seen) {
    setSeen(valueProp);
    if (valueProp !== join(parts)) setParts(split(valueProp));
  }

  const timeRef = React.useRef<HTMLInputElement>(null);
  useFormReset(timeRef, () => {
    if (valueProp === undefined) setParts(split(defaultValue));
  });

  const change = (next: Parts) => {
    const before = join(parts);
    const after = join(next);
    setParts(next);
    if (valueProp !== undefined) setSeen(after);
    if (after !== before) onValueChange?.(after);
  };

  const low = split(min);
  const high = split(max);
  return (
    <div data-slot="date-time-picker" className={cn("flex min-w-0 items-center gap-2", className)}>
      <DatePicker
        locale={locale}
        value={parts.date || null}
        // A cleared day (`clearable`) empties the whole field, time included.
        onValueChange={(date) =>
          change(date ? { date, time: parts.time || defaultTime || "" } : { date: "", time: "" })
        }
        min={low.date || undefined}
        max={high.date || undefined}
        disabled={disabled}
        form={form}
        size={size}
        className="w-auto min-w-0 flex-1"
        {...props}
      />
      <TimePicker
        ref={timeRef}
        locale={locale}
        aria-label={timeLabel}
        listLabel={timeListLabel ?? timeLabel}
        value={parts.time}
        onValueChange={(time) => change({ ...parts, time })}
        min={parts.date && parts.date === low.date ? low.time : undefined}
        max={parts.date && parts.date === high.date ? high.time : undefined}
        step={step}
        disabled={disabled}
        form={form}
        size={size}
        className={cn("shrink-0", timeClassName)}
      />
      {name !== undefined && !disabled && <input type="hidden" name={name} value={join(parts)} form={form} />}
    </div>
  );
}

export { DateTimePicker };
