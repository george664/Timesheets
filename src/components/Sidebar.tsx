"use client";

import { useMemo } from "react";
import { TallyTable, type TallyRow } from "@/components/TallyTable";
import { isCalendarSelected, toggleCalendar } from "@/hooks/useCalendars";
import { useSettings } from "@/hooks/useSettings";
import {
  CATEGORIZED,
  UNCATEGORIZED,
  UNKNOWN_AUTHOR,
  sumHours,
  tallyByAuthor,
  tallyByCategory,
} from "@/lib/events";
import type { CalendarInfo, TimedEvent } from "@/lib/types";

interface SidebarProps {
  calendars: CalendarInfo[];
  /** Events to count, with excluded keywords, search and date filters applied but no category or author. */
  events: TimedEvent[];
  category: string | null;
  onCategoryChange: (category: string | null) => void;
  author: string | null;
  onAuthorChange: (author: string | null) => void;
}

export function Sidebar({ calendars, events, category, onCategoryChange, author, onAuthorChange }: SidebarProps) {
  const { settings, updateSettings, t } = useSettings();
  const precision = settings.durationPrecision;

  const categoryRows = useMemo(() => tallyByCategory(events), [events]);

  const categoryFooter = useMemo<TallyRow[]>(() => {
    const categorized = events.filter((e) => e.category);
    const uncategorized = events.filter((e) => !e.category);
    return [
      { key: CATEGORIZED, name: CATEGORIZED, label: t("categorized"), count: categorized.length, hours: sumHours(categorized) },
      {
        key: UNCATEGORIZED,
        name: UNCATEGORIZED,
        label: t("uncategorized"),
        count: uncategorized.length,
        hours: sumHours(uncategorized),
      },
    ];
    // `t` only changes with the language, which the labels depend on.
  }, [events, t]);

  const authorRows = useMemo<TallyRow[]>(
    () =>
      tallyByAuthor(events).map((row) => ({
        ...row,
        label: row.name === UNKNOWN_AUTHOR ? t("unknownAuthor") : row.name,
      })),
    [events, t],
  );

  const card = "rounded-xl border border-line bg-surface shadow-sm";

  return (
    <aside className="w-72 flex-shrink-0 space-y-4 self-start lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      {calendars.length > 0 && (
        <div className={`${card} px-3 py-2`}>
          {calendars.map((calendar) => (
            <label key={calendar.id} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={isCalendarSelected(calendar, settings.defaultCalendars)}
                onChange={() =>
                  updateSettings({ defaultCalendars: toggleCalendar(calendar, settings.defaultCalendars) })
                }
                className="rounded border-line accent-accent"
              />
              <span
                className="calendar-dot h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: calendar.backgroundColor ?? undefined }}
                aria-hidden
              />
              <span className="truncate">
                {calendar.summary}
                {calendar.primary ? ` (${t("primary")})` : ""}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className={card}>
        <TallyTable
          nameHeader={t("category")}
          countHeader={t("events")}
          hoursHeader={t("hrs")}
          rows={categoryRows}
          footerRows={categoryFooter}
          selected={category}
          onSelect={onCategoryChange}
          precision={precision}
          emptyText={events.length === 0 ? t("fetchToSeeCategories") : undefined}
        />
      </div>

      {events.length > 0 && (
        <div className={card}>
          <TallyTable
            nameHeader={t("author")}
            countHeader={t("events")}
            hoursHeader={t("hrs")}
            rows={authorRows}
            selected={author}
            onSelect={onAuthorChange}
            precision={precision}
          />
        </div>
      )}
    </aside>
  );
}
