import { format, getISOWeek } from "date-fns";
import type { Locale } from "date-fns";
import type { AppSettings, TimedEvent, VisibleColumns } from "./types";
import type { TranslationKey } from "@/i18n/translations";

export interface ColumnContext {
  dateFormat: string;
  durationPrecision: number;
  locale: Locale;
}

export interface ColumnDef {
  key: keyof VisibleColumns;
  header: TranslationKey;
  value: (event: TimedEvent, ctx: ColumnContext) => string;
  /** Extra classes for the table cell. */
  cellClass?: string;
}

/** Every column the events table can show, in display order. */
export const COLUMNS: ColumnDef[] = [
  {
    key: "date",
    header: "date",
    value: (e, ctx) => format(e.startDate, ctx.dateFormat, { locale: ctx.locale }),
    cellClass: "whitespace-nowrap text-ink-3",
  },
  {
    key: "startTime",
    header: "colStartTime",
    value: (e) => (e.allDay ? "" : format(e.startDate, "HH:mm")),
    cellClass: "whitespace-nowrap text-ink-3",
  },
  {
    key: "endTime",
    header: "colEndTime",
    value: (e) => (e.allDay ? "" : format(e.endDate, "HH:mm")),
    cellClass: "whitespace-nowrap text-ink-3",
  },
  {
    key: "duration",
    header: "duration",
    value: (e, ctx) => e.hours.toFixed(ctx.durationPrecision),
    cellClass: "whitespace-nowrap text-ink-2 tabular-nums",
  },
  {
    key: "title",
    header: "colTitle",
    value: (e) => e.displayTitle,
    cellClass: "max-w-[260px] truncate font-medium text-ink",
  },
  {
    key: "description",
    header: "colDescription",
    value: (e) => e.description ?? "",
    cellClass: "max-w-[200px] truncate text-ink-3",
  },
  {
    key: "guests",
    header: "colGuests",
    value: (e) => e.guests.join(", "),
    cellClass: "max-w-[180px] truncate text-ink-3",
  },
  {
    key: "location",
    header: "colLocation",
    value: (e) => e.location ?? "",
    cellClass: "max-w-[180px] truncate text-ink-3",
  },
  {
    key: "monthNumber",
    header: "colMonthNumber",
    value: (e) => String(e.startDate.getMonth() + 1),
    cellClass: "whitespace-nowrap text-ink-3",
  },
  {
    key: "weekNumber",
    header: "colWeekNumber",
    value: (e) => String(getISOWeek(e.startDate)),
    cellClass: "whitespace-nowrap text-ink-3",
  },
];

export const columnContext = (
  settings: Pick<AppSettings, "dateFormat" | "durationPrecision">,
  locale: Locale,
): ColumnContext => ({
  dateFormat: settings.dateFormat,
  durationPrecision: settings.durationPrecision,
  locale,
});

export const visibleColumns = (visible: VisibleColumns) => COLUMNS.filter((c) => visible[c.key]);
