import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "../types/notificationPreferences";
import {
  fetchNotificationPreferences,
  saveNotificationPreferences,
  setCachedNotificationPreferences,
} from "../services/notificationPreferencesService";

type PrefKey = keyof NotificationPreferences;

export function useNotificationPreferences() {
  const { isAuthenticated } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setPrefs(DEFAULT_NOTIFICATION_PREFERENCES);
      setCachedNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      setReady(true);
      return;
    }
    setError(null);
    try {
      const loaded = await fetchNotificationPreferences();
      setPrefs(loaded);
      setReady(true);
    } catch {
      setError("load_failed");
      setReady(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    (async () => {
      if (cancelled) return;
      await reload();
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const updatePref = useCallback(async (key: PrefKey, value: boolean) => {
    const previous = prefsRef.current;
    const next = { ...previous, [key]: value };
    setPrefs(next);
    setSyncing(true);
    setError(null);
    try {
      const saved = await saveNotificationPreferences(next);
      setPrefs(saved);
      return { ok: true as const, prefs: saved };
    } catch {
      setPrefs(previous);
      setError("save_failed");
      return { ok: false as const };
    } finally {
      setSyncing(false);
    }
  }, []);

  const updateMany = useCallback(
    async (patch: Partial<NotificationPreferences>) => {
      const previous = prefsRef.current;
      const next = { ...previous, ...patch };
      setPrefs(next);
      setSyncing(true);
      setError(null);
      try {
        const saved = await saveNotificationPreferences(next);
        setPrefs(saved);
        return { ok: true as const, prefs: saved };
      } catch {
        setPrefs(previous);
        setError("save_failed");
        return { ok: false as const };
      } finally {
        setSyncing(false);
      }
    },
    []
  );

  return {
    prefs,
    ready,
    syncing,
    error,
    reload,
    updatePref,
    updateMany,
  };
}
