const DAYS_OFF_2026 = new Set([
  // Новогодние каникулы / переносы
  "2026-01-01",
  "2026-01-02",
  "2026-01-03",
  "2026-01-04",
  "2026-01-05",
  "2026-01-06",
  "2026-01-07",
  "2026-01-08",
  "2026-01-09",

  // День защитника Отечества
  "2026-02-21",
  "2026-02-22",
  "2026-02-23",

  // Международный женский день
  "2026-03-07",
  "2026-03-08",
  "2026-03-09",

  // Праздник Весны и Труда
  "2026-05-01",
  "2026-05-02",
  "2026-05-03",

  // День Победы
  "2026-05-09",
  "2026-05-10",
  "2026-05-11",

  // День России
  "2026-06-12",
  "2026-06-13",
  "2026-06-14",

  // День народного единства
  "2026-11-04",

  // Перенос выходного с 4 января
  "2026-12-31",
]);

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

export function isHoliday(date: Date): boolean {
  return DAYS_OFF_2026.has(toDateKey(date));
}

export function isWorkingDay(date: Date): boolean {
  return !isHoliday(date) && !isWeekend(date);
}

export function getPlannedHours(date: Date): number {
  return isWorkingDay(date) ? 8 : 0;
}
