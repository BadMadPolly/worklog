import {
  Box,
  Stack,
  Typography,
} from "@mui/material";

import CalendarDay from "./CalendarDay";
import type { SpecialDayType } from "../models/SpecialDay";
import type { WorklogEntry } from "../models/WorklogEntry";

interface CalendarMonthProps {
  month: Date;
  entries: WorklogEntry[];
  specialDateMap: Map<string, SpecialDayType>;
  onDayClick: (date: Date) => void;
}

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfCalendar(month: Date): Date {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const day = firstDay.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;

  return new Date(
    firstDay.getFullYear(),
    firstDay.getMonth(),
    1 - mondayOffset
  );
}

function buildDays(month: Date): Date[] {
  const start = startOfCalendar(month);

  return Array.from({ length: 42 }, (_, index) =>
    new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + index
    )
  );
}

export default function CalendarMonth({
  month,
  entries,
  specialDateMap,
  onDayClick,
}: CalendarMonthProps) {
  const days = buildDays(month);

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {weekDays.map((day) => (
          <Typography
            key={day}
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            textAlign="center"
            sx={{ py: 0.5 }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {days.map((date) => {
          const dateKey = toDateKey(date);
          const hours = entries
            .filter((entry) => entry.date === dateKey)
            .reduce((sum, entry) => sum + entry.hours, 0);

          return (
            <CalendarDay
              key={dateKey}
              date={date}
              hours={hours}
              isToday={
                date.toDateString() === new Date().toDateString()
              }
              isCurrentMonth={
                date.getMonth() === month.getMonth()
              }
              specialDayType={specialDateMap.get(dateKey)}
              onClick={() => onDayClick(date)}
            />
          );
        })}
      </Box>
    </Stack>
  );
}
