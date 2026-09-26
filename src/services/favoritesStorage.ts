import type { FavoriteTask } from "../models/FavoriteTask";

const STORAGE_KEY = "worklog_favorite_tasks";

export function loadFavoriteTasks(): FavoriteTask[] {
  const json = localStorage.getItem(STORAGE_KEY);

  if (!json) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavoriteTasks(
  tasks: FavoriteTask[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );
}
