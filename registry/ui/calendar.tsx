"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  addDays,
  addMonths,
  clampDate,
  type DateRange,
  FIRST_DATE,
  LAST_DATE,
  localISODate,
  monthGrid,
  monthOf,
  orderRange,
  parseISODate,
} from "@/components/ui/calendar-date";
import { NativeSelect } from "@/components/ui/native-select";

/**
 * The names of the two lists that jump to a month and to a year, such as "Month" and "Year". Given both, the caption
 * becomes those lists; given neither, it stays the month's name.
 */
type CalendarJumpProps = { monthLabel: string; yearLabel: string } | { monthLabel?: undefined; yearLabel?: undefined };

type CalendarSingleProps = {
  /** One day, the default. */
  mode?: "single";
  /** The chosen day, as "2026-11-10". */
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type CalendarRangeProps = {
  /** A span of days: the first choice is its start, the second its end, a third starts over. */
  mode: "range";
  /** The chosen days, as { from: "2026-11-10", to: "2026-11-18" }; `to` is null while only one end is chosen. */
  value?: DateRange | null;
  defaultValue?: DateRange;
  /** Called on every choice: with `to: null` after the first day, and with both ends, in order, after the second. */
  onValueChange?: (value: DateRange) => void;
};

type CalendarProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** A BCP 47 tag, such as "en-GB" or "zh-CN": month and weekday names, digits and the spoken dates follow it. */
  locale: string;
  /** The month on show, as "2026-11". */
  month?: string;
  defaultMonth?: string;
  onMonthChange?: (month: string) => void;
  /** The day to mark as today. Pass it when rendering on a server; without it the browser's clock decides after mount. */
  today?: string;
  /** The first and last day that can be chosen. */
  min?: string;
  max?: string;
  /** Days that cannot be chosen, such as weekends or days already booked. */
  isDateDisabled?: (date: string) => boolean;
  /** 0 for Sunday to 6 for Saturday. Monday unless given, as in ISO 8601. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** The accessible names of the two month buttons, such as "Previous month" and "Next month". */
  previousLabel: string;
  nextLabel: string;
} & CalendarJumpProps &
  (CalendarSingleProps | CalendarRangeProps);

const subscribeToNothing = () => () => {};
const browserToday = () => localISODate();
const serverToday = () => undefined;

