import { useState, useCallback } from "react";
import type { UserPreferences } from "../lib/types";

const STORAGE_KEY = "launchcast_preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
  interests: [],
  deep_dives_only: false,
  technical_detail: false,
};

function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_PREFERENCES;
}

export function usePreferences() {
  const [preferences, setPreferencesState] = useState<UserPreferences>(loadPreferences);

  const setPreferences = useCallback((update: Partial<UserPreferences>) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...update };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleInterest = useCallback((interest: string) => {
    setPreferencesState((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      const next = { ...prev, interests };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const hasCompletedSetup = preferences.interests.length > 0;

  return { preferences, setPreferences, toggleInterest, hasCompletedSetup };
}
