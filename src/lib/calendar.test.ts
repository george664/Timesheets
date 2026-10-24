import { describe, expect, it } from "vitest";
import { toCalendarEvent, toCalendarInfo } from "./calendar";
import { DEFAULT_SETTINGS, parseStoredSettings } from "./settings";

describe("toCalendarEvent", () => {
  const timedEvent = {
    id: "abc",
    summary: "UWCC: Planning",
    start: { dateTime: "2026-03-02T09:00:00-05:00" },
    end: { dateTime: "2026-03-02T10:00:00-05:00" },
  };

  it("maps a timed event", () => {
    expect(toCalendarEvent(timedEvent)).toMatchObject({
      id: "abc",
      title: "UWCC: Planning",
      allDay: false,
      start: "2026-03-02T09:00:00-05:00",
    });
  });

  it("maps an all-day event, which only has dates", () => {
    const result = toCalendarEvent({ id: "d", start: { date: "2026-03-02" }, end: { date: "2026-03-03" } });
    expect(result).toMatchObject({ allDay: true, start: "2026-03-02", end: "2026-03-03" });
  });

  it("titles events with no summary", () => {
    expect(toCalendarEvent({ ...timedEvent, summary: undefined })?.title).toBe("Untitled Event");
  });

  it("skips cancelled events and events with no usable times or id", () => {
    expect(toCalendarEvent({ ...timedEvent, status: "cancelled" })).toBeNull();
    expect(toCalendarEvent({ id: "x", summary: "No times" })).toBeNull();
    expect(toCalendarEvent({ ...timedEvent, id: undefined })).toBeNull();
  });

  it("prefers the organizer's name, then email, then the creator", () => {
    expect(
      toCalendarEvent({ ...timedEvent, organizer: { displayName: "Alex", email: "alex@example.com" } })?.organizer,
    ).toBe("Alex");
    expect(toCalendarEvent({ ...timedEvent, organizer: { email: "alex@example.com" } })?.organizer).toBe(
      "alex@example.com",
    );
    expect(toCalendarEvent({ ...timedEvent, creator: { email: "sam@example.com" } })?.organizer).toBe(
      "sam@example.com",
    );
    expect(toCalendarEvent(timedEvent)?.organizer).toBeNull();
  });

  it("lists guests other than the user", () => {
    const result = toCalendarEvent({
      ...timedEvent,
      attendees: [{ email: "me@example.com", self: true }, { displayName: "Sam" }, { email: "kim@example.com" }],
    });
    expect(result?.guests).toEqual(["Sam", "kim@example.com"]);
  });
});

describe("toCalendarInfo", () => {
  it("uses the user's own name for a calendar when they set one", () => {
    expect(toCalendarInfo({ id: "c1", summary: "Work", summaryOverride: "My work" })?.summary).toBe("My work");
  });

  it("flags the primary calendar and skips entries with no id", () => {
    expect(toCalendarInfo({ id: "me", primary: true })).toMatchObject({ primary: true, summary: "me" });
    expect(toCalendarInfo({ summary: "No id" })).toBeNull();
  });
});

describe("parseStoredSettings", () => {
  it("falls back to the defaults for nothing or for junk", () => {
    expect(parseStoredSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings("{not json")).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings("42")).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps saved values and fills in settings added since they were saved", () => {
    const result = parseStoredSettings(JSON.stringify({ language: "fr", visibleColumns: { location: true } }));
    expect(result.language).toBe("fr");
    expect(result.visibleColumns.location).toBe(true);
    expect(result.visibleColumns.title).toBe(true); // default, not in the saved copy
    expect(result.copyWithHeaders).toBe(DEFAULT_SETTINGS.copyWithHeaders);
  });
});
