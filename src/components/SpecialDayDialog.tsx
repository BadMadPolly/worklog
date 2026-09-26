import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/ru";

import type { SpecialDayType } from "../models/SpecialDay";

interface SpecialDayDialogProps {
  open: boolean;
  initialValues?: {
    startDate: string;
    endDate: string;
    type: SpecialDayType;
  };
  onClose: () => void;
  onSave: (data: {
    startDate: string;
    endDate: string;
    type: SpecialDayType;
  }) => void;
}

const WEEK_DAYS = [
  "Пн",
  "Вт",
  "Ср",
  "Чт",
  "Пт",
  "Сб",
  "Вс",
];

function getMonthDays(month: Dayjs): Dayjs[] {
  const firstDay = month.startOf("month");
  const weekDay = firstDay.day();
  const mondayOffset =
    weekDay === 0 ? 6 : weekDay - 1;

  const calendarStart = firstDay.subtract(
    mondayOffset,
    "day"
  );

  return Array.from({ length: 42 }, (_, index) =>
    calendarStart.add(index, "day")
  );
}

function formatDate(value: Dayjs | null) {
  return value
    ? value.format("DD.MM.YYYY")
    : "";
}

function isInRange(
  date: Dayjs,
  startDate: Dayjs | null,
  endDate: Dayjs | null
) {
  if (!startDate || !endDate) {
    return false;
  }

  return (
    date.isAfter(startDate, "day") &&
    date.isBefore(endDate, "day")
  );
}

interface MonthCalendarProps {
  month: Dayjs;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onSelect: (date: Dayjs) => void;
}

function MonthCalendar({
  month,
  startDate,
  endDate,
  onSelect,
}: MonthCalendarProps) {
  const days = useMemo(
    () => getMonthDays(month),
    [month]
  );

  return (
    <Stack spacing={1}>
      <Typography
        textAlign="center"
        fontWeight={700}
        sx={{ textTransform: "capitalize" }}
      >
        {month.format("MMMM YYYY")}
      </Typography>

      <Stack
        direction="row"
        justifyContent="center"
        spacing={0.5}
      >
        {WEEK_DAYS.map((day) => (
          <Typography
            key={day}
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            textAlign="center"
            sx={{ width: 40 }}
          >
            {day}
          </Typography>
        ))}
      </Stack>

      <Stack spacing={0.25}>
        {Array.from(
          { length: 6 },
          (_, weekIndex) => (
            <Stack
              key={weekIndex}
              direction="row"
              justifyContent="center"
              spacing={0.25}
            >
              {days
                .slice(
                  weekIndex * 7,
                  weekIndex * 7 + 7
                )
                .map((date) => {
                  const isCurrentMonth =
                    date.month() ===
                    month.month();

                  const isStart = Boolean(
                    startDate?.isSame(
                      date,
                      "day"
                    )
                  );

                  const isEnd = Boolean(
                    endDate?.isSame(
                      date,
                      "day"
                    )
                  );

                  const inRange = isInRange(
                    date,
                    startDate,
                    endDate
                  );

                  const selected =
                    isStart || isEnd;

                  return (
                    <Button
                      key={date.format(
                        "YYYY-MM-DD"
                      )}
                      variant="text"
                      onClick={() =>
                        onSelect(date)
                      }
                      sx={{
                        minWidth: 40,
                        width: 40,
                        height: 40,
                        p: 0,
                        borderRadius:
                          selected
                            ? 1
                            : inRange
                              ? 0
                              : "50%",
                        color:
                          !isCurrentMonth
                            ? "text.disabled"
                            : selected
                              ? "primary.contrastText"
                              : "text.primary",
                        bgcolor: selected
                          ? "primary.main"
                          : inRange
                            ? "primary.light"
                            : "transparent",
                        "&:hover": {
                          bgcolor: selected
                            ? "primary.dark"
                            : "action.hover",
                        },
                        ...(isStart && {
                          borderTopLeftRadius: 20,
                          borderBottomLeftRadius: 20,
                        }),
                        ...(isEnd && {
                          borderTopRightRadius: 20,
                          borderBottomRightRadius: 20,
                        }),
                        fontWeight: selected
                          ? 700
                          : 400,
                      }}
                    >
                      {date.date()}
                    </Button>
                  );
                })}
            </Stack>
          )
        )}
      </Stack>
    </Stack>
  );
}

