import type { WorklogEntry } from "../models/WorklogEntry";

const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbxs6py2mjo_8cfFRr90zh6p9B_1sGlEhRn2fbGn42VuzzroVq_CJfHauMdtbcxaWXh7bg/exec";

export const GOOGLE_SHEETS_REFRESH_EVENT =
  "worklog:google-sheets-refresh";

export interface GoogleSpecialDay {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface GoogleFavorite {
  id: string;
  description: string;
  createdAt: string;
}

export interface GoogleSheetsData {
  entries: WorklogEntry[];
  specialDays: GoogleSpecialDay[];
  favorites: GoogleFavorite[];
}

interface GoogleSheetsResponse {
  success?: boolean;
  entries?: WorklogEntry[];
  specialDays?: GoogleSpecialDay[];
  favorites?: GoogleFavorite[];
}

async function request(): Promise<GoogleSheetsResponse> {
  const response = await fetch(GOOGLE_SHEETS_URL);

  if (!response.ok) {
    throw new Error(
      "Не удалось получить данные из Google Sheets"
    );
  }

  return (await response.json()) as GoogleSheetsResponse;
}

export async function loadAllFromGoogleSheets(): Promise<GoogleSheetsData> {
  const data = await request();

  return {
    entries: Array.isArray(data.entries)
      ? data.entries.map((entry) => ({
          ...entry,
          date: entry.date
            ? String(entry.date).slice(0, 10)
            : "",
          hours: Number(entry.hours),
          writtenOff:
            entry.writtenOff === true ||
            String(entry.writtenOff) === "true",
        }))
      : [],

    specialDays: Array.isArray(data.specialDays)
      ? data.specialDays.map((day) => ({
          ...day,
          id: String(day.id),
          startDate: String(day.startDate).slice(0, 10),
          endDate: String(day.endDate).slice(0, 10),
          type: String(day.type),
        }))
      : [],

    favorites: Array.isArray(data.favorites)
      ? data.favorites.map((favorite) => ({
          id: String(favorite.id),
          description: String(favorite.description),
          createdAt: String(favorite.createdAt),
        }))
      : [],
  };
}

export async function refreshAllFromGoogleSheets(): Promise<GoogleSheetsData> {
  const data = await loadAllFromGoogleSheets();

  window.dispatchEvent(
    new CustomEvent<GoogleSheetsData>(
      GOOGLE_SHEETS_REFRESH_EVENT,
      { detail: data }
    )
  );

  return data;
}

export async function loadEntriesFromGoogleSheets(): Promise<
  WorklogEntry[]
> {
  const data = await loadAllFromGoogleSheets();

  return data.entries;
}

export async function loadSpecialDaysFromGoogleSheets(): Promise<
  GoogleSpecialDay[]
> {
  const data = await loadAllFromGoogleSheets();

  return data.specialDays;
}

export async function loadFavoritesFromGoogleSheets(): Promise<
  GoogleFavorite[]
> {
  const data = await loadAllFromGoogleSheets();

  return data.favorites;
}

export async function saveAllToGoogleSheets(data: {
  entries?: WorklogEntry[];
  specialDays?: GoogleSpecialDay[];
  favorites?: GoogleFavorite[];
}): Promise<void> {
  const response = await fetch(GOOGLE_SHEETS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      "Не удалось сохранить данные в Google Sheets"
    );
  }
}

export async function saveEntriesToGoogleSheets(
  entries: WorklogEntry[]
): Promise<void> {
  await saveAllToGoogleSheets({
    entries,
  });
}
