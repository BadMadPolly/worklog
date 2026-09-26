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
  saveAllToGoogleSheets,
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
      const localDays = loadSpecialDays();

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

        if (normalizedGoogleDays.length > 0) {
          setSpecialDays(
            sortSpecialDays(normalizedGoogleDays)
          );

          saveSpecialDays(normalizedGoogleDays);
        } else if (localDays.length > 0) {
          setSpecialDays(sortSpecialDays(localDays));

          await saveAllToGoogleSheets({
            specialDays: localDays,
          });
        } else {
          setSpecialDays([]);
          saveSpecialDays([]);
        }
      } catch (error) {
        console.error(
          "Ошибка загрузки SpecialDays:",
          error
        );

        setSpecialDays(sortSpecialDays(localDays));
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

    void saveAllToGoogleSheets({
      specialDays,
    }).catch((error) => {
      console.error(
        "Ошибка сохранения SpecialDays:",
        error
      );
    });
  }, [specialDays, googleLoaded]);

  async function saveToGoogle(days: SpecialDay[]) {
    try {
      await saveAllToGoogleSheets({
        specialDays: days,
      });
    } catch (error) {
      console.error(
        "Ошибка сохранения SpecialDays:",
        error
      );
    }
  }

  function addSpecialDay(
    data: SpecialDayFormData
  ) {
    const item: SpecialDay = {
      id: uuid(),
      ...data,
    };

    setSpecialDays((prev) => {
      const next = sortSpecialDays([
        ...prev,
        item,
      ]);

      if (googleLoaded) {
        void saveToGoogle(next);
      }

      return next;
    });
  }

  function updateSpecialDay(
    id: string,
    data: SpecialDayFormData
  ) {
    setSpecialDays((prev) => {
      const next = sortSpecialDays(
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...data,
              }
            : item
        )
      );

      if (googleLoaded) {
        void saveToGoogle(next);
      }

      return next;
    });
  }

  function deleteSpecialDay(id: string) {
    setSpecialDays((prev) => {
      const next = prev.filter(
        (item) => item.id !== id
      );

      saveSpecialDays(next);

      if (googleLoaded) {
        void saveToGoogle(next);
      }

      return next;
    });
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
