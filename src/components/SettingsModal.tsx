"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Segmented } from "@/components/ui/Segmented";
import { Toggle } from "@/components/ui/Toggle";
import { useSettings } from "@/hooks/useSettings";
import { COLUMNS } from "@/lib/columns";
import { DATE_FORMAT_OPTIONS, DEFAULT_VISIBLE_COLUMNS, LANGUAGE_OPTIONS } from "@/lib/settings";
import type { VisibleColumns } from "@/lib/types";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return <SettingsDialog onClose={onClose} />;
}

const allColumns = (value: boolean): VisibleColumns =>
  Object.fromEntries(COLUMNS.map((column) => [column.key, value])) as unknown as VisibleColumns;

function SettingsDialog({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings, t } = useSettings();
  // Typing "a, b," shouldn't be rewritten as you type, so the raw text is kept separately.
  const [keywordText, setKeywordText] = useState(settings.excludedKeywords.join(", "));
  // Same for the hours field, so it can be emptied while typing a new value.
  const [allDayHoursText, setAllDayHoursText] = useState(String(settings.allDayHours));

  const setColumn = (key: keyof VisibleColumns, checked: boolean) =>
    updateSettings({ visibleColumns: { ...settings.visibleColumns, [key]: checked } });

  const linkButton = "text-xs font-medium text-accent hover:text-accent-hover";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("settings")}
        className="relative m-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-line bg-surface px-6 py-4">
          <h2 className="text-lg font-bold">{t("settings")}</h2>
          <button type="button" onClick={onClose} aria-label={t("close")} className="text-ink-3 hover:text-ink">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="grid gap-y-6 px-6 py-5 md:grid-cols-[1fr_1px_1fr]">
          <div className="space-y-6 md:pr-8">
            <div>
              <label htmlFor="date-format" className="mb-1 block text-sm font-medium text-ink-2">
                {t("dateFormat")}
              </label>
              <select
                id="date-format"
                value={settings.dateFormat}
                onChange={(event) => updateSettings({ dateFormat: event.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              >
                {DATE_FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.example}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-ink-2">{t("durationPrecision")}</span>
              <Segmented
                label={t("durationPrecision")}
                value={settings.durationPrecision}
                onChange={(durationPrecision) => updateSettings({ durationPrecision })}
                options={[
                  { value: 1, label: `1 ${t("decimal")}` },
                  { value: 2, label: `2 ${t("decimals")}` },
                ]}
              />
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-ink-2">{t("weekStartsOn")}</span>
              <Segmented
                label={t("weekStartsOn")}
                value={settings.weekStartsOn}
                onChange={(weekStartsOn) => updateSettings({ weekStartsOn })}
                options={[
                  { value: 0, label: t("sunday") },
                  { value: 1, label: t("monday") },
                ]}
              />
            </div>

            <Toggle
              label={t("bwMode")}
              hint={t("bwModeHint")}
              checked={settings.bwMode}
              onChange={(bwMode) => updateSettings({ bwMode })}
            />

            <Toggle
              label={t("darkMode")}
              hint={t("darkModeHint")}
              checked={settings.darkMode}
              onChange={(darkMode) => updateSettings({ darkMode })}
            />

            <div>
              <label htmlFor="excluded-keywords" className="mb-1 block text-sm font-medium text-ink-2">
                {t("excludedKeywords")}
              </label>
              <input
                id="excluded-keywords"
                type="text"
                value={keywordText}
                onChange={(event) => {
                  setKeywordText(event.target.value);
                  updateSettings({
                    excludedKeywords: event.target.value
                      .split(",")
                      .map((keyword) => keyword.trim())
                      .filter(Boolean),
                  });
                }}
                placeholder={t("excludedKeywordsPlaceholder")}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="mt-1 text-xs text-ink-3">{t("excludedKeywordsHint")}</p>
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-ink-2">{t("language")}</span>
              <Segmented
                label={t("language")}
                value={settings.language}
                onChange={(language) => updateSettings({ language })}
                options={LANGUAGE_OPTIONS}
              />
            </div>
          </div>

          <div className="hidden w-px self-stretch bg-line md:block" aria-hidden />

          <div className="space-y-6 md:pl-8">
            <div className="space-y-3">
              <Toggle
                label={t("includeAllDay")}
                checked={settings.includeAllDay}
                onChange={(includeAllDay) => updateSettings({ includeAllDay })}
              />
              <div className="flex items-center gap-3 pl-1">
                <label htmlFor="all-day-hours" className="text-sm text-ink-2">
                  {t("allDayHours")}
                </label>
                <input
                  id="all-day-hours"
                  type="number"
                  min={1}
                  max={24}
                  step={0.5}
                  value={allDayHoursText}
                  disabled={!settings.includeAllDay}
                  onChange={(event) => {
                    setAllDayHoursText(event.target.value);
                    const hours = parseFloat(event.target.value);
                    if (hours > 0 && hours <= 24) updateSettings({ allDayHours: hours });
                  }}
                  className="w-20 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent disabled:opacity-40"
                />
              </div>
            </div>

            <Toggle
              label={t("copyWithHeaders")}
              checked={settings.copyWithHeaders}
              onChange={(copyWithHeaders) => updateSettings({ copyWithHeaders })}
            />

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-ink-2">{t("tableColumns")}</span>
                <button
                  type="button"
                  className={linkButton}
                  onClick={() => updateSettings({ visibleColumns: DEFAULT_VISIBLE_COLUMNS })}
                >
                  {t("columnsDefault")}
                </button>
                <span className="text-xs text-ink-3" aria-hidden>
                  |
                </span>
                <button
                  type="button"
                  className={linkButton}
                  onClick={() => updateSettings({ visibleColumns: allColumns(true) })}
                >
                  {t("columnsAll")}
                </button>
                <span className="text-xs text-ink-3" aria-hidden>
                  |
                </span>
                <button
                  type="button"
                  className={linkButton}
                  onClick={() => updateSettings({ visibleColumns: allColumns(false) })}
                >
                  {t("clear")}
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {COLUMNS.map((column) => (
                  <label key={column.key} className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
                    <input
                      type="checkbox"
                      checked={settings.visibleColumns[column.key]}
                      onChange={(event) => setColumn(column.key, event.target.checked)}
                      className="rounded border-line accent-accent"
                    />
                    {t(column.header)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
