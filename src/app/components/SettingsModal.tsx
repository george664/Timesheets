"use client";

import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { useSettings } from "@/app/contexts/SettingsContext";
import { DATE_FORMAT_OPTIONS, LANGUAGE_OPTIONS, Language } from "@/app/types/settings";
import { t } from "@/app/i18n/translations";

interface CalendarInfo {
  id: string;
  summary: string;
  primary: boolean;
  backgroundColor: string;
}

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateSettings } = useSettings();
  const lang = settings.language;
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/calendar/list")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setCalendars(data);
        })
        .catch(() => {});
      setKeywordInput(settings.excludedKeywords.join(", "));
    }
  }, [open]);

  if (!open) return null;

  const toggleCalendar = (id: string) => {
    const current = settings.defaultCalendars;
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    updateSettings({ defaultCalendars: next.length > 0 ? next : ["primary"] });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">{t("settings", lang)}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Date Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("dateFormat", lang)}</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSettings({ dateFormat: e.target.value })}
              className="w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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

          {/* Default Calendars */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t("defaultCalendars", lang)}
              </span>
            </label>
            {calendars.length === 0 ? (
              <p className="text-xs text-gray-400">{t("loadingCalendars", lang)}</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {calendars.map((cal) => (
                  <label key={cal.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={settings.defaultCalendars.includes(cal.id!)}
                      onChange={() => toggleCalendar(cal.id!)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cal.backgroundColor }}
                    />
                    <span className="truncate">{cal.summary}{cal.primary ? ` (${t("primary", lang)})` : ""}</span>
                  </label>
                ))}
              </div>
            )}
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
          <div className="flex gap-2 justify-center pt-2">
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
      </div>
    </div>
  );
}
