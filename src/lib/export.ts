import { format } from "date-fns";
import type { TimedEvent } from "./types";
import type { ColumnContext, ColumnDef } from "./columns";

/** Collapse tabs and line breaks so a cell can't break the row when pasted into a spreadsheet. */
const flatten = (text: string) => text.replace(/[\t\r\n]+/g, " ").trim();

/**
 * Tab-separated text for pasting into a spreadsheet, using the visible columns.
 * Headers are passed in already translated.
 */
export function buildClipboardText(
  events: TimedEvent[],
  columns: ColumnDef[],
  ctx: ColumnContext,
  headers: string[] | null,
): string {
  const rows = events.map((event) => columns.map((c) => flatten(c.value(event, ctx))).join("\t"));
  if (headers) rows.unshift(headers.map(flatten).join("\t"));
  return rows.join("\n");
}

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** CSV with a fixed layout: full title, date, hours and category. */
export function buildCsv(events: TimedEvent[], durationPrecision: number, uncategorizedLabel: string): string {
  const header = ["Title", "Date", "Duration (Hrs)", "Category"];
  const rows = events.map((event) =>
    [
      csvCell(event.title),
      format(event.startDate, "yyyy-MM-dd"),
      event.hours.toFixed(durationPrecision),
      csvCell(event.category ?? uncategorizedLabel),
    ].join(","),
  );
  return [header.join(","), ...rows].join("\r\n");
}

/** Save text as a file through the browser. A BOM keeps accents intact when opened in Excel. */
export function downloadTextFile(filename: string, text: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob(["﻿", text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
