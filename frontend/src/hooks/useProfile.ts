import { useState } from "react";
import type { UserProfile } from "@/types";

const STORAGE_KEY = "mundial_profile";

function readProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    readProfile(),
  );

  function saveProfile(p: UserProfile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setProfile(p);
  }

  function clearProfile() {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  }

  return { profile, saveProfile, clearProfile };
}
