import type { SpecialDayType } from "../models/SpecialDay";
import type { WorklogEntry } from "../models/WorklogEntry";
import {
  getPlannedHours,
  isWorkingDay,
  toDateKey,
} from "./productionCalendar";

export interface MonthBalance {
  plannedHours: number;
  loggedHours: number;
  specialDayHours: number;
  accountedHours: number;
  writtenOffHours: number;
  remainingHours: number;
  workingDays: number;
  completedDays: number;
  attentionDays: number;
  specialDays: number;
}

function getDaysInMonth(month: Date): Date[] {
  const lastDay = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();

  return Array.from({ length: lastDay }, (_, index) =>
    new Date(
      month.getFullYear(),
      month.getMonth(),
      index + 1
    )
  );
}

export function getMonthBalance(
  month: Date,
  entries: WorklogEntry[],
  specialDateMap: Map<string, SpecialDayType>
): MonthBalance {
  const days = getDaysInMonth(month);

  let plannedHours = 0;
  let specialDayHours = 0;
  let workingDays = 0;
  let completedDays = 0;
  let attentionDays = 0;
  let specialDays = 0;

  for (const date of days) {
    const key = toDateKey(date);
    const specialDay = specialDateMap.get(key);
    const planned = getPlannedHours(date);

    if (isWorkingDay(date)) {
      workingDays += 1;
    }

    if (specialDay && isWorkingDay(date)) {
      specialDayHours += planned;
      specialDays += 1;
      continue;
    }

    if (!isWorkingDay(date)) {
      continue;
    }

    plannedHours += planned;

    const dayHours = entries
      .filter((entry) => entry.date === key)
      .reduce(
        (sum, entry) => sum + entry.hours,
        0
      );

    if (dayHours >= planned) {
      completedDays += 1;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date <= today) {
        attentionDays += 1;
      }
    }
  }

  const loggedHours = entries
    .filter((entry) => {
      const entryDate = new Date(
        `${entry.date}T00:00:00`
      );

      return (
        entryDate.getFullYear() ===
          month.getFullYear() &&
        entryDate.getMonth() ===
          month.getMonth()
      );
    })
    .reduce(
      (sum, entry) => sum + entry.hours,
      0
    );

  const writtenOffHours = entries
    .filter((entry) => {
      const entryDate = new Date(
        `${entry.date}T00:00:00`
      );

      return (
        entry.writtenOff &&
        entryDate.getFullYear() ===
          month.getFullYear() &&
        entryDate.getMonth() ===
          month.getMonth()
      );
    })
    .reduce(
      (sum, entry) => sum + entry.hours,
      0
    );

  const accountedHours =
    loggedHours + specialDayHours;

  const remainingHours = Math.max(
    plannedHours - loggedHours,
    0
  );

  return {
    plannedHours,
    loggedHours,
    specialDayHours,
    accountedHours,
    writtenOffHours,
    remainingHours,
    workingDays: workingDays - specialDays,
    completedDays,
    attentionDays,
    specialDays,
  };
}
