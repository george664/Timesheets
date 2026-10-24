import { describe, expect, it } from "vitest";
import {
  CATEGORIZED,
  UNCATEGORIZED,
  UNKNOWN_AUTHOR,
  filterEvents,
  splitTitle,
  sumHours,
  tallyByAuthor,
  tallyByCategory,
  toTimedEvents,
  type EventFilters,
} from "./events";
import type { CalendarEvent } from "./types";

const event = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: "e1",
  title: "UWCC: Weekly sync",
  description: null,
  location: null,
  start: "2026-03-02T09:00:00-05:00",
  end: "2026-03-02T10:30:00-05:00",
  allDay: false,
  htmlLink: null,
  organizer: "alex@example.com",
  guests: [],
  ...overrides,
});

const noFilters: EventFilters = {
  category: null,
  author: null,
  years: new Set(),
  months: new Set(),
  excludedKeywords: [],
  search: "",
};

const timed = (events: CalendarEvent[]) => toTimedEvents(events, { includeAllDay: true, allDayHours: 8 });

describe("splitTitle", () => {
  it("takes the prefix before the first colon as the category", () => {
    expect(splitTitle("UWCC: Weekly sync")).toEqual({ category: "UWCC", displayTitle: "Weekly sync" });
  });

  it("leaves titles without the 'Prefix: ' pattern uncategorized", () => {
    expect(splitTitle("Weekly sync")).toEqual({ category: null, displayTitle: "Weekly sync" });
    expect(splitTitle("Note:no space")).toEqual({ category: null, displayTitle: "Note:no space" });
  });

  it("does not treat a multi-word prefix as a category", () => {
    expect(splitTitle("Team lunch: Friday").category).toBeNull();
  });
});

describe("toTimedEvents", () => {
  it("computes hours from the start and end time", () => {
    const [result] = timed([event()]);
    expect(result.hours).toBe(1.5);
    expect(result.category).toBe("UWCC");
    expect(result.displayTitle).toBe("Weekly sync");
  });

  it("drops all-day events unless they are included", () => {
    const allDay = event({ allDay: true, start: "2026-03-02", end: "2026-03-03" });
    expect(toTimedEvents([allDay], { includeAllDay: false, allDayHours: 8 })).toHaveLength(0);
    expect(toTimedEvents([allDay], { includeAllDay: true, allDayHours: 8 })).toHaveLength(1);
  });

  it("counts each day of a multi-day all-day event", () => {
    // Google's all-day end date is exclusive: 2 -> 4 March is two days.
    const [result] = toTimedEvents([event({ allDay: true, start: "2026-03-02", end: "2026-03-04" })], {
      includeAllDay: true,
      allDayHours: 7.5,
    });
    expect(result.hours).toBe(15);
  });

  it("counts the real length of a day when clocks change", () => {
    // 8 March 2026 is the spring-forward day in Toronto: the calendar day is 23 hours long.
    const [result] = timed([
      event({ start: "2026-03-08T00:00:00-05:00", end: "2026-03-08T12:00:00-04:00" }),
    ]);
    expect(result.hours).toBe(11);
  });

  it("skips events whose dates cannot be read", () => {
    expect(timed([event({ start: "not a date" })])).toHaveLength(0);
  });
});

describe("filterEvents", () => {
  const events = timed([
    event({ id: "a", title: "UWCC: Planning", organizer: "alex@example.com" }),
    event({ id: "b", title: "ACME: Review", organizer: "sam@example.com" }),
    event({ id: "c", title: "Lunch with Sam", organizer: null }),
    event({ id: "d", title: "UWCC: Retro", start: "2025-11-10T09:00:00-05:00", end: "2025-11-10T10:00:00-05:00" }),
  ]);

  const ids = (filters: Partial<EventFilters>) =>
    filterEvents(events, { ...noFilters, ...filters }).map((e) => e.id);

  it("returns everything with no filters", () => {
    expect(ids({})).toEqual(["a", "b", "c", "d"]);
  });

  it("filters by category and by the categorized / uncategorized groups", () => {
    expect(ids({ category: "UWCC" })).toEqual(["a", "d"]);
    expect(ids({ category: CATEGORIZED })).toEqual(["a", "b", "d"]);
    expect(ids({ category: UNCATEGORIZED })).toEqual(["c"]);
  });

  it("filters by author, including events with no organizer", () => {
    expect(ids({ author: "sam@example.com" })).toEqual(["b"]);
    expect(ids({ author: UNKNOWN_AUTHOR })).toEqual(["c"]);
  });

  it("filters by year and month", () => {
    expect(ids({ years: new Set([2025]) })).toEqual(["d"]);
    expect(ids({ months: new Set([2]) })).toEqual(["a", "b", "c"]); // March, zero-based
  });

  it("hides excluded keywords regardless of case", () => {
    expect(ids({ excludedKeywords: ["LUNCH"] })).toEqual(["a", "b", "d"]);
  });

  it("searches titles regardless of case", () => {
    expect(ids({ search: "  retro " })).toEqual(["d"]);
  });
});

describe("tallies", () => {
  const events = timed([
    event({ id: "a", title: "UWCC: One" }),
    event({ id: "b", title: "UWCC: Two" }),
    event({ id: "c", title: "ACME: One", start: "2026-03-02T09:00:00-05:00", end: "2026-03-02T10:00:00-05:00" }),
    event({ id: "d", title: "No prefix", organizer: null }),
  ]);

  it("counts and sums hours per category, most events first, ignoring uncategorized", () => {
    expect(tallyByCategory(events)).toEqual([
      { name: "UWCC", count: 2, hours: 3 },
      { name: "ACME", count: 1, hours: 1 },
    ]);
  });

  it("groups events with no organizer under the unknown author", () => {
    const rows = tallyByAuthor(events);
    expect(rows.find((r) => r.name === UNKNOWN_AUTHOR)).toMatchObject({ count: 1 });
    expect(rows[0]).toMatchObject({ name: "alex@example.com", count: 3 });
  });

  it("sums hours", () => {
    // Three 1.5-hour events and one 1-hour event.
    expect(sumHours(events)).toBe(5.5);
  });
});
