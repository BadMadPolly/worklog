import * as XLSX from "xlsx";

import type { WorklogEntry } from "../models/WorklogEntry";

interface ExportRow {
  Дата: string;
  Задача: string;
  "Часы": number;
  "Списано в Jira": string;
}

export function exportMonthToExcel(
  entries: WorklogEntry[],
  year: number,
  month: number
) {
  const monthEntries = entries
    .filter((entry) => {
      const date = new Date(
        `${entry.date}T00:00:00`
      );

      return (
        date.getFullYear() === year &&
        date.getMonth() === month
      );
    })
    .sort((a, b) =>
      a.date.localeCompare(b.date)
    );

  const rows: ExportRow[] = monthEntries.map(
    (entry) => ({
      Дата: entry.date,
      Задача: entry.description,
      "Часы": entry.hours,
      "Списано в Jira": entry.writtenOff
        ? "Да"
        : "Нет",
    })
  );

  const totalHours = monthEntries.reduce(
    (sum, entry) => sum + entry.hours,
    0
  );

  const writtenOffHours = monthEntries
    .filter((entry) => entry.writtenOff)
    .reduce(
      (sum, entry) => sum + entry.hours,
      0
    );

  const worksheet = XLSX.utils.json_to_sheet(
    rows
  );

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [],
      ["Итого часов", totalHours],
      ["Списано в Jira", writtenOffHours],
    ],
    { origin: -1 }
  );

  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 60 },
    { wch: 10 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Worklog"
  );

  const monthName = String(month + 1).padStart(
    2,
    "0"
  );

  XLSX.writeFile(
    workbook,
    `worklog-${year}-${monthName}.xlsx`
  );
}
