import { SETTINGS_STORAGE_KEY } from "./settings";

/**
 * Settings live in localStorage, exposed as an external store so React can read
 * them with useSyncExternalStore. If storage is blocked (some private modes),
 * values are kept in memory for the session instead.
 */

let memoryValue: string | null = null;
const listeners = new Set<() => void>();

/** The stored settings JSON, or null if nothing has been saved. */
export function readStoredSettings(): string | null {
  try {
    return localStorage.getItem(SETTINGS_STORAGE_KEY);
  } catch {
    return memoryValue;
  }
}

export function writeStoredSettings(value: string) {
  memoryValue = value;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, value);
  } catch {
    // Kept in memory only.
  }
  for (const listener of listeners) listener();
}

export function subscribeToSettings(listener: () => void) {
  listeners.add(listener);

  // Fires when another tab changes the settings.
  const onStorage = (event: StorageEvent) => {
    if (event.key === SETTINGS_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
