"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSettings } from "@/app/contexts/SettingsContext";
import { DATE_FORMAT_OPTIONS, LANGUAGE_OPTIONS, Language, VisibleColumns } from "@/app/types/settings";
import { t } from "@/app/i18n/translations";

const COLUMN_KEYS: { key: keyof VisibleColumns; labelKey: Parameters<typeof t>[0] }[] = [
  { key: "date", labelKey: "colDate" },
  { key: "startTime", labelKey: "colStartTime" },
  { key: "endTime", labelKey: "colEndTime" },
  { key: "duration", labelKey: "colDuration" },
  { key: "title", labelKey: "colTitle" },
  { key: "description", labelKey: "colDescription" },
  { key: "guests", labelKey: "colGuests" },
  { key: "location", labelKey: "colLocation" },
  { key: "monthNumber", labelKey: "colMonthNumber" },
  { key: "weekNumber", labelKey: "colWeekNumber" },
];

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateSettings } = useSettings();
  const lang = settings.language;
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (open) {
      setKeywordInput(settings.excludedKeywords.join(", "));
    }
  }, [open]);

  if (!open) return null;

const toggleColumn = (key: keyof VisibleColumns) => {
    updateSettings({
      visibleColumns: { ...settings.visibleColumns, [key]: !settings.visibleColumns[key] },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">{t("settings", lang)}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-y-6" style={{ gridTemplateColumns: "1fr 1px 1fr" }}>

            {/* LEFT COLUMN */}
            <div className="space-y-6 pr-8">

              {/* Date Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("dateFormat", lang)}</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => updateSettings({ dateFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {DATE_FORMAT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Precision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("durationPrecision", lang)}</label>
                <div className="flex gap-2">
                  {([1, 2] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateSettings({ durationPrecision: p })}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        settings.durationPrecision === p
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {p} {p > 1 ? t("decimals", lang) : t("decimal", lang)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Week start */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting day of the week</label>
                <div className="flex gap-2">
                  {([{ label: "Sunday", value: 0 }, { label: "Monday", value: 1 }] as const).map((o) => (
                    <button
                      key={o.value}
                      onClick={() => updateSettings({ weekStartsOn: o.value })}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        settings.weekStartsOn === o.value
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* B&W Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t("bwMode", lang)}</label>
                  <p className="text-xs text-gray-400">{t("bwModeHint", lang)}</p>
                </div>
                <button
                  onClick={() => updateSettings({ bwMode: !settings.bwMode })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings.bwMode ? "bg-gray-900" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.bwMode ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t("darkMode", lang)}</label>
                  <p className="text-xs text-gray-400">{t("darkModeHint", lang)}</p>
                </div>
                <button
                  onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings.darkMode ? "bg-gray-900" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.darkMode ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Excluded Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("excludedKeywords", lang)}</label>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => {
                    setKeywordInput(e.target.value);
                    const keywords = e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter(Boolean);
                    updateSettings({ excludedKeywords: keywords });
                  }}
                  placeholder={t("excludedKeywordsPlaceholder", lang)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">{t("excludedKeywordsHint", lang)}</p>
              </div>

              {/* Language */}
              <div className="flex gap-2">
                {LANGUAGE_OPTIONS.map((lo) => (
                  <button
                    key={lo.value}
                    onClick={() => updateSettings({ language: lo.value })}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      settings.language === lo.value
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {lo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DIVIDER */}
            <div className="bg-gray-200 w-px self-stretch" />

            {/* RIGHT COLUMN */}
            <div className="space-y-6 pl-8">

              {/* All-day events */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">{t("includeAllDay", lang)}</label>
                  <button
                    onClick={() => updateSettings({ includeAllDay: !settings.includeAllDay })}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      settings.includeAllDay ? "bg-gray-900" : "bg-gray-300"
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.includeAllDay ? "translate-x-5" : ""}`} />
                  </button>
                </div>
                <div className="flex items-center gap-3 pl-1">
                  <label className="text-sm text-gray-600">{t("allDayHours", lang)}</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    step={0.5}
                    value={settings.includeAllDay ? settings.allDayHours : ""}
                    disabled={!settings.includeAllDay}
                    onChange={(e) => updateSettings({ allDayHours: parseFloat(e.target.value) || 8 })}
                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-300"
                  />
                </div>
              </div>

              {/* Copy with headers */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">{t("copyWithHeaders", lang)}</label>
                <button
                  onClick={() => updateSettings({ copyWithHeaders: !settings.copyWithHeaders })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings.copyWithHeaders ? "bg-gray-900" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.copyWithHeaders ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Table Columns */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700">{t("tableColumns", lang)}</label>
                  <button
                    onClick={() => updateSettings({ visibleColumns: Object.fromEntries(COLUMN_KEYS.map(({ key }) => [key, key === "date" || key === "duration" || key === "title"])) as any })}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Default
                  </button>
                  <span className="text-xs text-gray-300">|</span>
                  <button
                    onClick={() => updateSettings({ visibleColumns: Object.fromEntries(COLUMN_KEYS.map(({ key }) => [key, true])) as any })}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    All
                  </button>
                  <span className="text-xs text-gray-300">|</span>
                  <button
                    onClick={() => updateSettings({ visibleColumns: Object.fromEntries(COLUMN_KEYS.map(({ key }) => [key, false])) as any })}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {COLUMN_KEYS.map(({ key, labelKey }) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.visibleColumns[key]}
                        onChange={() => toggleColumn(key)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {t(labelKey, lang)}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
