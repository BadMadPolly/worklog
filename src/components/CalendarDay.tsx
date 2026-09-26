import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type { DayStatus } from "../models/DayStatus";
import type { SpecialDayType } from "../models/SpecialDay";

import {
  getPlannedHours,
  isHoliday,
  isWorkingDay,
  isWeekend,
} from "../utils/productionCalendar";

interface CalendarDayProps {
  date: Date;
  hours: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  specialDayType?: SpecialDayType;
  onClick: () => void;
}

function isPastOrToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const value = new Date(date);
  value.setHours(0, 0, 0, 0);

  return value <= today;
}

function getStatus(
  date: Date,
  hours: number,
  specialDayType?: SpecialDayType
): DayStatus {
  if (specialDayType) {
    return "special";
  }

  if (isHoliday(date) || isWeekend(date)) {
    return "weekend";
  }

  if (!isWorkingDay(date)) {
    return "weekend";
  }

  if (!isPastOrToday(date)) {
    return "future";
  }

  return hours >= getPlannedHours(date)
    ? "complete"
    : "attention";
}

function getColors(status: DayStatus) {
  switch (status) {
    case "complete":
    case "special":
      return {
        background: "success.light",
        text: "success.dark",
      };

    case "attention":
      return {
        background: "warning.light",
        text: "warning.dark",
      };

    case "future":
      return {
        background: "background.paper",
        text: "text.secondary",
      };

    case "weekend":
      return {
        background: "action.hover",
        text: "text.secondary",
      };
  }
}

function getSpecialDayLabel(
  type: SpecialDayType
): string {
  switch (type) {
    case "vacation":
      return "Отпуск · 8 ч";

    case "sick":
      return "Больничный · 8 ч";

    case "day_off":
      return "Day off · 8 ч";
  }
}

export default function CalendarDay({
  date,
  hours,
  isToday,
  isCurrentMonth,
  specialDayType,
  onClick,
}: CalendarDayProps) {
  const status = getStatus(
    date,
    hours,
    specialDayType
  );

  const colors = getColors(status);

  let label = `${hours.toFixed(1)} ч`;

  if (specialDayType) {
    label = getSpecialDayLabel(specialDayType);
  } else if (isHoliday(date)) {
    label = "Праздник · 8 ч";
  } else if (isWeekend(date)) {
    label = "Выходной";
  } else if (status === "future") {
    label = "8 ч план";
  }

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        minHeight: { xs: 76, sm: 104 },
        p: { xs: 0.75, sm: 1.25 },
        cursor: "pointer",
        opacity: isCurrentMonth ? 1 : 0.4,
        bgcolor: colors.background,
        borderWidth: isToday ? 2 : 1,
        borderColor: isToday
          ? "primary.main"
          : "divider",
        borderRadius: 2,
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: 2,
        },
      }}
    >
      <Stack
        height="100%"
        justifyContent="space-between"
      >
        <Typography
          variant="subtitle2"
          fontWeight={isToday ? 800 : 600}
          color={colors.text}
        >
          {date.getDate()}
        </Typography>

        <Box>
          <Typography
            variant="caption"
            color={colors.text}
            fontWeight={
              status === "attention" ? 700 : 500
            }
          >
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
