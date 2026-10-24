"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { WeekPicker } from "@/components/WeekPicker";
import { useSettings } from "@/hooks/useSettings";
import { selectableYears } from "@/lib/dates";
import { getMonthLabels } from "@/i18n/translations";

export interface PeriodSelection {
  years: ReadonlySet<number>;
  months: ReadonlySet<number>;
  weeks: ReadonlySet<string>;
}

interface RangePickerProps {
  start: string;
  end: string;
  selection: PeriodSelection;
  loading: boolean;
  onDatesChange: (start: string, end: string) => void;
  onFetch: () => void;
  onClear: () => void;
  onSelectionChange: (selection: PeriodSelection) => void;
}

const QUARTERS = [
  { label: "Q1", months: [0, 1, 2] },
  { label: "Q2", months: [3, 4, 5] },
  { label: "Q3", months: [6, 7, 8] },
  { label: "Q4", months: [9, 10, 11] },
];

const toggled = <T,>(set: ReadonlySet<T>, value: T): Set<T> => {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
};

const pill = (active: boolean) =>
  `rounded-lg text-xs font-medium transition-colors ${
    active ? "bg-primary text-primary-ink" : "bg-muted text-ink-2 hover:bg-muted-strong"
  }`;

export function RangePicker({
  start,
  end,
  selection,
  loading,
  onDatesChange,
  onFetch,
  onClear,
  onSelectionChange,
}: RangePickerProps) {
  const { settings, t } = useSettings();
  const [weeksOpen, setWeeksOpen] = useState(false);
  const years = selectableYears();
  const monthLabels = getMonthLabels(settings.language);

  const dateInput =
    "rounded-lg border border-line bg-surface px-4 py-2 text-ink outline-none focus:ring-2 focus:ring-accent";

  // Picking years or months replaces any week selection, and the other way around.
  const selectYearsMonths = (nextYears: ReadonlySet<number>, nextMonths: ReadonlySet<number>) =>
    onSelectionChange({ years: nextYears, months: nextMonths, weeks: new Set() });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={start}
          aria-label={t("startDate")}
          onChange={(event) => onDatesChange(event.target.value, end)}
          className={dateInput}
        />
        <span className="text-ink-3">{t("to")}</span>
        <input
          type="date"
          value={end}
          aria-label={t("endDate")}
          onChange={(event) => onDatesChange(start, event.target.value)}
          className={dateInput}
        />
        <button
          type="button"
          onClick={onFetch}
          disabled={loading || !start || !end}
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 py-2 font-medium text-primary-ink shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
          {loading ? t("fetching") : t("fetch")}
        </button>
        <button
          type="button"
          onClick={() => {
            setWeeksOpen(false);
            onClear();
          }}
          className="whitespace-nowrap rounded-lg bg-muted px-6 py-2 font-medium text-ink-2 shadow-sm transition-colors hover:bg-muted-strong"
        >
          {t("clear")}
        </button>
      </div>

      <div className="flex items-stretch gap-1.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                aria-pressed={selection.years.has(year)}
                onClick={() => selectYearsMonths(toggled(selection.years, year), selection.months)}
                className={`px-3 py-1.5 ${pill(selection.years.has(year))}`}
              >
                {year}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-expanded={weeksOpen}
            onClick={() => setWeeksOpen((open) => !open)}
            className={`w-full py-1 ${
              weeksOpen || selection.weeks.size > 0
                ? "rounded-lg bg-accent text-xs font-medium text-accent-ink hover:bg-accent-hover"
                : pill(false)
            }`}
          >
            {t("weeks")}
            {selection.weeks.size > 0 ? ` (${selection.weeks.size})` : ""}
          </button>
        </div>

        <div className="mx-1 w-px self-stretch bg-line" aria-hidden />

        <div className="grid min-w-0 flex-1 grid-cols-12 gap-x-0.5">
          {monthLabels.map((label, month) => (
            <button
              key={month}
              type="button"
              aria-pressed={selection.months.has(month)}
              onClick={() => selectYearsMonths(selection.years, toggled(selection.months, month))}
              className={`min-w-0 py-1.5 text-center ${pill(selection.months.has(month))}`}
            >
              {label}
            </button>
          ))}

          {QUARTERS.map((quarter) => {
            const all = quarter.months.every((month) => selection.months.has(month));
            return (
              <div key={quarter.label} className="col-span-3 flex flex-col items-center">
                <div className="mx-[16.67%] h-2.5 w-[66.66%] border-x border-b border-line" aria-hidden />
                <button
                  type="button"
                  aria-pressed={all}
                  onClick={() => {
                    const months = new Set(selection.months);
                    for (const month of quarter.months) {
                      if (all) months.delete(month);
                      else months.add(month);
                    }
                    selectYearsMonths(selection.years, months);
                  }}
                  className={`px-2 py-1 ${pill(all)}`}
                >
                  {quarter.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {weeksOpen && (
        <WeekPicker
          selected={selection.weeks}
          onToggle={(weekStart) =>
            onSelectionChange({ years: new Set(), months: new Set(), weeks: toggled(selection.weeks, weekStart) })
          }
        />
      )}
    </div>
  );
}
