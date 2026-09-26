import type { FavoriteTask } from "../models/FavoriteTask";
import type { SpecialDay } from "../models/SpecialDay";
import type { WorklogEntry } from "../models/WorklogEntry";
import { loadEntries, saveEntries } from "./storage";
import {
  loadFavoriteTasks,
  saveFavoriteTasks,
} from "./favoritesStorage";
import {
  loadSpecialDays,
  saveSpecialDays,
} from "./specialDaysStorage";

interface WorklogBackup {
  version: 1;
  createdAt: string;
  entries: WorklogEntry[];
  favorites: FavoriteTask[];
  specialDays: SpecialDay[];
}

export function createBackup(): WorklogBackup {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    entries: loadEntries(),
    favorites: loadFavoriteTasks(),
    specialDays: loadSpecialDays(),
  };
}

export function downloadBackup(): void {
  const backup = createBackup();

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;

  const date = new Date()
    .toISOString()
    .slice(0, 10);

  anchor.download = `worklog-backup-${date}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function isBackup(value: unknown): value is WorklogBackup {
  if (!value || typeof value !== "object") {
    return false;
  }

  const backup = value as Record<string, unknown>;

  return (
    backup.version === 1 &&
    Array.isArray(backup.entries) &&
    Array.isArray(backup.favorites) &&
    Array.isArray(backup.specialDays)
  );
}

export async function restoreBackup(
  file: File
): Promise<void> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);

  if (!isBackup(parsed)) {
    throw new Error(
      "Файл не является резервной копией Worklog."
    );
  }

  saveEntries(parsed.entries);
  saveFavoriteTasks(parsed.favorites);
  saveSpecialDays(parsed.specialDays);

  window.location.reload();
}
