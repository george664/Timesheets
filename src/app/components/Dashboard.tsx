"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { format, subDays, getISOWeek } from "date-fns";
import { Download, RefreshCw, CalendarDays, Clock, Copy, Check, ClipboardCopy, Columns } from "lucide-react";
import { CategorizedEvent, Client, categorizeEvents } from "@/app/utils/billing";
import { useSettings } from "@/app/contexts/SettingsContext";
import { t, getMonths, getDateLocale } from "@/app/i18n/translations";

export function Dashboard({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { settings, updateSettings, compact, searchQuery } = useSettings();
  const lang = settings.language;
  const [clients, setClients] = useState<Client[]>([]);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [events, setEvents] = useState<CategorizedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<{ id: string; summary: string; primary: boolean; backgroundColor: string }[]>([]);
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [showWeeksPicker, setShowWeeksPicker] = useState(false);
  const [selectedWeeks, setSelectedWeeks] = useState<Set<string>>(new Set());

  const YEARS = [2024, 2025, 2026];
  const MONTHS = getMonths(lang);

  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    try {
      const stored = localStorage.getItem("time_tracker_clients");
      if (stored) setClients(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/calendar/list")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCalendars(data);
          if (settings.defaultCalendars.includes("primary")) {
            const primary = data.find((c: any) => c.primary);
            if (primary) {
              const resolved = settings.defaultCalendars.filter((id) => id !== "primary").concat(primary.id);
              updateSettings({ defaultCalendars: resolved });
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const categories = (() => {
    const map = new Map<string, { count: number; hours: number }>();
    for (const e of events) {
      const match = e.title.match(/^(\S+):\s/);
      if (match) {
        const prev = map.get(match[1]) || { count: 0, hours: 0 };
        prev.count += 1;
        prev.hours += e.durationHours;
        map.set(match[1], prev);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({ name, ...data }));
  })();

  const fetchEvents = useCallback(async (overrideStart?: string, overrideEnd?: string) => {
    const sd = overrideStart || startDate;
    const ed = overrideEnd || endDate;
    setLoading(true);
    setError(null);
    try {
      const [sy, sm, sday] = sd.split("-").map(Number);
      const [ey, em, eday] = ed.split("-").map(Number);
      const timeMin = new Date(sy, sm - 1, sday, 0, 0, 0, 0).toISOString();
      const timeMax = new Date(ey, em - 1, eday, 23, 59, 59, 999).toISOString();

      const calParam = settings.defaultCalendars.join(",");
      const calRes = await fetch(`/api/calendar/events?timeMin=${timeMin}&timeMax=${timeMax}&calendars=${calParam}`);

      if (!calRes.ok) throw new Error("Unable to access Google Calendar. Please sign in again using the button in the top right.");

      const calData = await calRes.json();
      setRawEvents(calData.events);
      setEvents(categorizeEvents(calData.events, clients, {
        includeAllDay: settings.includeAllDay,
        allDayHours: settings.allDayHours,
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, clients, settings.defaultCalendars]);

  const computeRangeAndFetch = (years: Set<number>, months: Set<number>) => {
    if (years.size === 0 && months.size === 0) return;

    const yrs = years.size > 0 ? Array.from(years).sort() : [new Date().getFullYear()];
    const minYear = yrs[0];
    const maxYear = yrs[yrs.length - 1];

    let sd: string, ed: string;
    if (months.size > 0) {
      const mos = Array.from(months).sort((a, b) => a - b);
      const minMonth = mos[0];
      const maxMonth = mos[mos.length - 1];
      sd = `${minYear}-${String(minMonth + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(maxYear, maxMonth + 1, 0).getDate();
      ed = `${maxYear}-${String(maxMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    } else {
      sd = `${minYear}-01-01`;
      ed = `${maxYear}-12-31`;
    }

    setStartDate(sd);
    setEndDate(ed);
    fetchEvents(sd, ed);
  };

  const downloadCSV = () => {
    const headers = ["Title", "Date", "Duration (Hrs)", "Client"];
    const rows = filteredEvents.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      format(new Date(e.startTime), "yyyy-MM-dd"),
      e.durationHours.toFixed(settings.durationPrecision),
      `"${e.clientName || "Uncategorized"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `events_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === "__uncategorized__") {
      if (e.title.match(/^(\S+):\s/)) return false;
    } else if (selectedCategory === "__categorized__") {
      if (!e.title.match(/^(\S+):\s/)) return false;
    } else if (selectedCategory) {
      const match = e.title.match(/^(\S+):\s/);
      if (!match || match[1] !== selectedCategory) return false;
    }
    if (selectedYears.size > 0 || selectedMonths.size > 0) {
      const d = new Date(e.startTime);
      if (selectedYears.size > 0 && !selectedYears.has(d.getFullYear())) return false;
      if (selectedMonths.size > 0 && !selectedMonths.has(d.getMonth())) return false;
    }
    if (settings.excludedKeywords.length > 0) {
      const lower = e.title.toLowerCase();
      if (settings.excludedKeywords.some((kw) => lower.includes(kw.toLowerCase()))) return false;
    }
    if (selectedAuthor && e.organizer !== selectedAuthor) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!e.title.toLowerCase().includes(q) && !(e.clientName || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const totalHours = filteredEvents.reduce((sum, e) => sum + e.durationHours, 0);

  const weeksMonths = useMemo(() => {
    const now = new Date();
    return [-2, -1, 0].map((offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);

  function getCalendarDays(year: number, month: number): Date[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dow = firstDay.getDay();
    const startOffset = settings.weekStartsOn === 1
      ? (dow === 0 ? -6 : 1 - dow)
      : -dow;
    const cur = new Date(firstDay);
    cur.setDate(cur.getDate() + startOffset);
    const days: Date[] = [];
    while (cur.getTime() <= lastDay.getTime() || days.length % 7 !== 0) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
      if (days.length >= 42) break;
    }
    return days;
  }

  const toggleWeek = useCallback((weekStart: Date) => {
    const key = format(weekStart, "yyyy-MM-dd");
    setSelectedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      if (next.size > 0) {
        const starts = Array.from(next).map((k) => new Date(k + "T00:00:00"));
        const minStart = starts.reduce((m, d) => (d < m ? d : m), starts[0]);
        const maxStart = starts.reduce((m, d) => (d > m ? d : m), starts[0]);
        const maxEnd = new Date(maxStart);
        maxEnd.setDate(maxEnd.getDate() + 6);
        const sd = format(minStart, "yyyy-MM-dd");
        const ed = format(maxEnd, "yyyy-MM-dd");
        setStartDate(sd);
        setEndDate(ed);
        fetchEvents(sd, ed);
      }
      return next;
    });
  }, [fetchEvents]);


  const activeYears = useMemo(() => {
    const startYear = parseInt(startDate.split("-")[0]);
    const endYear = parseInt(endDate.split("-")[0]);
    const years = new Set<number>();
    for (let y = startYear; y <= endYear; y++) years.add(y);
    return years;
  }, [startDate, endDate]);

  const filteredKey = useMemo(
    () => filteredEvents.map((e) => e.id).join(","),
    [filteredEvents]
  );
  useEffect(() => {
    if (rawEvents.length === 0) return;
    setEvents(categorizeEvents(rawEvents, clients, {
      includeAllDay: settings.includeAllDay,
      allDayHours: settings.allDayHours,
    }));
  }, [settings.includeAllDay, settings.allDayHours]);

  const prevFilteredKey = useRef(filteredKey);

  const buildCopyText = useCallback((evts: typeof filteredEvents) => {
    const vc = settings.visibleColumns;
    const rows = evts.map((e) => {
      const d = new Date(e.startTime);
      const cols: string[] = [];
      if (vc.date) cols.push(format(d, settings.dateFormat, { locale: getDateLocale(lang) }));
      if (vc.startTime) cols.push(format(d, "HH:mm"));
      if (vc.endTime) cols.push(format(new Date(e.endTime), "HH:mm"));
      if (vc.duration) cols.push(e.durationHours.toFixed(settings.durationPrecision));
      if (vc.title) cols.push(e.title.replace(/^\S+:\s/, ""));
      if (vc.description) cols.push(e.description || "");
      if (vc.guests) cols.push(e.guests.join(", "));
      if (vc.location) cols.push(e.location || "");
      if (vc.monthNumber) cols.push(String(d.getMonth() + 1));
      if (vc.weekNumber) cols.push(String(getISOWeek(d)));
      return cols.join("\t");
    });
    if (settings.copyWithHeaders) {
      const headers: string[] = [];
      if (vc.date) headers.push(t("date", lang));
      if (vc.startTime) headers.push(t("colStartTime", lang));
      if (vc.endTime) headers.push(t("colEndTime", lang));
      if (vc.duration) headers.push(t("duration", lang));
      if (vc.title) headers.push(t("colTitle", lang));
      if (vc.description) headers.push(t("colDescription", lang));
      if (vc.guests) headers.push(t("colGuests", lang));
      if (vc.location) headers.push(t("colLocation", lang));
      if (vc.monthNumber) headers.push(t("colMonthNumber", lang));
      if (vc.weekNumber) headers.push(t("colWeekNumber", lang));
      rows.unshift(headers.join("\t"));
    }
    return rows.join("\n");
  }, [settings.visibleColumns, settings.copyWithHeaders, settings.dateFormat, settings.durationPrecision, lang]);

  useEffect(() => {
    if (!settings.autoCopy || filteredEvents.length === 0) return;
    if (filteredKey === prevFilteredKey.current) return;
    prevFilteredKey.current = filteredKey;
    navigator.clipboard.writeText(buildCopyText(filteredEvents)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [filteredKey, settings.autoCopy, buildCopyText]);

  return (
    <div className="flex gap-6 w-full pb-16 items-start">
      {/* Left sidebar */}
      <aside className="w-72 flex-shrink-0 sticky top-24 self-start space-y-4" style={{ height: "calc(100vh - 7rem)" }}>
        {calendars.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-3 py-2">
            {calendars.map((cal) => {
              const checked = settings.defaultCalendars.includes(cal.id);
              return (
                <label key={cal.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? settings.defaultCalendars.filter((id) => id !== cal.id)
                        : [...settings.defaultCalendars, cal.id];
                      updateSettings({ defaultCalendars: next });
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cal.backgroundColor }} />
                  <span className="truncate">{cal.summary}{cal.primary ? ` (${t("primary", lang)})` : ""}</span>
                </label>
              );
            })}
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ maxHeight: "100%" }}>
          <div className="flex-1 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                {t("fetchToSeeCategories", lang)}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wider">
                    <th className="text-left font-medium px-3 py-1.5">{t("client", lang)}</th>
                    <th className="text-right font-medium px-1.5 py-1.5">{t("events", lang)}</th>
                    <th className="text-right font-medium px-1.5 py-1.5">{t("hrs", lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <tr
                        key={cat.name}
                        onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                        className={`cursor-pointer transition-colors border-l-2 ${
                          isSelected
                            ? "bg-indigo-50 border-l-indigo-600"
                            : "hover:bg-gray-50 border-l-transparent"
                        }`}
                      >
                        <td className={`px-3 py-1.5 font-semibold text-sm truncate max-w-[120px] ${isSelected ? "text-indigo-900" : "text-gray-900"}`}>
                          {cat.name}
                        </td>
                        <td className="text-right px-1.5 py-1.5 font-medium text-gray-900 tabular-nums">{cat.count}</td>
                        <td className="text-right px-1.5 py-1.5 font-medium text-gray-900 tabular-nums">{cat.hours.toFixed(settings.durationPrecision)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  {(() => {
                    const catCount = categories.reduce((s, c) => s + c.count, 0);
                    const catHours = categories.reduce((s, c) => s + c.hours, 0);
                    const uncatEvents = events.filter((e) => !e.title.match(/^(\S+):\s/));
                    const uncatCount = uncatEvents.length;
                    const uncatHours = uncatEvents.reduce((s, e) => s + e.durationHours, 0);
                    return (
                      <>
                        <tr
                          onClick={() => setSelectedCategory(selectedCategory === "__categorized__" ? null : "__categorized__")}
                          className={`border-t border-gray-200 cursor-pointer transition-colors border-l-2 ${
                            selectedCategory === "__categorized__" ? "bg-indigo-50 border-l-indigo-600" : "hover:bg-gray-50 border-l-transparent"
                          }`}
                        >
                          <td className={`px-3 py-1.5 font-semibold text-sm ${selectedCategory === "__categorized__" ? "text-indigo-900" : "text-gray-900"}`}>Categorized</td>
                          <td className={`text-right px-1.5 py-1.5 font-semibold tabular-nums ${selectedCategory === "__categorized__" ? "text-indigo-900" : "text-gray-900"}`}>{catCount}</td>
                          <td className={`text-right px-1.5 py-1.5 font-semibold tabular-nums ${selectedCategory === "__categorized__" ? "text-indigo-900" : "text-gray-900"}`}>{catHours.toFixed(settings.durationPrecision)}</td>
                        </tr>
                        <tr
                          onClick={() => setSelectedCategory(selectedCategory === "__uncategorized__" ? null : "__uncategorized__")}
                          className={`cursor-pointer transition-colors border-l-2 ${
                            selectedCategory === "__uncategorized__" ? "bg-indigo-50 border-l-indigo-600" : "hover:bg-gray-50 border-l-transparent"
                          }`}
                        >
                          <td className={`px-3 py-1.5 font-semibold text-sm ${selectedCategory === "__uncategorized__" ? "text-indigo-900" : "text-gray-900"}`}>Uncategorized</td>
                          <td className={`text-right px-1.5 py-1.5 font-semibold tabular-nums ${selectedCategory === "__uncategorized__" ? "text-indigo-900" : "text-gray-900"}`}>{uncatCount}</td>
                          <td className={`text-right px-1.5 py-1.5 font-semibold tabular-nums ${selectedCategory === "__uncategorized__" ? "text-indigo-900" : "text-gray-900"}`}>{uncatHours.toFixed(settings.durationPrecision)}</td>
                        </tr>
                      </>
                    );
                  })()}
                </tfoot>
              </table>
            )}
          </div>
        </div>

        {/* Author section */}
        {events.length > 0 && (() => {
          const authorMap = new Map<string, { count: number; hours: number }>();
          for (const e of events) {
            const name = e.organizer || "Unknown";
            const prev = authorMap.get(name) || { count: 0, hours: 0 };
            prev.count += 1;
            prev.hours += e.durationHours;
            authorMap.set(name, prev);
          }
          const authors = Array.from(authorMap.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .map(([name, data]) => ({ name, ...data }));
          if (authors.length === 0) return null;
          return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wider">
                      <th className="text-left font-medium px-3 py-1.5">{t("author", lang)}</th>
                      <th className="text-right font-medium px-1.5 py-1.5">{t("events", lang)}</th>
                      <th className="text-right font-medium px-1.5 py-1.5">{t("hrs", lang)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authors.map((a) => {
                      const isSelected = selectedAuthor === a.name;
                      return (
                        <tr
                          key={a.name}
                          onClick={() => setSelectedAuthor(isSelected ? null : a.name)}
                          className={`cursor-pointer transition-colors border-l-2 ${
                            isSelected ? "bg-indigo-50 border-l-indigo-600" : "hover:bg-gray-50 border-l-transparent"
                          }`}
                        >
                          <td className={`px-3 py-1.5 font-semibold text-sm truncate max-w-[120px] ${isSelected ? "text-indigo-900" : "text-gray-900"}`}>{a.name}</td>
                          <td className="text-right px-1.5 py-1.5 font-medium text-gray-900 tabular-nums">{a.count}</td>
                          <td className="text-right px-1.5 py-1.5 font-medium text-gray-900 tabular-nums">{a.hours.toFixed(settings.durationPrecision)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setSelectedWeeks(new Set()); }}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
                  />
                  <span className="text-gray-400">{t("to", lang)}</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setSelectedWeeks(new Set()); }}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
                  />
                  <button
                    onClick={() => fetchEvents()}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    {loading ? t("fetching", lang) : t("fetch", lang)}
                  </button>
                  <button
                    onClick={() => {
                      setRawEvents([]);
                      setEvents([]);
                      setSelectedCategory(null);
                      setSelectedAuthor(null);
                      setSelectedWeeks(new Set());
                      setShowWeeksPicker(false);
                      setSelectedYears(new Set());
                      setSelectedMonths(new Set());
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
                  >
                    {t("clear", lang)}
                  </button>
                </div>
                <div className="flex items-stretch gap-1.5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      {YEARS.map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            const nextYears = new Set(selectedYears);
                            if (nextYears.has(year)) nextYears.delete(year); else nextYears.add(year);
                            setSelectedYears(nextYears);
                            setSelectedWeeks(new Set());
                            computeRangeAndFetch(nextYears, selectedMonths);
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            activeYears.has(year)
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowWeeksPicker((p) => !p)}
                      className={`w-full py-1 text-xs font-medium rounded-lg transition-colors ${
                        showWeeksPicker || selectedWeeks.size > 0
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {t("weeks", lang)}{selectedWeeks.size > 0 ? ` (${selectedWeeks.size})` : ""}
                    </button>
                  </div>
                  <div className="w-px bg-gray-200 mx-1 self-stretch" />
                  <div className="grid grid-cols-12 gap-x-0.5 min-w-0 flex-1">
                    {MONTHS.map((month, i) => (
                      <button
                        key={month}
                        onClick={() => {
                          const nextMonths = new Set(selectedMonths);
                          if (nextMonths.has(i)) nextMonths.delete(i); else nextMonths.add(i);
                          setSelectedMonths(nextMonths);
                          setSelectedWeeks(new Set());
                          computeRangeAndFetch(selectedYears, nextMonths);
                        }}
                        className={`py-1.5 text-xs font-medium rounded-lg transition-colors text-center min-w-0 ${
                          selectedMonths.has(i)
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                    {[
                      { label: "Q1", months: [0, 1, 2] },
                      { label: "Q2", months: [3, 4, 5] },
                      { label: "Q3", months: [6, 7, 8] },
                      { label: "Q4", months: [9, 10, 11] },
                    ].map((q) => {
                      const allSelected = q.months.every((m) => selectedMonths.has(m));
                      return (
                        <div key={q.label} className="col-span-3 flex flex-col items-center">
                          <svg className="w-full" height="10" preserveAspectRatio="none">
                            <line x1="16.67%" y1="0" x2="16.67%" y2="10" stroke="#d1d5db" strokeWidth="1" />
                            <line x1="16.67%" y1="10" x2="83.33%" y2="10" stroke="#d1d5db" strokeWidth="1" />
                            <line x1="83.33%" y1="0" x2="83.33%" y2="10" stroke="#d1d5db" strokeWidth="1" />
                          </svg>
                          <button
                            onClick={() => {
                              const nextMonths = new Set(selectedMonths);
                              if (allSelected) {
                                q.months.forEach((m) => nextMonths.delete(m));
                              } else {
                                q.months.forEach((m) => nextMonths.add(m));
                              }
                              setSelectedMonths(nextMonths);
                              setSelectedWeeks(new Set());
                              computeRangeAndFetch(selectedYears, nextMonths);
                            }}
                            className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                              allSelected
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {q.label}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {showWeeksPicker && (
                  <div className="flex gap-8 pt-3 border-t border-gray-100 justify-center">
                    {weeksMonths.map(({ year, month }) => {
                      const days = getCalendarDays(year, month);
                      const weeks: Date[][] = [];
                      for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
                      return (
                        <div key={`${year}-${month}`}>
                          <div className="text-sm font-semibold text-gray-800 text-center mb-2">
                            {format(new Date(year, month), "MMMM yyyy")}
                          </div>
                          <div className="grid grid-cols-7 mb-1">
                            {(settings.weekStartsOn === 1 ? ["M", "T", "W", "T", "F", "S", "S"] : ["S", "M", "T", "W", "T", "F", "S"]).map((d, i) => (
                              <div key={i} className="w-8 text-center text-xs font-medium text-gray-400">{d}</div>
                            ))}
                          </div>
                          <div className="space-y-0.5">
                            {weeks.map((week, wi) => {
                              const key = format(week[0], "yyyy-MM-dd");
                              const isSelected = selectedWeeks.has(key);
                              const firstIdx = week.findIndex((d) => d.getMonth() === month);
                              const lastIdx = week.reduce((last, d, i) => d.getMonth() === month ? i : last, -1);
                              return (
                                <div
                                  key={wi}
                                  onClick={() => toggleWeek(week[0])}
                                  className={`grid grid-cols-7 cursor-pointer transition-colors ${
                                    !isSelected ? "hover:bg-gray-100 rounded-lg" : ""
                                  }`}
                                >
                                  {week.map((day, di) => {
                                    const inMonth = day.getMonth() === month;
                                    return (
                                      <div
                                        key={di}
                                        className={`w-8 h-8 flex items-center justify-center text-xs transition-colors ${
                                          isSelected && inMonth
                                            ? `bg-gray-900 text-white ${di === firstIdx ? "rounded-l-lg" : ""} ${di === lastIdx ? "rounded-r-lg" : ""}`
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {inMonth ? day.getDate() : ""}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>
          )}

          {filteredEvents.length > 0 && (
            <div className={compact ? "space-y-3" : "space-y-6"}>
              {!compact && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <CalendarDays className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-900/60">{t("totalEvents", lang)}</p>
                      <p className="text-2xl font-bold text-indigo-900">{filteredEvents.length.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900/60">{t("totalHours", lang)}</p>
                      <p className="text-2xl font-bold text-blue-900">{totalHours.toLocaleString("en-US", { minimumFractionDigits: settings.durationPrecision, maximumFractionDigits: settings.durationPrecision })}h</p>
                    </div>
                  </div>
                </div>
              )}
              {compact && (
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span><span className="font-semibold text-gray-900">{filteredEvents.length.toLocaleString()}</span> {t("events", lang)}</span>
                  <span><span className="font-semibold text-gray-900">{totalHours.toLocaleString("en-US", { minimumFractionDigits: settings.durationPrecision, maximumFractionDigits: settings.durationPrecision })}h</span> {t("total", lang)}</span>
                </div>
              )}

              <div className={`flex items-center justify-between ${compact ? "mb-2" : "mt-8 mb-4"}`}>
                <h4 className="text-lg font-semibold text-gray-900">{t("eventsTitle", lang)}</h4>
                <div className="flex items-center gap-4 flex-wrap">
                  {onOpenSettings && (
                    <button
                      onClick={onOpenSettings}
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Columns className="w-4 h-4" />
                      <span className="hidden sm:inline">{t("tableColumns", lang)}</span>
                    </button>
                  )}
                  <button
                    onClick={() => updateSettings({ autoCopy: !settings.autoCopy })}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      settings.autoCopy ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                    }`}
                    title={settings.autoCopy ? t("disableAutoCopy", lang) : t("enableAutoCopy", lang)}
                  >
                    <ClipboardCopy className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("autoCopyIs", lang)} {settings.autoCopy ? t("on", lang) : t("off", lang)}</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(buildCopyText(filteredEvents));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:text-gray-800"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? t("copied", lang) : t("copy", lang)}
                  </button>
                  <button onClick={downloadCSV}
                    className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800">
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                </div>
              </div>

              {(() => {
                const vc = settings.visibleColumns;
                const th = `${compact ? "py-1.5 px-2" : "py-3 px-4"} font-medium`;
                const tdBase = `${compact ? "py-1 px-2 text-xs" : "py-3 px-4 text-sm"}`;
                return (
                  <div className="relative">
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
                  <div className={`overflow-x-auto border border-gray-200 ${compact ? "rounded-lg" : "rounded-xl rounded-b-none"}`}>
                    <table className="w-full text-left bg-white">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                        <tr>
                          {vc.date && <th className={th}>{t("date", lang)}</th>}
                          {vc.startTime && <th className={th}>{t("colStartTime", lang)}</th>}
                          {vc.endTime && <th className={th}>{t("colEndTime", lang)}</th>}
                          {vc.duration && <th className={th}>{t("duration", lang)}</th>}
                          {vc.title && <th className={th}>{t("colTitle", lang)}</th>}
                          {vc.description && <th className={th}>{t("colDescription", lang)}</th>}
                          {vc.guests && <th className={th}>{t("colGuests", lang)}</th>}
                          {vc.location && <th className={th}>{t("colLocation", lang)}</th>}
                          {vc.monthNumber && <th className={th}>{t("colMonthNumber", lang)}</th>}
                          {vc.weekNumber && <th className={th}>{t("colWeekNumber", lang)}</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredEvents.map((event) => {
                          const d = new Date(event.startTime);
                          return (
                            <tr key={event.id} className="hover:bg-gray-50/50">
                              {vc.date && (
                                <td className={`${tdBase} text-gray-500 whitespace-nowrap`}>
                                  {format(d, settings.dateFormat, { locale: getDateLocale(lang) })}
                                </td>
                              )}
                              {vc.startTime && (
                                <td className={`${tdBase} text-gray-500 whitespace-nowrap`}>
                                  {format(d, "HH:mm")}
                                </td>
                              )}
                              {vc.endTime && (
                                <td className={`${tdBase} text-gray-500 whitespace-nowrap`}>
                                  {format(new Date(event.endTime), "HH:mm")}
                                </td>
                              )}
                              {vc.duration && (
                                <td className={`${tdBase} text-gray-600 whitespace-nowrap`}>
                                  {event.durationHours.toFixed(settings.durationPrecision)}
                                </td>
                              )}
                              {vc.title && (
                                <td className={`${tdBase} font-medium text-gray-900 truncate max-w-[200px]`}>
                                  {event.htmlLink ? (
                                    <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                      {event.title.replace(/^\S+:\s/, "")}
                                    </a>
                                  ) : (
                                    event.title.replace(/^\S+:\s/, "")
                                  )}
                                </td>
                              )}
                              {vc.description && (
                                <td className={`${tdBase} text-gray-500 max-w-[200px] truncate`}>
                                  {event.description || ""}
                                </td>
                              )}
                              {vc.guests && (
                                <td className={`${tdBase} text-gray-500 max-w-[180px] truncate`}>
                                  {event.guests.join(", ")}
                                </td>
                              )}
                              {vc.location && (
                                <td className={`${tdBase} text-gray-500 max-w-[180px] truncate`}>
                                  {event.location || ""}
                                </td>
                              )}
                              {vc.monthNumber && (
                                <td className={`${tdBase} text-gray-500 whitespace-nowrap`}>{d.getMonth() + 1}</td>
                              )}
                              {vc.weekNumber && (
                                <td className={`${tdBase} text-gray-500 whitespace-nowrap`}>{getISOWeek(d)}</td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
