"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { useFormReset } from "@/components/ui/use-form-reset";

/** A day and a time of day, as the two halves of "2026-11-10T09:30". */
type Parts = { date: string; time: string };

/** Omit over each member of a union, so the date picker's "both month names or neither" survives. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

const split = (value: string | null | undefined): Parts => {
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return match ? { date: match[1]!, time: match[2]! } : { date: "", time: "" };
};
const join = ({ date, time }: Parts) => (date && time ? `${date}T${time}` : "");

/**
 * A date and a time of day in one field: a DatePicker for the day and the browser's own time input beside it. The
 * value is local text, "2026-11-10T09:30", exactly what <input type="datetime-local"> submits, so a server that took
 * that field takes this one, and a time zone is the page's to state (in a hint beside the field) and to apply.
 * The value is empty until both halves are set, and empties again when either is cleared. `defaultTime` fills the
 * time when a day is chosen first, such as "09:00".
 * `min` and `max` are moments in the same form: the calendar stops at their days, and the time input at their times
 * on those days, so the browser's own validation reports a time out of range.
 * With a `name` the value submits as one hidden form field. A reset of the form puts an uncontrolled field back on its
 * default, unless the page cancels the reset; a controlled one follows its value prop.
 * The words are the page's: the date picker's (`placeholder`, `calendarLabel`, the month buttons) and `timeLabel`,
 * the time input's name. The other props, `id` and the aria ones included, go to the date button, so a Label names it.
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
  /** The time input's step in seconds: 60 by default, 900 for quarter hours. */
  step?: number;
  /** The field the value submits as. */
  name?: string;
  size?: "sm" | "default" | "lg";
  /** Classes for the time input; `className` goes to the row around both. */
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
        onValueChange={(date) => change({ date, time: parts.time || defaultTime || "" })}
        min={low.date || undefined}
        max={high.date || undefined}
        disabled={disabled}
        form={form}
        size={size}
        className="w-auto min-w-0 flex-1"
        {...props}
      />
      <Input
        ref={timeRef}
        type="time"
        aria-label={timeLabel}
        value={parts.time}
        onChange={(event) => change({ ...parts, time: event.target.value })}
        min={parts.date && parts.date === low.date ? low.time : undefined}
        max={parts.date && parts.date === high.date ? high.time : undefined}
        step={step}
        disabled={disabled}
        form={form}
        size={size}
        className={cn("w-auto shrink-0 tabular-nums", timeClassName)}
      />
      {name !== undefined && !disabled && <input type="hidden" name={name} value={join(parts)} form={form} />}
    </div>
  );
}

export { DateTimePicker };
