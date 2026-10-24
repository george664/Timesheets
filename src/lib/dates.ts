import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";

export const DATE_INPUT_FORMAT = "yyyy-MM-dd";

export const toDateInput = (date: Date) => format(date, DATE_INPUT_FORMAT);

/** The range shown before the user picks anything: the last 7 days. */
export function defaultRange(now = new Date()) {
  return { start: toDateInput(subDays(now, 7)), end: toDateInput(now) };
}

/** Start and end of the chosen days, as ISO timestamps for the Calendar API. */
export function rangeToTimestamps(start: string, end: string) {
  return {
    timeMin: startOfDay(parseISO(start)).toISOString(),
    timeMax: endOfDay(parseISO(end)).toISOString(),
  };
}

/** The last few years, ending with the current one. */
export function selectableYears(now = new Date(), count = 3): number[] {
  const current = now.getFullYear();
  return Array.from({ length: count }, (_, i) => current - (count - 1 - i));
}

/**
 * The smallest range covering every selected year and month. Selecting
 * non-adjacent months gives a range that includes the gaps; the dashboard
 * hides those events again with its year/month filters.
 */
export function rangeForSelection(
  years: ReadonlySet<number>,
  months: ReadonlySet<number>,
  now = new Date(),
): { start: string; end: string } | null {
  if (years.size === 0 && months.size === 0) return null;

  const sortedYears = years.size > 0 ? [...years].sort((a, b) => a - b) : [now.getFullYear()];
  const firstYear = sortedYears[0];
  const lastYear = sortedYears[sortedYears.length - 1];

  if (months.size === 0) {
    return { start: `${firstYear}-01-01`, end: `${lastYear}-12-31` };
  }

  const sortedMonths = [...months].sort((a, b) => a - b);
  const firstMonth = sortedMonths[0];
  const lastMonth = sortedMonths[sortedMonths.length - 1];
  return {
    start: toDateInput(new Date(firstYear, firstMonth, 1)),
    end: toDateInput(endOfMonth(new Date(lastYear, lastMonth, 1))),
  };
}

export interface MonthRef {
  year: number;
  month: number;
}

/** The current month and the two before it, oldest first. */
export function recentMonths(now = new Date(), count = 3): MonthRef[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
}

/** Weeks (arrays of seven days) covering a month, including days of adjacent months. */
export function weeksOfMonth({ year, month }: MonthRef, weekStartsOn: 0 | 1): Date[][] {
  const first = startOfMonth(new Date(year, month, 1));
  const days = eachDayOfInterval({
    start: startOfWeek(first, { weekStartsOn }),
    end: endOfWeek(endOfMonth(first), { weekStartsOn }),
  });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

/** The range spanning the selected weeks, given each week's first day as `yyyy-MM-dd`. */
export function rangeForWeeks(weekStarts: ReadonlySet<string>): { start: string; end: string } | null {
  if (weekStarts.size === 0) return null;
  const sorted = [...weekStarts].sort();
  const last = parseISO(sorted[sorted.length - 1]);
  return { start: sorted[0], end: toDateInput(addDays(last, 6)) };
}
