import { useEffect, useState } from 'react';

/**
 * Typed localStorage wrapper. If storage is unavailable (private mode,
 * blocked cookies, quota), everything degrades to an in-memory map so the
 * app keeps working for the session.
 */

let storageOk: boolean | null = null;
const memory = new Map<string, string>();

function canUseStorage(): boolean {
  if (storageOk !== null) return storageOk;
  try {
    const probe = '__qh_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    storageOk = true;
  } catch {
    storageOk = false;
  }
  return storageOk;
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = canUseStorage()
      ? window.localStorage.getItem(key)
      : (memory.get(key) ?? null);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  const raw = JSON.stringify(value);
  try {
    if (canUseStorage()) {
      window.localStorage.setItem(key, raw);
      return;
    }
  } catch {
    // fall through to memory
  }
  memory.set(key, raw);
}

/** useState that loads from and persists to storage. */
export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => load(key, initial));
  useEffect(() => {
    save(key, state);
  }, [key, state]);
  return [state, setState] as const;
}
