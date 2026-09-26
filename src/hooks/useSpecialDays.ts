import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";

import type {
  SpecialDay,
  SpecialDayType,
} from "../models/SpecialDay";

import {
  loadSpecialDays,
  saveSpecialDays,
} from "../services/specialDaysStorage";

import {
  GOOGLE_SHEETS_REFRESH_EVENT,
  loadSpecialDaysFromGoogleSheets,
} from "../services/googleSheetsApi";

import type { GoogleSheetsData } from "../services/googleSheetsApi";

function sortSpecialDays(days: SpecialDay[]) {
  return [...days].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );
}

export interface SpecialDayFormData {
  startDate: string;
  endDate: string;
  type: SpecialDayType;
}

export function useSpecialDays() {
  const [specialDays, setSpecialDays] =
    useState<SpecialDay[]>(() =>
      sortSpecialDays(loadSpecialDays())
    );

  const [googleLoaded, setGoogleLoaded] =
    useState(false);

  useEffect(() => {
    function handleGoogleRefresh(event: Event) {
      const customEvent =
        event as CustomEvent<GoogleSheetsData>;

      const normalizedDays: SpecialDay[] =
        customEvent.detail.specialDays.map((day) => ({
          id: day.id,
          startDate: day.startDate,
          endDate: day.endDate,
          type: day.type as SpecialDayType,
        }));

      setSpecialDays(sortSpecialDays(normalizedDays));
      saveSpecialDays(normalizedDays);
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
        const googleDays =
          await loadSpecialDaysFromGoogleSheets();

        const normalizedGoogleDays: SpecialDay[] =
          googleDays.map((day) => ({
            id: day.id,
            startDate: day.startDate,
            endDate: day.endDate,
            type: day.type as SpecialDayType,
          }));

        // Google Sheets is the source of truth when it is available.
        // An empty Google list means that there are no special days.
        setSpecialDays(
          sortSpecialDays(normalizedGoogleDays)
        );
        saveSpecialDays(normalizedGoogleDays);
      } catch (error) {
        // Use local data only when Google Sheets is unavailable.
        console.error(
          "Ошибка загрузки SpecialDays:",
          error
        );

        setSpecialDays(
          sortSpecialDays(loadSpecialDays())
        );
      } finally {
        setGoogleLoaded(true);
      }
    }

    loadFromGoogle();
  }, []);

  useEffect(() => {
    if (!googleLoaded) {
      return;
    }

    saveSpecialDays(specialDays);
  }, [specialDays, googleLoaded]);

  function addSpecialDay(
    data: SpecialDayFormData
  ) {
    const item: SpecialDay = {
      id: uuid(),
      ...data,
    };

    setSpecialDays((prev) =>
      sortSpecialDays([
        ...prev,
        item,
      ])
    );
  }

  function updateSpecialDay(
    id: string,
    data: SpecialDayFormData
  ) {
    setSpecialDays((prev) =>
      sortSpecialDays(
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...data,
              }
            : item
        )
      )
    );
  }

  function deleteSpecialDay(id: string) {
    setSpecialDays((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  }

  const specialDateMap = useMemo(() => {
    const map = new Map<
      string,
      SpecialDayType
    >();

    for (const item of specialDays) {
      const start = new Date(
        `${item.startDate}T00:00:00`
      );

      const end = new Date(
        `${item.endDate}T00:00:00`
      );

      for (
        const current = new Date(start);
        current <= end;
        current.setDate(
          current.getDate() + 1
        )
      ) {
        const year =
          current.getFullYear();

        const month = String(
          current.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          current.getDate()
        ).padStart(2, "0");

        map.set(
          `${year}-${month}-${day}`,
          item.type
        );
      }
    }

    return map;
  }, [specialDays]);

  return {
    specialDays,
    specialDateMap,
    addSpecialDay,
    updateSpecialDay,
    deleteSpecialDay,
  };
}
