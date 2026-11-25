"use client";

import * as React from "react";
import { CheckIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFormReset } from "@/components/ui/use-form-reset";

const DAY = 24 * 60 * 60;

// A time of day as the time input writes it ("09:30", "09:30:45", "09:30:45.250"), in seconds since midnight.
const secondsOf = (time: string | null | undefined): number | null => {
  const match = time?.match(/^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/);
  if (!match) return null;
  const [hours, minutes, seconds] = [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return hours * 3600 + minutes * 60 + seconds + Number(`0.${match[4] ?? 0}`);
};

// Seconds since midnight as the time input writes them: seconds when asked or when they are not zero, and
// milliseconds when there are any.
const textOf = (total: number, withSeconds: boolean) => {
  const millis = Math.round(total * 1000);
  const whole = Math.floor(millis / 1000);
  const fraction = millis % 1000;
  const pad = (n: number, width = 2) => String(n).padStart(width, "0");
  const hhmm = `${pad(Math.floor(whole / 3600))}:${pad(Math.floor(whole / 60) % 60)}`;
  if (fraction) return `${hhmm}:${pad(whole % 60)}.${pad(fraction, 3)}`;
  return withSeconds || whole % 60 ? `${hhmm}:${pad(whole % 60)}` : hhmm;
};

// The gap between the times in the list: a quarter of an hour (or the page's `listStep`, at least a minute) unless the
// step is longer, rounded up to a whole number of steps so every time in the list is one the field accepts. A time
// between them is typed.
const listGap = (step: number, wanted = 900) => {
  // A step or gap that is not a positive number (NaN from an unset setting, Infinity) falls back to the defaults.
  const unit = Number.isFinite(step) && step > 0 ? step : 60;
  const target = Number.isFinite(wanted) ? Math.max(wanted, 60) : 900;
  if (unit >= target) return unit;
  return Math.round(unit * Math.ceil(target / unit - 1e-9) * 1000) / 1000;
};

// Each time in the list, as the field holds it and in seconds since midnight.
type TimeOption = { text: string; seconds: number };

// Places a time among the options in order, unless it is one of them already.
const placeTime = (options: TimeOption[], text: string, seconds: number) => {
  if (options.some((option) => Math.abs(option.seconds - seconds) < 0.0005)) return;
  const at = options.findIndex((option) => option.seconds > seconds);
  options.splice(at === -1 ? options.length : at, 0, { text, seconds });
};

// The open list's options, with the field's own time placed among them when it falls between two. They count from
// `base`: midnight, or `min` when the native input measures its step from a `min` off the clock's grid, so each one
// is a time it accepts.
const timeOptions = (gap: number, base: number, withSeconds: boolean, current: string) => {
  const options: TimeOption[] = [];
  const first = Math.round((base % gap) * 1000) / 1000;
  for (let index = 0; ; index += 1) {
    const seconds = Math.round((first + index * gap) * 1000) / 1000;
    // Checked after rounding, so a fractional step never offers 24:00, which the input would read as no time.
    if (!(seconds < DAY)) break;
    options.push({ text: textOf(seconds, withSeconds), seconds });
  }
  const chosen = secondsOf(current);
  if (chosen !== null) placeTime(options, current, chosen);
  return options;
};

const TIME_PICKER_SIZES = { sm: "px-2 text-sm", default: "px-3", lg: "px-3.5" };

/*
 * Chrome and Edge give a time input a clock button of their own, which opens the system's picker (system blue on
 * system gray, whatever the theme), and color the segment being typed in system blue too. The button goes, since
 * the theme's list replaces it, and the segment takes the highlighter, as a chosen day does in Calendar.
 */
// Written out in full, since Tailwind finds classes by reading the source and would miss one put together here.
const NATIVE_TIME_PARTS = [
  "[&::-webkit-calendar-picker-indicator]:hidden",
  "[&::-webkit-datetime-edit-hour-field:focus]:bg-highlight",
  "[&::-webkit-datetime-edit-hour-field:focus]:text-highlight-foreground",
  "[&::-webkit-datetime-edit-minute-field:focus]:bg-highlight",
  "[&::-webkit-datetime-edit-minute-field:focus]:text-highlight-foreground",
  "[&::-webkit-datetime-edit-second-field:focus]:bg-highlight",
  "[&::-webkit-datetime-edit-second-field:focus]:text-highlight-foreground",
  "[&::-webkit-datetime-edit-millisecond-field:focus]:bg-highlight",
  "[&::-webkit-datetime-edit-millisecond-field:focus]:text-highlight-foreground",
  "[&::-webkit-datetime-edit-ampm-field:focus]:bg-highlight",
  "[&::-webkit-datetime-edit-ampm-field:focus]:text-highlight-foreground",
].join(" ");

/**
 * A time of day: the browser's own time input, to type into segment by segment, with a clock button that opens a
 * list of times in the theme's popover in place of the browser's picker. The value is the input's ("09:30", or
 * "09:30:45" with a `step` under a minute), so with a `name` it submits as a native time field does and the browser's
 * validation still reports a time outside `min` and `max`. The list holds a time every quarter of an hour (every
 * `step` when that is longer, or every `listStep`), written the way the `locale` writes times, with the field's own
 * time among them when it falls between two; times outside `min` and `max` are dimmed and cannot be chosen.
 * The list opens at the chosen time, or at the next time on the clock while the field is empty. Arrow keys, Home, End
 * and Page Up / Down move in it, Enter chooses, and Escape or Tab closes it; focus then returns to the input. From the
 * input, Alt+Arrow Down opens it, as it opens a native picker. The clock button stays out of the tab order: a keyboard
 * types the time or uses that key.
 * A reset of the form puts an uncontrolled field back on its default, unless the page cancels the reset; a
 * controlled one follows its value prop.
 * The words are the page's: `listLabel` names the list and the clock button ("Choose a time"). Name the input itself
 * with a Label (`id` and htmlFor) or aria-label: the other props, `id`, `name`, `required` and the aria ones, go to it.
 * `className` goes to the box around the input and the button.
 */
function TimePicker({
  locale,
  value: valueProp,
  defaultValue,
  onValueChange,
  min,
  max,
  step,
  listStep,
  listLabel,
  size = "default",
  disabled,
  readOnly,
  open: openProp,
  onOpenChange,
  className,
  inputClassName,
  onKeyDown,
  ref,
  ...props
}: Omit<
  React.ComponentProps<"input">,
  "type" | "size" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "children"
> & {
  /** The locale that writes the times in the list; the browser's own input writes the field's. */
  locale?: string;
  /** The time, as "09:30", or empty. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The first and last time that can be chosen, as "08:00". */
  min?: string;
  max?: string;
  /** The input's step in seconds: 60 by default, 900 for quarter hours, under 60 for seconds. */
  step?: number;
  /**
   * The gap between the times in the list, in seconds and at least a minute; a quarter of an hour unless `step` is
   * longer. It is rounded up to a whole number of steps.
   */
  listStep?: number;
  /** The accessible name of the list and of the clock button that opens it, such as "Choose a time". */
  listLabel: string;
  size?: "sm" | "default" | "lg";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Classes for the input; `className` goes to the box around it. */
  inputClassName?: string;
}) {
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? "");
  const value = valueProp ?? innerValue;
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  useFormReset(inputRef, () => {
    if (valueProp === undefined) setInnerValue(defaultValue ?? "");
  });
  const change = (next: string) => {
    if (valueProp === undefined) setInnerValue(next);
    if (next !== value) onValueChange?.(next);
  };

  const withSeconds = step !== undefined && step < 60;
  const gap = listGap(step ?? 60, listStep);
  const low = secondsOf(min);
  const high = secondsOf(max);
  // The list keeps to the clock (09:00, 09:15) while `min` sits on the step, as any whole minute does with the
  // default step, and counts from `min` only when the native input would refuse the clock's times.
  const unit = step !== undefined && Number.isFinite(step) && step > 0 ? step : 60;
  const offStep = low !== null && Math.min(low % unit, unit - (low % unit)) > 0.0005;
  const base = offStep ? low : 0;
  // A `min` later than `max` is a range across midnight, as the native input reads it (22:00 to 06:00).
  const outOfRange = ({ seconds }: TimeOption) =>
    low !== null && high !== null && low > high
      ? seconds > high && seconds < low
      : (low !== null && seconds < low) || (high !== null && seconds > high);
  const options = React.useMemo(() => {
    const list = timeOptions(gap, base, withSeconds, value);
    // A range narrower than the list's gap, such as 23:50 to midnight, still offers its first time.
    if (low !== null && list.every(outOfRange)) placeTime(list, textOf(low, withSeconds), low);
    return list;
    // `outOfRange` reads only `low` and `high`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gap, base, withSeconds, value, low, high]);
  const labels = React.useMemo(() => {
    // A 24-hour clock writes the hour in two digits, as the time input does ("09:30"); a 12-hour one does not ("9:30 AM").
    const cycle = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
    const hour = cycle === "h11" || cycle === "h12" ? "numeric" : "2-digit";
    const base: Intl.DateTimeFormatOptions = { hour, minute: "2-digit", timeZone: "UTC" };
    const minutes = new Intl.DateTimeFormat(locale, base);
    const seconds = new Intl.DateTimeFormat(locale, { ...base, second: "2-digit" });
    const fractions = new Intl.DateTimeFormat(locale, { ...base, second: "2-digit", fractionalSecondDigits: 3 });
    // The day is 1 January 1970 in UTC, so the date's own clock reads the time of day.
    return (option: TimeOption) => {
      const date = new Date(Math.round(option.seconds * 1000));
      // Whole minutes read as minutes even when the field carries seconds: "00:15", not "00:15:00".
      if (option.seconds % 1) return fractions.format(date);
      return (option.seconds % 60 ? seconds : minutes).format(date);
    };
  }, [locale]);

  const listId = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [innerOpen, setInnerOpen] = React.useState(false);
  // A read-only field shows its time but takes none from the list, as a read-only native input takes no typing.
  const locked = Boolean(disabled || readOnly);
  const open = (openProp ?? innerOpen) && !locked;
  // Whether the list closed because the pointer went elsewhere: focus then stays where the pointer put it.
  const leftOutside = React.useRef(false);

  const enabled = (index: number) => index >= 0 && index < options.length && !outOfRange(options[index]!);
  /** The option the list opens at: the chosen time, else the next one on the clock, else the first that can be chosen. */
  const startIndex = () => {
    const chosen = secondsOf(value);
    const selected = chosen === null ? -1 : options.findIndex((option) => Math.abs(option.seconds - chosen) < 0.0005);
    if (selected !== -1) return selected;
    const now = new Date();
    const clock = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const next = options.findIndex((option, index) => option.seconds >= clock && enabled(index));
    if (next !== -1) return next;
    return Math.max(
      options.findIndex((_, index) => enabled(index)),
      0,
    );
  };
  // The list starts at the chosen time each time it opens, whether the clock button, a key or the page's `open` opened it.
  const [wasOpen, setWasOpen] = React.useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setActive(startIndex());
  }
  const setOpen = (next: boolean) => {
    if (next && locked) return;
    if (next) leftOutside.current = false;
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };
  const choose = (index: number) => {
    if (locked || !enabled(index)) return;
    change(options[index]!.text);
    setOpen(false);
  };
  /**
   * The option `by` places from `from`, or the next one that can be chosen beyond it; past the last one that can be
   * chosen in that direction, that last one, so Page Up and Page Down stop at the edge of the range.
   */
  const moveFrom = (from: number, by: number) => {
    const direction = Math.sign(by) || 1;
    const last = options.length - 1;
    const start = Math.min(Math.max(from + by, 0), last);
    for (let target = start; target >= 0 && target <= last; target += direction) if (enabled(target)) return target;
    for (let target = start - direction; target >= 0 && target <= last; target -= direction) {
      if (enabled(target)) return target;
    }
    // Nothing can be chosen: stay on a row of the list.
    return Math.min(Math.max(from, 0), last);
  };

  // The active option stays in sight as the keys move it.
  React.useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView?.({ block: "nearest" });
  }, [open, active, listId]);

  const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, () => number> = {
      ArrowDown: () => moveFrom(active, 1),
      ArrowUp: () => moveFrom(active, -1),
      PageDown: () => moveFrom(active, 8),
      PageUp: () => moveFrom(active, -8),
      Home: () => moveFrom(-1, 1),
      End: () => moveFrom(options.length, -1),
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      setActive(move());
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(active);
    } else if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <InputGroup
          data-slot="time-picker"
          size={size}
          className={cn("w-auto min-w-0", disabled && "opacity-50", className)}
        >
          <InputGroupInput
            ref={inputRef}
            type="time"
            value={value}
            onChange={(event) => change(event.target.value)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            aria-keyshortcuts="Alt+ArrowDown"
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (event.defaultPrevented) return;
              const opens =
                (event.altKey && (event.key === "ArrowDown" || event.key === "ArrowUp")) || event.key === "F4";
              if (opens && !locked) {
                // The browser's own picker would open on these keys: the theme's list opens instead.
                event.preventDefault();
                setOpen(true);
              }
            }}
            className={cn(
              "w-auto tabular-nums disabled:opacity-100",
              TIME_PICKER_SIZES[size],
              "pr-0",
              NATIVE_TIME_PARTS,
              inputClassName,
            )}
            {...props}
          />
          <PopoverTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              aria-label={listLabel}
              disabled={locked}
              data-slot="time-picker-trigger"
              className="mx-1 inline-flex size-6 shrink-0 items-center justify-center rounded-chip text-muted-foreground transition-[color,background-color] duration-100 hover:bg-control hover:text-foreground disabled:pointer-events-none aria-expanded:bg-control aria-expanded:text-foreground in-data-[size=sm]:size-5 [&_svg]:pointer-events-none [&_svg]:size-3.5"
            >
              <ClockIcon aria-hidden="true" />
            </button>
          </PopoverTrigger>
        </InputGroup>
      </PopoverAnchor>
      <PopoverContent
        aria-label={listLabel}
        align="end"
        className="max-h-[min(16rem,var(--radix-popover-content-available-height))] w-auto min-w-(--radix-popover-trigger-width) p-1"
        onOpenAutoFocus={(event) => {
          // The list takes focus and shows the active time in the middle, not at the top of the day.
          event.preventDefault();
          listRef.current?.focus();
          document.getElementById(`${listId}-${active}`)?.scrollIntoView?.({ block: "center" });
        }}
        onInteractOutside={() => {
          leftOutside.current = true;
        }}
        onCloseAutoFocus={(event) => {
          // Back to the input after a choice, Escape or Tab, so typing goes on where it was.
          event.preventDefault();
          if (!leftOutside.current) inputRef.current?.focus();
          leftOutside.current = false;
        }}
      >
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={listLabel}
          aria-activedescendant={`${listId}-${active}`}
          tabIndex={0}
          data-slot="time-picker-list"
          onKeyDown={onListKeyDown}
          className="outline-none"
        >
          {options.map((option, index) => {
            const chosen = secondsOf(value);
            const selected = chosen !== null && Math.abs(option.seconds - chosen) < 0.0005;
            const unavailable = outOfRange(option);
            return (
              <div
                key={option.text}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={selected}
                aria-disabled={unavailable || undefined}
                data-value={option.text}
                data-active={index === active ? "" : undefined}
                data-slot="time-picker-option"
                onPointerMove={() => {
                  if (!unavailable && index !== active) setActive(index);
                }}
                onClick={() => choose(index)}
                className="relative flex min-h-7 cursor-default items-center rounded-chip py-1 pr-8 pl-2 text-sm whitespace-nowrap tabular-nums select-none data-active:bg-accent data-active:text-accent-foreground aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              >
                {labels(option)}
                {selected && <CheckIcon aria-hidden="true" className="pointer-events-none absolute right-2 size-3.5" />}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { TimePicker };
