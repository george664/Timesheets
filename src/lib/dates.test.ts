import { describe, expect, it } from "vitest";
import {
  defaultRange,
  rangeForSelection,
  rangeForWeeks,
  rangeToTimestamps,
  recentMonths,
  selectableYears,
  weeksOfMonth,
} from "./dates";

const NOW = new Date(2026, 9, 24); // 24 October 2026

describe("rangeForSelection", () => {
  it("returns null when nothing is selected", () => {
    expect(rangeForSelection(new Set(), new Set(), NOW)).toBeNull();
  });

  it("spans whole years when only years are selected", () => {
    expect(rangeForSelection(new Set([2026, 2025]), new Set(), NOW)).toEqual({
      start: "2025-01-01",
      end: "2026-12-31",
    });
  });

  it("spans from the first selected month to the end of the last", () => {
    expect(rangeForSelection(new Set([2026]), new Set([1, 3]), NOW)).toEqual({
      start: "2026-02-01",
      end: "2026-04-30",
    });
  });

  it("ends on 29 February in a leap year", () => {
    expect(rangeForSelection(new Set([2024]), new Set([1]), NOW)).toEqual({
      start: "2024-02-01",
      end: "2024-02-29",
    });
  });

  it("uses the current year when only months are selected", () => {
    expect(rangeForSelection(new Set(), new Set([5]), NOW)).toEqual({ start: "2026-06-01", end: "2026-06-30" });
  });
});

describe("rangeForWeeks", () => {
  it("returns null when no week is selected", () => {
    expect(rangeForWeeks(new Set())).toBeNull();
  });

  it("runs from the first selected week's start to six days after the last one's", () => {
    expect(rangeForWeeks(new Set(["2026-03-15", "2026-03-01"]))).toEqual({
      start: "2026-03-01",
      end: "2026-03-21",
    });
  });
});

describe("weeksOfMonth", () => {
  const october = { year: 2026, month: 9 };
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  it("starts weeks on Sunday", () => {
    const weeks = weeksOfMonth(october, 0);
    expect(weeks).toHaveLength(5);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks[0][0].getDay()).toBe(0);
    expect(weeks[0][0].getDate()).toBe(27); // 27 September
    expect(weeks[4][6].getDate()).toBe(31);
  });

  it("starts weeks on Monday", () => {
    const weeks = weeksOfMonth(october, 1);
    expect(weeks[0][0].getDay()).toBe(1);
    expect(weeks[0][0].getDate()).toBe(28); // 28 September
    const last = weeks[weeks.length - 1];
    expect([last[0].getDate(), last[6].getDate()]).toEqual([26, 1]); // ends 1 November
    expect(iso(last[6])).toBeTruthy();
  });
});

describe("misc helpers", () => {
  it("lists the last three years, ending with the current one", () => {
    expect(selectableYears(NOW)).toEqual([2024, 2025, 2026]);
  });

  it("lists the current month and the two before it, across a year boundary", () => {
    expect(recentMonths(new Date(2026, 0, 15))).toEqual([
      { year: 2025, month: 10 },
      { year: 2025, month: 11 },
      { year: 2026, month: 0 },
    ]);
  });

  it("defaults to the last seven days", () => {
    expect(defaultRange(NOW)).toEqual({ start: "2026-10-17", end: "2026-10-24" });
  });

  it("converts a day range to full-day timestamps in local time", () => {
    // Toronto is UTC-5 on 1 March 2026.
    expect(rangeToTimestamps("2026-03-01", "2026-03-01")).toEqual({
      timeMin: "2026-03-01T05:00:00.000Z",
      timeMax: "2026-03-02T04:59:59.999Z",
    });
  });
});
