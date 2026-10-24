"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ClipboardCopy, Columns, Copy, Download } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { columnContext, visibleColumns } from "@/lib/columns";
import { buildClipboardText, buildCsv, downloadTextFile } from "@/lib/export";
import type { TimedEvent } from "@/lib/types";

interface EventsTableProps {
  events: TimedEvent[];
  compact: boolean;
  /** Used in the CSV file name. */
  rangeLabel: string;
  onOpenSettings: () => void;
}

export function EventsTable({ events, compact, rangeLabel, onOpenSettings }: EventsTableProps) {
  const { settings, updateSettings, t, locale } = useSettings();
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { dateFormat, durationPrecision, copyWithHeaders } = settings;
  const columns = useMemo(() => visibleColumns(settings.visibleColumns), [settings.visibleColumns]);
  const context = useMemo(
    () => columnContext({ dateFormat, durationPrecision }, locale),
    [dateFormat, durationPrecision, locale],
  );

  const clipboardText = useMemo(
    () =>
      buildClipboardText(events, columns, context, copyWithHeaders ? columns.map((column) => t(column.header)) : null),
    [events, columns, context, copyWithHeaders, t],
  );

  const flashCopied = useCallback(() => {
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  const copy = useCallback(
    () =>
      navigator.clipboard.writeText(clipboardText).then(flashCopied, () => {
        // Clipboard access can be denied; there is nothing useful to tell the user.
      }),
    [clipboardText, flashCopied],
  );

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  // Auto-copy fires when the set of events changes, not when only a display setting does.
  const eventsKey = useMemo(() => events.map((event) => event.id).join(","), [events]);
  const previousKey = useRef(eventsKey);
  useEffect(() => {
    const changed = eventsKey !== previousKey.current;
    previousKey.current = eventsKey;
    if (changed && settings.autoCopy && events.length > 0) void copy();
  }, [eventsKey, settings.autoCopy, events.length, copy]);

  const downloadCsv = () =>
    downloadTextFile(`events_${rangeLabel}.csv`, buildCsv(events, durationPrecision, t("uncategorized")));

  const headerCell = compact ? "px-2 py-1.5" : "px-4 py-3";
  const bodyCell = compact ? "px-2 py-1 text-xs" : "px-4 py-3 text-sm";
  const action = "flex items-center gap-1.5 text-sm font-medium transition-colors";

  return (
    <div>
      <div className={`flex items-center justify-between ${compact ? "mb-2" : "mb-4 mt-8"}`}>
        <h4 className="text-lg font-semibold">{t("eventsTitle")}</h4>

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={onOpenSettings} className={`${action} text-ink-3 hover:text-ink`}>
            <Columns className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t("tableColumns")}</span>
          </button>

          <button
            type="button"
            onClick={() => updateSettings({ autoCopy: !settings.autoCopy })}
            title={settings.autoCopy ? t("disableAutoCopy") : t("enableAutoCopy")}
            className={`${action} ${settings.autoCopy ? "text-ink" : "text-ink-3 hover:text-ink"}`}
          >
            <ClipboardCopy className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">
              {t("autoCopyIs")} {settings.autoCopy ? t("on") : t("off")}
            </span>
          </button>

          <button type="button" onClick={copy} className={`${action} gap-2 text-ink-2 hover:text-ink`}>
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            {copied ? t("copied") : t("copy")}
          </button>

          <button type="button" onClick={downloadCsv} className={`${action} gap-2 text-accent hover:text-accent-hover`}>
            <Download className="h-4 w-4" aria-hidden />
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full bg-surface text-left">
          <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wider text-ink-3">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={`${headerCell} font-medium`}>
                  {t(column.header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-muted/50">
                {columns.map((column) => {
                  const value = column.value(event, context);
                  return (
                    <td key={column.key} className={`${bodyCell} ${column.cellClass ?? ""}`}>
                      {column.key === "title" && event.htmlLink ? (
                        <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
