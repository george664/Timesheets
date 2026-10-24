"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { EventsTable } from "@/components/EventsTable";
import { RangePicker, type PeriodSelection } from "@/components/RangePicker";
import { Sidebar } from "@/components/Sidebar";
import { SummaryCards } from "@/components/SummaryCards";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useCalendars } from "@/hooks/useCalendars";
import { useSettings } from "@/hooks/useSettings";
import { defaultRange, rangeForSelection, rangeForWeeks } from "@/lib/dates";
import { CATEGORIZED, UNCATEGORIZED, authorOf, filterEvents, sumHours, toTimedEvents } from "@/lib/events";

interface DashboardProps {
  compact: boolean;
  search: string;
  onOpenSettings: () => void;
}

const NO_SELECTION: PeriodSelection = { years: new Set(), months: new Set(), weeks: new Set() };
const NONE = new Set<number>();

export function Dashboard({ compact, search, onOpenSettings }: DashboardProps) {
  const { settings, t } = useSettings();
  const calendars = useCalendars();
  const { events: rawEvents, loading, loaded, error, load, clear } = useCalendarEvents(settings.defaultCalendars);

  const [range, setRange] = useState(defaultRange);
  const [selection, setSelection] = useState<PeriodSelection>(NO_SELECTION);
  const [category, setCategory] = useState<string | null>(null);
  const [author, setAuthor] = useState<string | null>(null);

  const { includeAllDay, allDayHours, excludedKeywords } = settings;

  const timedEvents = useMemo(
    () => toTimedEvents(rawEvents, { includeAllDay, allDayHours }),
    [rawEvents, includeAllDay, allDayHours],
  );

  // What the sidebar counts: everything that passes the date, keyword and search filters,
  // whichever category or author is picked, so picking one doesn't shrink the list it came from.
  const baseEvents = useMemo(
    () =>
      filterEvents(timedEvents, {
        category: null,
        author: null,
        years: selection.years,
        months: selection.months,
        excludedKeywords,
        search,
      }),
    [timedEvents, selection.years, selection.months, excludedKeywords, search],
  );

  // A picked category or author that no longer exists (after fetching a new range) is ignored.
  const activeCategory =
    category && (category === CATEGORIZED || category === UNCATEGORIZED || baseEvents.some((e) => e.category === category))
      ? category
      : null;
  const activeAuthor = author && baseEvents.some((e) => authorOf(e) === author) ? author : null;

  const visibleEvents = useMemo(
    () =>
      filterEvents(baseEvents, {
        category: activeCategory,
        author: activeAuthor,
        years: NONE,
        months: NONE,
        excludedKeywords: [],
        search: "",
      }),
    [baseEvents, activeCategory, activeAuthor],
  );

  const fetchRange = (start: string, end: string) => {
    if (start && end) void load(start, end);
  };

  const handleSelection = (next: PeriodSelection) => {
    setSelection(next);
    const nextRange = next.weeks.size > 0 ? rangeForWeeks(next.weeks) : rangeForSelection(next.years, next.months);
    if (!nextRange) return;
    setRange(nextRange);
    fetchRange(nextRange.start, nextRange.end);
  };

  // Typing dates picks an exact range, so any year, month or week selection no longer applies.
  const handleDates = (start: string, end: string) => {
    setRange({ start, end });
    setSelection(NO_SELECTION);
  };

  const handleClear = () => {
    clear();
    setRange({ start: "", end: "" });
    setSelection(NO_SELECTION);
    setCategory(null);
    setAuthor(null);
  };

  return (
    <div className="flex w-full items-start gap-6 pb-16">
      <Sidebar
        calendars={calendars}
        events={baseEvents}
        category={activeCategory}
        onCategoryChange={setCategory}
        author={activeAuthor}
        onAuthorChange={setAuthor}
      />

      <div className="min-w-0 flex-1 space-y-6">
        <div className="space-y-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
          <RangePicker
            start={range.start}
            end={range.end}
            selection={selection}
            loading={loading}
            onDatesChange={handleDates}
            onFetch={() => fetchRange(range.start, range.end)}
            onClear={handleClear}
            onSelectionChange={handleSelection}
          />

          {error && (
            <div role="alert" className="flex items-center justify-between gap-4 rounded-lg bg-danger-soft p-4 text-sm text-danger">
              <span>{error === "reauth" ? t("calendarAccessError") : t("fetchFailed")}</span>
              {error === "reauth" && (
                <button
                  type="button"
                  onClick={() => signIn("google")}
                  className="whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-ink hover:bg-primary-hover"
                >
                  {t("signInAgain")}
                </button>
              )}
            </div>
          )}

          {visibleEvents.length > 0 ? (
            <div className={compact ? "space-y-3" : "space-y-6"}>
              <SummaryCards eventCount={visibleEvents.length} totalHours={sumHours(visibleEvents)} compact={compact} />
              <EventsTable
                events={visibleEvents}
                compact={compact}
                rangeLabel={`${range.start}_to_${range.end}`}
                onOpenSettings={onOpenSettings}
              />
            </div>
          ) : (
            loaded &&
            !error && <p className="py-8 text-center text-sm text-ink-3">{t("noEvents")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