export default function SpecialDayDialog({
  open,
  initialValues,
  onClose,
  onSave,
}: SpecialDayDialogProps) {
  const [startDate, setStartDate] =
    useState<Dayjs | null>(dayjs());

  const [endDate, setEndDate] =
    useState<Dayjs | null>(dayjs());

  const [visibleMonth, setVisibleMonth] =
    useState(
      dayjs().startOf("month")
    );

  const [type, setType] =
    useState<SpecialDayType>("vacation");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialValues) {
      const start = dayjs(
        initialValues.startDate
      );
      const end = dayjs(
        initialValues.endDate
      );

      setStartDate(start);
      setEndDate(end);
      setVisibleMonth(
        start.startOf("month")
      );
      setType(initialValues.type);
    } else {
      const current = dayjs();

      setStartDate(current);
      setEndDate(current);
      setVisibleMonth(
        current.startOf("month")
      );
      setType("vacation");
    }

    setError("");
  }, [open, initialValues]);

  function selectDate(date: Dayjs) {
    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate(null);
      setError("");
      return;
    }

    if (date.isBefore(startDate, "day")) {
      setStartDate(date);
      setEndDate(null);
      setError("");
      return;
    }

    setEndDate(date);
    setError("");
  }

  function shiftMonth(offset: number) {
    setVisibleMonth((current) =>
      current.add(offset, "month")
    );
  }

  function handleSave() {
    if (!startDate || !endDate) {
      setError(
        "Выберите начало и конец периода."
      );
      return;
    }

    if (endDate.isBefore(startDate, "day")) {
      setError(
        "Дата окончания не может быть раньше даты начала."
      );
      return;
    }

    onSave({
      startDate: startDate.format(
        "YYYY-MM-DD"
      ),
      endDate: endDate.format(
        "YYYY-MM-DD"
      ),
      type,
    });

    onClose();
  }

  const secondMonth =
    visibleMonth.add(1, "month");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {initialValues
          ? "Редактировать период"
          : "Добавить особый период"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Тип"
            value={type}
            onChange={(event) =>
              setType(
                event.target
                  .value as SpecialDayType
              )
            }
          >
            <MenuItem value="vacation">
              Отпуск
            </MenuItem>

            <MenuItem value="sick">
              Больничный
            </MenuItem>

            <MenuItem value="day_off">
              Day off
            </MenuItem>
          </TextField>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
          >
            <TextField
              fullWidth
              label="От"
              value={formatDate(startDate)}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              fullWidth
              label="До"
              value={formatDate(endDate)}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1, sm: 2 },
              overflowX: "auto",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <IconButton
                aria-label="Предыдущий месяц"
                onClick={() =>
                  shiftMonth(-1)
                }
              >
                <ChevronLeftIcon />
              </IconButton>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Выберите начало, затем конец периода
              </Typography>

              <IconButton
                aria-label="Следующий месяц"
                onClick={() =>
                  shiftMonth(1)
                }
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="center"
              spacing={{ xs: 2, sm: 5 }}
            >
              <MonthCalendar
                month={visibleMonth}
                startDate={startDate}
                endDate={endDate}
                onSelect={selectDate}
              />

              <MonthCalendar
                month={secondMonth}
                startDate={startDate}
                endDate={endDate}
                onSelect={selectDate}
              />
            </Stack>
          </Paper>

          {error && (
            <Typography
              variant="body2"
              color="error"
            >
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          {initialValues
            ? "Сохранить"
            : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
