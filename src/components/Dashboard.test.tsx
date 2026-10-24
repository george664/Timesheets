// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider } from "@/hooks/useSettings";
import { SETTINGS_STORAGE_KEY } from "@/lib/settings";
import type { CalendarEvent } from "@/lib/types";
import { Dashboard } from "./Dashboard";

vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));

const event = (id: string, title: string, hours: number, organizer: string | null): CalendarEvent => ({
  id,
  title,
  description: null,
  location: null,
  start: "2026-03-02T09:00:00-05:00",
  end: `2026-03-02T${String(9 + hours).padStart(2, "0")}:00:00-05:00`,
  allDay: false,
  htmlLink: null,
  organizer,
  guests: [],
});

const EVENTS = [
  event("a", "UWCC: Planning", 2, "alex@example.com"),
  event("b", "UWCC: Retro", 1, "alex@example.com"),
  event("c", "ACME: Review", 2, "sam@example.com"),
  event("d", "Lunch with Sam", 1, null),
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

let eventsResponse: () => Response;
const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input);
  if (url.startsWith("/api/calendar/list")) {
    return json({ calendars: [{ id: "me@example.com", summary: "Me", primary: true, backgroundColor: "#4285f4" }] });
  }
  if (url.startsWith("/api/calendar/events")) return eventsResponse();
  throw new Error(`Unexpected request: ${url}`);
});

const renderDashboard = (props: { search?: string } = {}) =>
  render(
    <SettingsProvider>
      <Dashboard compact={false} search={props.search ?? ""} onOpenSettings={() => {}} />
    </SettingsProvider>,
  );

const fetchEvents = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: "Fetch" }));

/** The table of events, as opposed to the sidebar tables. */
const eventsTable = () => screen.getAllByRole("table").find((table) => within(table).queryByText("Title"))!;

const requestedUrl = () => new URL(String(fetchMock.mock.calls.at(-1)![0]), "http://localhost");

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 24, 12));
  vi.stubGlobal("fetch", fetchMock);
  eventsResponse = () => json({ events: EVENTS });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  fetchMock.mockClear();
  vi.mocked(signIn).mockClear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Dashboard", () => {
  it("shows the fetched events with totals, categories and authors", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await fetchEvents(user);

    await within(eventsTable()).findByText("Planning");
    expect(within(eventsTable()).getByText("Lunch with Sam")).toBeTruthy();

    expect(screen.getByText("Total Events").nextElementSibling?.textContent).toBe("4");
    expect(screen.getByText("6.0h")).toBeTruthy();

    expect(screen.getByRole("cell", { name: "UWCC" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "ACME" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "alex@example.com" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Unknown" })).toBeTruthy();
  });

  it("asks only for the primary calendar and the chosen dates", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await fetchEvents(user);
    await within(eventsTable()).findByText("Planning");

    const params = requestedUrl().searchParams;
    expect(params.get("calendars")).toBe("primary");
    // The default range is the last seven days, to the end of today.
    expect(params.get("timeMin")).toBe(new Date(2026, 9, 17).toISOString());
    expect(params.get("timeMax")).toBe(new Date(2026, 9, 24, 23, 59, 59, 999).toISOString());
  });

  it("filters the table when a category is clicked, and clears the filter on a second click", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await fetchEvents(user);
    await within(eventsTable()).findByText("Planning");

    await user.click(screen.getByRole("cell", { name: "UWCC" }));
    expect(within(eventsTable()).getByText("Retro")).toBeTruthy();
    expect(within(eventsTable()).queryByText("Review")).toBeNull();
    expect(screen.getByText("Total Events").nextElementSibling?.textContent).toBe("2");
    expect(screen.getByText("3.0h")).toBeTruthy();

    await user.click(screen.getByRole("cell", { name: "UWCC" }));
    expect(within(eventsTable()).getByText("Review")).toBeTruthy();
  });

  it("filters to uncategorized events and to events with no organizer", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await fetchEvents(user);
    await within(eventsTable()).findByText("Planning");

    await user.click(screen.getByRole("cell", { name: "Uncategorized" }));
    expect(within(eventsTable()).getByText("Lunch with Sam")).toBeTruthy();
    expect(within(eventsTable()).queryByText("Planning")).toBeNull();
    await user.click(screen.getByRole("cell", { name: "Uncategorized" }));

    await user.click(screen.getByRole("cell", { name: "Unknown" }));
    expect(within(eventsTable()).getByText("Lunch with Sam")).toBeTruthy();
    expect(within(eventsTable()).queryByText("Review")).toBeNull();
  });

  it("hides excluded keywords from the table and from the sidebar counts", async () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ excludedKeywords: ["lunch"] }));
    const user = userEvent.setup();
    renderDashboard();
    await fetchEvents(user);
    await within(eventsTable()).findByText("Planning");

    expect(within(eventsTable()).queryByText("Lunch with Sam")).toBeNull();
    expect(screen.getByText("Total Events").nextElementSibling?.textContent).toBe("3");
    expect(screen.queryByRole("cell", { name: "Unknown" })).toBeNull();
  });

  it("applies the search from the top bar", async () => {
    const user = userEvent.setup();
    renderDashboard({ search: "retro" });
    await fetchEvents(user);

    await within(eventsTable()).findByText("Retro");
    expect(within(eventsTable()).queryByText("Planning")).toBeNull();
  });

  it("says so when a range has no events", async () => {
    eventsResponse = () => json({ events: [] });
    const user = userEvent.setup();
    renderDashboard();
    await fetchEvents(user);

    expect(await screen.findByText("No events in this range")).toBeTruthy();
  });

  it("offers to sign in again when Google rejects the session", async () => {
    eventsResponse = () => json({ error: "reauth_required" }, 401);
    const user = userEvent.setup();
    renderDashboard();
    await fetchEvents(user);

    expect((await screen.findByRole("alert")).textContent).toContain("Unable to access Google Calendar");
    await user.click(screen.getByRole("button", { name: "Sign in again" }));
    expect(signIn).toHaveBeenCalledWith("google");
  });

  it("shows a plain error, with no sign-in prompt, when the request fails", async () => {
    eventsResponse = () => json({ error: "Failed to fetch calendar events" }, 502);
    const user = userEvent.setup();
    renderDashboard();
    await fetchEvents(user);

    expect((await screen.findByRole("alert")).textContent).toContain("Failed to load events");
    expect(screen.queryByRole("button", { name: "Sign in again" })).toBeNull();
  });

  it("fetches a whole year when its button is clicked, and hides events from other years", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole("button", { name: "2025" }));

    // Not "No events" until the response is in; the mock returns 2026 events, which a 2025 filter hides.
    expect(await screen.findByText("No events in this range")).toBeTruthy();
    const params = requestedUrl().searchParams;
    expect(params.get("timeMin")).toBe(new Date(2025, 0, 1).toISOString());
    expect(params.get("timeMax")).toBe(new Date(2025, 11, 31, 23, 59, 59, 999).toISOString());

    await user.click(screen.getByRole("button", { name: "2025" })); // deselect
    await user.click(screen.getByRole("button", { name: "2026" }));
    await within(eventsTable()).findByText("Planning");
  });

  it("does not fetch when the dates have been cleared", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect((screen.getByRole("button", { name: "Fetch" }) as HTMLButtonElement).disabled).toBe(true);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).startsWith("/api/calendar/events"))).toHaveLength(0);
  });
});
