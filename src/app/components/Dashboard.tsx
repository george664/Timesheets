"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { format, subDays } from "date-fns";
import { Download, RefreshCw, CalendarDays, Clock, Copy, Check, ClipboardCopy } from "lucide-react";
import { CategorizedEvent, Client, categorizeEvents } from "@/app/utils/billing";
import { useSettings } from "@/app/contexts/SettingsContext";
import { t, getMonths } from "@/app/i18n/translations";

export function Dashboard() {
  const { settings, updateSettings, compact, searchQuery } = useSettings();
  const lang = settings.language;
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<CategorizedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

      if (!calRes.ok) throw new Error("Failed to fetch events from Google Calendar.");

      const calData = await calRes.json();
      const categorized = categorizeEvents(calData.events, clients);
      setEvents(categorized);
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
    if (selectedCategory) {
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
    const startOffset = dow === 0 ? -6 : 1 - dow;
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
  const prevFilteredKey = useRef(filteredKey);

  useEffect(() => {
    if (!settings.autoCopy || filteredEvents.length === 0) return;
    if (filteredKey === prevFilteredKey.current) return;
    prevFilteredKey.current = filteredKey;
    const text = filteredEvents
      .map((e) => `${format(new Date(e.startTime), settings.dateFormat)}\t${e.durationHours.toFixed(settings.durationPrecision)}\t${e.title.replace(/^\S+:\s/, "")}`)
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [filteredKey, settings.autoCopy, settings.dateFormat, settings.durationPrecision]);

  return (
    <div className="flex gap-6 w-full pb-16 items-start">
      {/* Left sidebar */}
      <aside className="w-72 flex-shrink-0 sticky top-24 self-start space-y-4" style={{ height: "calc(100vh - 7rem)" }}>
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
                  <tr
                    onClick={() => setSelectedCategory(null)}
                    className={`border-t border-gray-200 cursor-pointer transition-colors border-l-2 ${
                      selectedCategory === null ? "bg-indigo-50 border-l-indigo-600" : "hover:bg-gray-50 border-l-transparent"
                    }`}
                  >
                    <td className={`px-3 py-1.5 font-semibold text-sm ${selectedCategory === null ? "text-indigo-900" : "text-gray-900"}`}>{t("Total", lang)}</td>
                    <td className={`text-right px-1.5 py-1.5 font-semibold tabular-nums ${selectedCategory === null ? "text-indigo-900" : "text-gray-900"}`}>{categories.reduce((s, c) => s + c.count, 0)}</td>
                    <td className={`text-right px-1.5 py-1.5 font-semibold tabular-nums ${selectedCategory === null ? "text-indigo-900" : "text-gray-900"}`}>{categories.reduce((s, c) => s + c.hours, 0).toFixed(settings.durationPrecision)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowWeeksPicker((p) => !p)}
                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap ${
                      showWeeksPicker || selectedWeeks.size > 0
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Weeks{selectedWeeks.size > 0 ? ` (${selectedWeeks.size})` : ""}
                  </button>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
                  />
                  <span className="text-gray-400">{t("to", lang)}</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
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
                </div>
                <div className="flex items-start gap-1.5">
                  <div className="flex items-center gap-1.5 pt-px">
                    {YEARS.map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          const nextYears = new Set(selectedYears);
                          if (nextYears.has(year)) nextYears.delete(year); else nextYears.add(year);
                          setSelectedYears(nextYears);
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
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                  </div>
                  <div className="grid grid-cols-12 gap-x-0.5 min-w-0 flex-1">
                    {MONTHS.map((month, i) => (
                      <button
                        key={month}
                        onClick={() => {
                          const nextMonths = new Set(selectedMonths);
                          if (nextMonths.has(i)) nextMonths.delete(i); else nextMonths.add(i);
                          setSelectedMonths(nextMonths);
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
                  <div className="flex gap-8 pt-3 border-t border-gray-100">
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
                            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                              <div key={i} className="w-8 text-center text-xs font-medium text-gray-400">{d}</div>
                            ))}
                          </div>
                          <div className="space-y-0.5">
                            {weeks.map((week, wi) => {
                              const key = format(week[0], "yyyy-MM-dd");
                              const isSelected = selectedWeeks.has(key);
                              return (
                                <div
                                  key={wi}
                                  onClick={() => toggleWeek(week[0])}
                                  className={`grid grid-cols-7 rounded-lg cursor-pointer transition-colors ${
                                    isSelected ? "bg-gray-900" : "hover:bg-gray-100"
                                  }`}
                                >
                                  {week.map((day, di) => (
                                    <div
                                      key={di}
                                      className={`w-8 h-8 flex items-center justify-center text-xs ${
                                        isSelected
                                          ? "text-white"
                                          : day.getMonth() !== month
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {day.getDate()}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {selectedWeeks.size > 0 && (
                      <div className="flex items-end pb-1">
                        <button
                          onClick={() => setSelectedWeeks(new Set())}
                          className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
                        >
                          Clear
                        </button>
                      </div>
                    )}
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
                      const text = filteredEvents
                        .map((e) => `${format(new Date(e.startTime), settings.dateFormat)}\t${e.durationHours.toFixed(settings.durationPrecision)}\t${e.title.replace(/^\S+:\s/, "")}`)
                        .join("\n");
                      navigator.clipboard.writeText(text);
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

              <div className={`overflow-x-auto border border-gray-200 ${compact ? "rounded-lg" : "rounded-xl rounded-b-none"}`}>
                <table className="w-full text-left bg-white">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className={`${compact ? "py-1.5 px-2" : "py-3 px-4"} font-medium`}>{t("date", lang)}</th>
                      <th className={`${compact ? "py-1.5 px-2" : "py-3 px-4"} font-medium`}>{t("duration", lang)}</th>
                      <th className={`${compact ? "py-1.5 px-2" : "py-3 px-4"} font-medium`}>{t("eventTitle", lang)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50/50">
                        <td className={`${compact ? "py-1 px-2 text-xs" : "py-3 px-4 text-sm"} text-gray-500 whitespace-nowrap`}>
                          {format(new Date(event.startTime), settings.dateFormat)}
                        </td>
                        <td className={`${compact ? "py-1 px-2 text-xs" : "py-3 px-4 text-sm"} text-gray-600 whitespace-nowrap`}>
                          {event.durationHours.toFixed(settings.durationPrecision)}
                        </td>
                        <td className={`${compact ? "py-1 px-2 text-xs" : "py-3 px-4 text-sm"} font-medium text-gray-900 truncate max-w-[200px]`}>
                          {event.htmlLink ? (
                            <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {event.title.replace(/^\S+:\s/, "")}
                            </a>
                          ) : (
                            event.title.replace(/^\S+:\s/, "")
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
