"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  addDays,
  addMonths,
  clampDate,
  localISODate,
  monthGrid,
  monthOf,
  parseISODate,
} from "@/components/ui/calendar-date";

type CalendarProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** A BCP 47 tag, such as "en-GB" or "zh-CN": month and weekday names, digits and the spoken dates follow it. */
  locale: string;
  /** The chosen day, as "2026-11-10". */
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
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
};

const subscribeToNothing = () => () => {};
const browserToday = () => localISODate();
const serverToday = () => undefined;

/**
 * One month as a grid of days, for choosing a single day. It is drawn here rather than by a date library: the grid,
 * the names and the spoken dates come from Intl with the `locale` the page passes, so nothing is bundled per
 * language, and the whole keyboard is the grid pattern below.
 * Days are text ("2026-11-10"), not Date objects, so a day is the same day on the server and in every time zone, and
 * goes into a form as it is (see calendar-date.ts).
 * Keyboard: the grid is one tab stop. Arrow keys move by a day or a week, Home and End go to the ends of the week,
 * Page Up and Page Down change the month and with Shift the year, and Enter or Space chooses. Moving past an edge
 * turns the page. Each day is a button named by its full date; today carries aria-current="date" and the chosen day
 * aria-selected; the month name is a live region, so changing month with the buttons is announced.
 * The chosen day is the highlighter, today is bold with a dot under it. Every month shows six weeks, so the height
 * never changes from one month to the next.
 * A server cannot know the reader's today: pass `today` (or a value, or a month) when rendering there, and the same
 * markup hydrates.
 */
function Calendar({
  locale,
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
  className,
  ...props
}: CalendarProps) {
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? null);
  const value = valueProp === undefined ? innerValue : valueProp;
  // The browser's today, read after hydration: the server's render has none, so the two never disagree.
  const clientToday = React.useSyncExternalStore(subscribeToNothing, browserToday, serverToday);
  const today = todayProp ?? clientToday;

  const [innerMonth, setInnerMonth] = React.useState(
    () => defaultMonth ?? monthOf(value ?? defaultValue ?? todayProp ?? localISODate()),
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

  // The grid's one tab stop: where the keyboard last was, else the chosen day, else today, else the 1st.
  const [focusDay, setFocusDay] = React.useState<string>();
  const inMonth = (date: string | null | undefined): date is string => !!date && monthOf(date) === month;
  const tabStop = [focusDay, value, today, clampDate(`${month}-01`, min, max)].find(inMonth) ?? `${month}-01`;
  const grid = React.useRef<HTMLTableElement>(null);
  const moveFocus = React.useRef(false);
  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLElement>(`[data-date="${tabStop}"]`)?.focus();
  });

  const focusOn = (date: string) => {
    const next = clampDate(date, min, max);
    moveFocus.current = true;
    setFocusDay(next);
    showMonth(monthOf(next));
  };

  const format = React.useMemo(() => {
    const options = (extra: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...extra });
    return {
      caption: options({ month: "long", year: "numeric" }),
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

  return (
    <div data-slot="calendar" className={cn("inline-grid w-fit gap-2", className)} {...props}>
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          data-slot="calendar-previous"
          aria-label={previousLabel}
          disabled={min !== undefined && previousMonth < monthOf(min)}
          onClick={() => showMonth(previousMonth)}
        >
          <ChevronLeftIcon className="rtl:rotate-180" />
        </Button>
        <div id={captionId} data-slot="calendar-caption" aria-live="polite" className="text-base font-medium">
          {format.caption.format(first)}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          data-slot="calendar-next"
          aria-label={nextLabel}
          disabled={max !== undefined && nextMonth > monthOf(max)}
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
        className="border-separate border-spacing-0"
        onKeyDown={(event) => {
          const from = (event.target as HTMLElement).closest<HTMLElement>("[data-date]")?.dataset.date;
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
                const day = parseISODate(date)!;
                const number = format.day.format(day.getUTCDate());
                // A day of the month before or after fills the row, but belongs to that month's page.
                if (!inMonth(date)) {
                  return (
                    <td key={date} role="gridcell" className="size-9 p-0 text-center text-muted-foreground/40">
                      <span aria-hidden="true">{number}</span>
                    </td>
                  );
                }
                const selected = date === value;
                const disabled = disabledDay(date);
                return (
                  <td key={date} role="gridcell" aria-selected={selected} className="p-0">
                    <button
                      type="button"
                      data-slot="calendar-day"
                      data-date={date}
                      data-selected={selected || undefined}
                      data-today={date === today || undefined}
                      tabIndex={date === tabStop ? 0 : -1}
                      aria-label={format.full.format(day)}
                      aria-current={date === today ? "date" : undefined}
                      // Not the disabled attribute: the day stays reachable by the arrow keys, and is announced as unavailable.
                      aria-disabled={disabled || undefined}
                      className="relative grid size-9 place-items-center rounded-control text-base text-foreground transition-colors duration-150 after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-current after:opacity-0 hover:bg-control focus-visible:outline-offset-0 aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground/60 aria-disabled:line-through aria-disabled:hover:bg-transparent data-selected:bg-highlight data-selected:font-semibold data-selected:text-highlight-foreground data-selected:hover:bg-highlight data-today:font-semibold data-today:after:opacity-100"
                      onClick={() => {
                        setFocusDay(date);
                        if (disabled) return;
                        if (valueProp === undefined) setInnerValue(date);
                        onValueChange?.(date);
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

export { Calendar };
