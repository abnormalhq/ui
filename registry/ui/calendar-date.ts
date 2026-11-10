/*
 * Calendar dates as text: "2026-11-10" for a day and "2026-11" for a month, the forms <input type="date"> and
 * <input type="month"> submit. A day on a calendar is not a moment in time, so it is not a Date: a Date carries a
 * time zone, and the same one can be the 10th on the server and the 11th in the browser. Text is the same everywhere,
 * sorts and compares as text, and goes into a form or a URL as it is.
 * The arithmetic runs on UTC dates, where every day has 24 hours.
 */

const DAY = 86_400_000;

const pad = (value: number, length = 2) => String(value).padStart(length, "0");

/** The UTC midnight of an ISO day, or undefined when the text is not a real day ("2026-02-30"). */
export function parseISODate(date: string | null | undefined): Date | undefined {
  const match = date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const parsed = new Date(Date.UTC(year, month - 1, day));
  parsed.setUTCFullYear(year);
  return parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day ? parsed : undefined;
}

/** "2026-11-10" from a UTC date. */
export function formatISODate(date: Date): string {
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** The day on the wall where the code runs, such as the browser's "today". */
export function localISODate(now: Date = new Date()): string {
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDays(date: string, days: number): string {
  const parsed = parseISODate(date);
  return parsed ? formatISODate(new Date(parsed.getTime() + days * DAY)) : date;
}

/** The same day in another month, or that month's last day when it is shorter: January 31 plus one month is February 28. */
export function addMonths(date: string, months: number): string {
  const parsed = parseISODate(date);
  if (!parsed) return date;
  // setUTCFullYear, not Date.UTC: Date.UTC reads a year below 100 as 19xx.
  const first = new Date(0);
  first.setUTCFullYear(parsed.getUTCFullYear(), parsed.getUTCMonth() + months, 1);
  const end = new Date(0);
  end.setUTCFullYear(first.getUTCFullYear(), first.getUTCMonth() + 1, 0);
  first.setUTCDate(Math.min(parsed.getUTCDate(), end.getUTCDate()));
  return formatISODate(first);
}

/** "2026-11" of a day. */
export const monthOf = (date: string): string => date.slice(0, 7);

/** The 42 days a month's grid shows: six weeks from the start of the week its first day falls in. */
export function monthGrid(month: string, weekStartsOn: number): string[] {
  const first = parseISODate(`${month}-01`);
  if (!first) return [];
  const lead = (first.getUTCDay() - weekStartsOn + 7) % 7;
  const start = formatISODate(new Date(first.getTime() - lead * DAY));
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

/** A day held inside a range; either end may be open. ISO days compare as text. */
export function clampDate(date: string, min?: string, max?: string): string {
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}
