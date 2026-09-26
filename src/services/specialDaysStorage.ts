import type { SpecialDay } from "../models/SpecialDay";

const STORAGE_KEY = "worklog_special_days";

export function loadSpecialDays(): SpecialDay[] {
  const json = localStorage.getItem(STORAGE_KEY);

  if (!json) {
    return [];
  }

  try {
    const parsed = JSON.parse(json);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSpecialDays(
  specialDays: SpecialDay[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(specialDays)
  );
}
