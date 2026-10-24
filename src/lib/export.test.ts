import { enUS } from "date-fns/locale";
import { describe, expect, it } from "vitest";
import { COLUMNS, visibleColumns, type ColumnContext } from "./columns";
import { toTimedEvents } from "./events";
import { DEFAULT_VISIBLE_COLUMNS } from "./settings";
import { buildClipboardText, buildCsv } from "./export";
import type { CalendarEvent } from "./types";

const ctx: ColumnContext = { dateFormat: "yyyy-MM-dd", durationPrecision: 1, locale: enUS };

const events = (overrides: Partial<CalendarEvent> = {}) =>
  toTimedEvents(
    [
      {
        id: "e1",
        title: "UWCC: Weekly sync",
        description: null,
        location: null,
        start: "2026-03-02T09:00:00-05:00",
        end: "2026-03-02T10:30:00-05:00",
        allDay: false,
        htmlLink: null,
        organizer: null,
        guests: ["a@example.com", "b@example.com"],
        ...overrides,
      },
    ],
    { includeAllDay: true, allDayHours: 8 },
  );

describe("buildClipboardText", () => {
  const columns = visibleColumns(DEFAULT_VISIBLE_COLUMNS);

  it("writes one tab-separated row per event, with the category stripped from the title", () => {
    expect(buildClipboardText(events(), columns, ctx, null)).toBe("2026-03-02\t1.5\tWeekly sync");
  });

  it("adds a header row when given headers", () => {
    const text = buildClipboardText(events(), columns, ctx, ["Date", "Duration", "Title"]);
    expect(text.split("\n")).toEqual(["Date\tDuration\tTitle", "2026-03-02\t1.5\tWeekly sync"]);
  });

  it("keeps tabs and line breaks in a cell from breaking the row", () => {
    const all = visibleColumns({ ...DEFAULT_VISIBLE_COLUMNS, description: true });
    const text = buildClipboardText(events({ description: "line one\nline\ttwo" }), all, ctx, null);
    expect(text).toBe("2026-03-02\t1.5\tWeekly sync\tline one line two");
    expect(text.split("\n")).toHaveLength(1);
  });

  it("leaves start and end times empty for all-day events", () => {
    const startTime = COLUMNS.find((c) => c.key === "startTime")!;
    const [allDay] = events({ allDay: true, start: "2026-03-02", end: "2026-03-03" });
    expect(startTime.value(allDay, ctx)).toBe("");
  });
});

describe("buildCsv", () => {
  it("writes the fixed Title, Date, Duration, Category layout", () => {
    expect(buildCsv(events(), 1, "Uncategorized").split("\r\n")).toEqual([
      "Title,Date,Duration (Hrs),Category",
      '"UWCC: Weekly sync",2026-03-02,1.5,"UWCC"',
    ]);
  });

  it("quotes titles containing commas and quotes", () => {
    const [, row] = buildCsv(events({ title: 'Say "hi", then go' }), 1, "Uncategorized").split("\r\n");
    expect(row).toBe('"Say ""hi"", then go",2026-03-02,1.5,"Uncategorized"');
  });

  it("respects the duration precision", () => {
    expect(buildCsv(events(), 2, "Uncategorized")).toContain(",1.50,");
  });
});
