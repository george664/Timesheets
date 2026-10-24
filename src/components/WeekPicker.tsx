"use client";

import { format } from "date-fns";
import { useSettings } from "@/hooks/useSettings";
import { recentMonths, toDateInput, weeksOfMonth } from "@/lib/dates";

interface WeekPickerProps {
  /** First day (`yyyy-MM-dd`) of each selected week. */
  selected: ReadonlySet<string>;
  onToggle: (weekStart: string) => void;
}

/** Click-to-select weeks across the last three months. */
export function WeekPicker({ selected, onToggle }: WeekPickerProps) {
  const { settings, locale } = useSettings();
  const months = recentMonths();

  return (
    <div className="flex justify-center gap-8 border-t border-line pt-3">
      {months.map((ref) => {
        const weeks = weeksOfMonth(ref, settings.weekStartsOn);
        return (
          <div key={`${ref.year}-${ref.month}`}>
            <div className="mb-2 text-center text-sm font-semibold capitalize">
              {format(new Date(ref.year, ref.month, 1), "LLLL yyyy", { locale })}
            </div>

            <div className="mb-1 grid grid-cols-7">
              {weeks[0].map((day) => (
                <div key={day.getDay()} className="w-8 text-center text-xs font-medium uppercase text-ink-3">
                  {format(day, "EEEEE", { locale })}
                </div>
              ))}
            </div>

            <div className="space-y-0.5">
              {weeks.map((week) => {
                const weekStart = toDateInput(week[0]);
                const isSelected = selected.has(weekStart);
                const inMonth = week.map((day) => day.getMonth() === ref.month);
                const first = inMonth.indexOf(true);
                const last = inMonth.lastIndexOf(true);

                return (
                  <button
                    key={weekStart}
                    type="button"
                    onClick={() => onToggle(weekStart)}
                    aria-pressed={isSelected}
                    className={`grid w-full grid-cols-7 transition-colors ${
                      isSelected ? "" : "rounded-lg hover:bg-muted"
                    }`}
                  >
                    {week.map((day, index) => {
                      const shaded = isSelected && inMonth[index];
                      const rounding = `${index === first ? "rounded-l-lg" : ""} ${index === last ? "rounded-r-lg" : ""}`;
                      return (
                        <span
                          key={day.getTime()}
                          className={`flex h-8 w-8 items-center justify-center text-xs ${
                            shaded ? `bg-primary text-primary-ink ${rounding}` : "text-ink-2"
                          }`}
                        >
                          {inMonth[index] ? day.getDate() : ""}
                        </span>
                      );
                    })}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
