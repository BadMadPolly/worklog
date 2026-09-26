import type { WorklogEntry } from "../models/WorklogEntry";

const STORAGE_KEY = "worklog_entries";

export function loadEntries(): WorklogEntry[] {
  const json = localStorage.getItem(STORAGE_KEY);

  if (!json) {
    return [];
  }

  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function saveEntries(entries: WorklogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}