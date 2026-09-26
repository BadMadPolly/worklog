import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";

import type {
  EntryFormData,
  WorklogEntry,
} from "../models/WorklogEntry";

import {
  loadEntries,
  saveEntries,
} from "../services/storage";

import {
  GOOGLE_SHEETS_REFRESH_EVENT,
  loadEntriesFromGoogleSheets,
  saveEntriesToGoogleSheets,
} from "../services/googleSheetsApi";

import type { GoogleSheetsData } from "../services/googleSheetsApi";

function sortEntries(entries: WorklogEntry[]) {
  return [...entries].sort(
    (a, b) =>
      new Date(b.date).getTime() -
        new Date(a.date).getTime() ||
      new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
  );
}

export function useWorklog() {
  const [entries, setEntries] = useState<WorklogEntry[]>(
    () => sortEntries(loadEntries())
  );

  const [loadedFromGoogle, setLoadedFromGoogle] =
    useState(false);

  useEffect(() => {
    function handleGoogleRefresh(event: Event) {
      const customEvent =
        event as CustomEvent<GoogleSheetsData>;

      setEntries(sortEntries(customEvent.detail.entries));
      saveEntries(customEvent.detail.entries);
    }

    window.addEventListener(
      GOOGLE_SHEETS_REFRESH_EVENT,
      handleGoogleRefresh
    );

    return () => {
      window.removeEventListener(
        GOOGLE_SHEETS_REFRESH_EVENT,
        handleGoogleRefresh
      );
    };
  }, []);

  useEffect(() => {
    async function loadFromGoogle() {
      try {
        const googleEntries =
          await loadEntriesFromGoogleSheets();

        setEntries(sortEntries(googleEntries));
        saveEntries(googleEntries);
      } catch (error) {
        console.error(
          "Не удалось загрузить данные из Google Sheets:",
          error
        );
      } finally {
        setLoadedFromGoogle(true);
      }
    }

    loadFromGoogle();
  }, []);

  useEffect(() => {
    if (!loadedFromGoogle) {
      return;
    }

    saveEntries(entries);

    saveEntriesToGoogleSheets(entries).catch((error) => {
      console.error(
        "Не удалось сохранить данные в Google Sheets:",
        error
      );
    });
  }, [entries, loadedFromGoogle]);

  const totalHours = useMemo(
    () =>
      entries.reduce(
        (sum, entry) => sum + entry.hours,
        0
      ),
    [entries]
  );

  const writtenOffHours = useMemo(
    () =>
      entries
        .filter((entry) => entry.writtenOff)
        .reduce(
          (sum, entry) => sum + entry.hours,
          0
        ),
    [entries]
  );

  function addEntry(data: EntryFormData) {
    const now = new Date().toISOString();

    const newEntry: WorklogEntry = {
      id: uuid(),
      description: data.description,
      hours: data.hours,
      date: data.date,
      writtenOff: data.writtenOff,
      createdAt: now,
      updatedAt: now,
    };

    setEntries((prev) =>
      sortEntries([...prev, newEntry])
    );
  }

  function updateEntry(
    id: string,
    data: EntryFormData
  ) {
    setEntries((prev) =>
      sortEntries(
        prev.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : entry
        )
      )
    );
  }

  function deleteEntry(id: string) {
    setEntries((prev) =>
      prev.filter((entry) => entry.id !== id)
    );
  }

  function toggleWrittenOff(id: string) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              writtenOff: !entry.writtenOff,
              updatedAt: new Date().toISOString(),
            }
          : entry
      )
    );
  }

  function copyEntriesFromDate(
    sourceDate: string,
    targetDate: string
  ): number {
    const sourceEntries = entries.filter(
      (entry) => entry.date === sourceDate
    );

    if (sourceEntries.length === 0) {
      return 0;
    }

    const now = new Date().toISOString();

    const copiedEntries = sourceEntries.map(
      (entry) => ({
        id: uuid(),
        description: entry.description,
        hours: entry.hours,
        date: targetDate,
        writtenOff: false,
        createdAt: now,
        updatedAt: now,
      })
    );

    setEntries((prev) =>
      sortEntries([
        ...prev,
        ...copiedEntries,
      ])
    );

    return copiedEntries.length;
  }

  return {
    entries,
    totalHours,
    writtenOffHours,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleWrittenOff,
    copyEntriesFromDate,
  };
}