const dateOf = (target: EventTarget) => (target as HTMLElement).closest<HTMLElement>("[data-date]")?.dataset.date;
/** "2026-11" from a year and a month from 1 to 12. */
const monthText = (year: number, month: number) => `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;

// The band behind a range sits on the cells, so it runs unbroken through the days of the neighbouring months too.
const BAND = "data-range:bg-highlight-muted data-[range=end]:rounded-e-control data-[range=start]:rounded-s-control";

/**
 * One month as a grid of days, for choosing a day or, with `mode="range"`, a span of days. It is drawn here rather
 * than by a date library: the grid, the names and the spoken dates come from Intl with the `locale` the page passes,
 * so nothing is bundled per language, and the whole keyboard is the grid pattern below.
 * Days are text ("2026-11-10"), not Date objects, so a day is the same day on the server and in every time zone, and
 * goes into a form as it is (see calendar-date.ts).
 * Keyboard: the grid is one tab stop. Arrow keys move by a day or a week, Home and End go to the ends of the week,
 * Page Up and Page Down change the month and with Shift the year, and Enter or Space chooses. Moving past an edge
 * turns the page. Nothing steps past `min` and `max`, or past years 1 and 9999 without them: the keyboard stops on
 * the first or last day, the month button that would leave is disabled, and the grid's tab stop is a day in reach. Each day is a button named by its full date; today carries aria-current="date" and the chosen day
 * aria-selected; the month name is a live region, so changing month with the buttons is announced.
 * The chosen day is the highlighter, today is bold with a dot under it. Every month shows six weeks, so the height
 * never changes from one month to the next.
 * A range takes and returns { from, to }. The first day chosen is one end, and until the second is chosen the days up
 * to the one under the pointer, or under the keyboard focus, show as the range to come; the second choice closes the
 * range, in order whichever end came first, and the same day twice is a range of one day. The grid is then
 * aria-multiselectable and every day of the range is aria-selected; the two ends are the highlighter and the days
 * between them its pale band. `min`, `max` and `isDateDisabled` say which days can be an end: a range may still run
 * across a day that cannot be chosen, so check the days inside it where that matters, as for bookings.
 * With `monthLabel` and `yearLabel` the caption is two lists that jump to any month and year, for a date far from
 * today; the names are the page's. The years run from `min` to `max`, and ten either side of the year on show where
 * one of them is missing.
 * A server cannot know the reader's today: pass `today` (or a value, or a month) when rendering there, and the same
 * markup hydrates.
 */
function Calendar({
  locale,
  mode = "single",
  value: valueProp,
  defaultValue,
  onValueChange,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  today: todayProp,
  min,
  max,
  isDateDisabled,
  weekStartsOn = 1,
  previousLabel,
  nextLabel,
  monthLabel,
  yearLabel,
  className,
  ...props
}: CalendarProps) {
  const [innerValue, setInnerValue] = React.useState<string | DateRange | null>(defaultValue ?? null);
  const value = valueProp === undefined ? innerValue : valueProp;
  // One shape for both modes: a single day is a range of one.
  const picked: DateRange | null = typeof value === "string" ? { from: value, to: value } : value;
  // The browser's today, read after hydration: the server's render has none, so the two never disagree.
  const clientToday = React.useSyncExternalStore(subscribeToNothing, browserToday, serverToday);
  const today = todayProp ?? clientToday;

  const [innerMonth, setInnerMonth] = React.useState(
    () => defaultMonth ?? monthOf(picked?.from ?? todayProp ?? localISODate()),
  );
  const month = monthProp ?? innerMonth;
  const showMonth = (next: string) => {
    if (next === month) return;
    if (monthProp === undefined) setInnerMonth(next);
    onMonthChange?.(next);
  };

  const days = monthGrid(month, weekStartsOn);
  const disabledDay = (date: string) =>
    (min !== undefined && date < min) || (max !== undefined && date > max) || isDateDisabled?.(date) === true;
  // Where the month buttons and the keyboard stop: at min and max, and at the first and last day four digits can
  // write where one of them is missing or lies beyond.
  const firstDay = min !== undefined && min > FIRST_DATE ? min : FIRST_DATE;
  const lastDay = max !== undefined && max < LAST_DATE ? max : LAST_DATE;

  // A range with one end chosen: the day under the pointer or the focus is where it would end.
  const pending = mode === "range" && picked !== null && picked.to === null;
  const [preview, setPreview] = React.useState<string | null>(null);
  const previewing = pending && preview !== null && preview !== picked.from;
  const band = !picked
    ? null
    : picked.to !== null
      ? orderRange(picked.from, picked.to)
      : orderRange(picked.from, previewing ? preview : picked.from);
  const position = (date: string) =>
    !band || date < band.from || date > band.to
      ? undefined
      : band.from === band.to
        ? undefined
        : date === band.from
          ? "start"
          : date === band.to
            ? "end"
            : "middle";
  const previewOn = (target: EventTarget) => {
    const date = pending ? dateOf(target) : undefined;
    if (date) setPreview(disabledDay(date) ? null : date);
  };

  const choose = (date: string) => {
    setPreview(null);
    // The first end is checked again: a limit that moved since it was chosen (fresh availability, a new `max`) may
    // have ruled it out, and the choice then starts a new range instead of closing one on a day that cannot be an end.
    const closes = pending && !disabledDay(picked.from);
    const next = mode !== "range" ? date : closes ? orderRange(picked.from, date) : { from: date, to: null };
    if (valueProp === undefined) setInnerValue(next);
    // The two modes' callbacks differ only in what they are handed, and `mode` says which this one is.
    (onValueChange as ((value: string | DateRange) => void) | undefined)?.(next);
  };

  // The grid's one tab stop: where the keyboard last was, else the chosen day, else today, else the 1st.
  const [focusDay, setFocusDay] = React.useState<string>();
  const inMonth = (date: string | null | undefined): date is string => !!date && monthOf(date) === month;
  // A day outside min and max is passed over, so the focus a popover or the Tab key hands the grid lands on a day the
  // keyboard could have reached; only a month with no such day keeps one of them.
  const stops = [focusDay, picked?.from, picked?.to, today, clampDate(`${month}-01`, firstDay, lastDay)].filter(
    inMonth,
  );
  const tabStop = stops.find((date) => date >= firstDay && date <= lastDay) ?? stops[0] ?? `${month}-01`;
  const grid = React.useRef<HTMLTableElement>(null);
  const moveFocus = React.useRef(false);
  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLElement>(`[data-date="${tabStop}"]`)?.focus();
  });

  const focusOn = (date: string) => {
    const next = clampDate(date, firstDay, lastDay);
    moveFocus.current = true;
    setFocusDay(next);
    showMonth(monthOf(next));
  };

  const format = React.useMemo(() => {
    const options = (extra: Intl.DateTimeFormatOptions) =>
      // The grid is Gregorian, so the words are too: a locale whose own calendar differs (fa-IR, th-TH) would otherwise
      // caption and announce another date than the day number in the cell.
      new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...extra, calendar: "gregory" });
    return {
      caption: options({ month: "long", year: "numeric" }),
      month: options({ month: "long" }),
      year: options({ year: "numeric" }),
      weekdayShort: options({ weekday: "short" }),
      weekdayLong: options({ weekday: "long" }),
      full: options({ dateStyle: "full" }),
      day: new Intl.NumberFormat(locale, { useGrouping: false }),
    };
  }, [locale]);

  const captionId = React.useId();
  const first = parseISODate(`${month}-01`)!;
  const previousMonth = monthOf(addMonths(`${month}-01`, -1));
  const nextMonth = monthOf(addMonths(`${month}-01`, 1));

  // The two lists of the caption. A month outside min and max is listed but cannot be chosen, and a year that would
  // land outside them stops at the nearest month inside. The years stay within 1 to 9999, the four digits a month is
  // written with.
  const jump = monthLabel !== undefined && yearLabel !== undefined;
  const year = first.getUTCFullYear();
  const firstMonth = min === undefined ? undefined : monthOf(min);
  const lastMonth = max === undefined ? undefined : monthOf(max);
  // The month buttons stop at the months of the first and last day, where a further step has nowhere to go.
  const atFirstMonth = previousMonth === month || previousMonth < monthOf(firstDay);
  const atLastMonth = nextMonth === month || nextMonth > monthOf(lastDay);
  const firstYear = Math.min(year, firstMonth === undefined ? Math.max(year - 10, 1) : Number(firstMonth.slice(0, 4)));
  const lastYear = Math.max(year, lastMonth === undefined ? Math.min(year + 10, 9999) : Number(lastMonth.slice(0, 4)));
  const outside = (candidate: string) =>
    (firstMonth !== undefined && candidate < firstMonth) || (lastMonth !== undefined && candidate > lastMonth);

  return (
    <div data-slot="calendar" className={cn("inline-grid w-fit gap-2", className)} {...props}>
      <div className="flex items-center justify-between gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          data-slot="calendar-previous"
          aria-label={previousLabel}
          disabled={atFirstMonth}
          onClick={() => showMonth(previousMonth)}
        >
          <ChevronLeftIcon className="rtl:rotate-180" />
        </Button>
        {/* With the lists on show the month's name is still here, for the grid's name and for the announcement. */}
        <div
          id={captionId}
          data-slot="calendar-caption"
          aria-live="polite"
          className={jump ? "sr-only" : "text-base font-medium"}
        >
          {format.caption.format(first)}
        </div>
        {jump && (
          // The lists take the width the grid leaves them (w-0 and grow), so a long month name never widens the calendar.
          <div className="flex min-w-0 flex-1 gap-1">
            <NativeSelect
              size="sm"
              data-slot="calendar-month"
              aria-label={monthLabel}
              className="w-0 flex-1 font-medium"
              value={month.slice(5)}
              onChange={(event) => showMonth(`${month.slice(0, 4)}-${event.target.value}`)}
            >
              {Array.from({ length: 12 }, (_, index) => {
                const candidate = monthText(year, index + 1);
                return (
                  <option key={candidate} value={candidate.slice(5)} disabled={outside(candidate)}>
                    {format.month.format(parseISODate(`${candidate}-01`))}
                  </option>
                );
              })}
            </NativeSelect>
            <NativeSelect
              size="sm"
              data-slot="calendar-year"
              aria-label={yearLabel}
              className="w-auto shrink-0 font-medium"
              value={month.slice(0, 4)}
              onChange={(event) =>
                showMonth(monthOf(clampDate(`${event.target.value}-${month.slice(5)}-01`, min, max)))
              }
            >
              {Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
                const candidate = monthText(firstYear + index, 1);
                return (
                  <option key={candidate} value={candidate.slice(0, 4)}>
                    {format.year.format(parseISODate(`${candidate}-01`))}
                  </option>
                );
              })}
            </NativeSelect>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          data-slot="calendar-next"
          aria-label={nextLabel}
          disabled={atLastMonth}
          onClick={() => showMonth(nextMonth)}
        >
          <ChevronRightIcon className="rtl:rotate-180" />
        </Button>
      </div>
      <table
        ref={grid}
        role="grid"
        data-slot="calendar-grid"
        aria-labelledby={captionId}
        aria-multiselectable={mode === "range" || undefined}
        className="border-separate border-spacing-0"
        onMouseOver={(event) => previewOn(event.target)}
        onMouseLeave={() => setPreview(null)}
        onFocus={(event) => previewOn(event.target)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPreview(null);
        }}
        onKeyDown={(event) => {
          const from = dateOf(event.target);
          if (!from || event.altKey || event.ctrlKey || event.metaKey) return;
          // Left and Right follow the reading direction.
          const forward = getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
          const column = days.indexOf(from) % 7;
          const moves: Record<string, () => string> = {
            ArrowLeft: () => addDays(from, -forward),
            ArrowRight: () => addDays(from, forward),
            ArrowUp: () => addDays(from, -7),
            ArrowDown: () => addDays(from, 7),
            Home: () => addDays(from, -column),
            End: () => addDays(from, 6 - column),
            PageUp: () => addMonths(from, event.shiftKey ? -12 : -1),
            PageDown: () => addMonths(from, event.shiftKey ? 12 : 1),
          };
          const move = moves[event.key];
          if (!move) return;
          event.preventDefault();
          focusOn(move());
        }}
      >
        <thead>
          <tr>
            {days.slice(0, 7).map((date) => {
              const day = parseISODate(date)!;
              return (
                <th
                  key={date}
                  scope="col"
                  abbr={format.weekdayLong.format(day)}
                  className="size-9 p-0 text-xs font-normal text-muted-foreground"
                >
                  <span aria-hidden="true">{format.weekdayShort.format(day)}</span>
                  <span className="sr-only">{format.weekdayLong.format(day)}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>
              {days.slice(week * 7, week * 7 + 7).map((date) => {
                const day = parseISODate(date);
                // Past the last day a year of four digits can write there is no day to show: the cell stays empty.
                if (!day) return <td key={date} role="gridcell" className="size-9 p-0" />;
                const number = format.day.format(day.getUTCDate());
                const place = position(date);
                // A day of the month before or after fills the row, but belongs to that month's page.
                if (!inMonth(date)) {
                  return (
                    <td
                      key={date}
                      role="gridcell"
                      data-range={place}
                      className={cn("size-9 p-0 text-center text-muted-foreground/40", BAND)}
                    >
                      <span aria-hidden="true">{number}</span>
                    </td>
                  );
                }
                // The ends of a range, or the one chosen day: the days between are selected too, but drawn as the band.
                const end = picked !== null && (date === picked.from || date === picked.to);
                const selected = end || (!previewing && place !== undefined);
                const disabled = disabledDay(date);
                return (
                  <td
                    key={date}
                    role="gridcell"
                    aria-selected={selected}
                    data-range={place}
                    className={cn("p-0", BAND)}
                  >
                    <button
                      type="button"
                      data-slot="calendar-day"
                      data-date={date}
                      data-selected={end || undefined}
                      data-range={place}
                      data-preview={(previewing && !end && place !== undefined) || undefined}
                      data-today={date === today || undefined}
                      tabIndex={date === tabStop ? 0 : -1}
                      aria-label={format.full.format(day)}
                      aria-current={date === today ? "date" : undefined}
                      // Not the disabled attribute: the day stays reachable by the arrow keys, and is announced as unavailable.
                      aria-disabled={disabled || undefined}
                      className="relative grid size-9 place-items-center rounded-control text-base text-foreground transition-colors duration-150 after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-current after:opacity-0 hover:bg-control focus-visible:z-1 focus-visible:outline-offset-0 aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground/60 aria-disabled:line-through aria-disabled:hover:bg-transparent data-selected:bg-highlight data-selected:font-semibold data-selected:text-highlight-foreground data-selected:hover:bg-highlight data-today:font-semibold data-today:after:opacity-100 data-[range=end]:rounded-s-none data-[range=middle]:rounded-none data-[range=start]:rounded-e-none"
                      onClick={() => {
                        setFocusDay(date);
                        if (!disabled) choose(date);
                      }}
                    >
                      {number}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { Calendar, type CalendarJumpProps };
