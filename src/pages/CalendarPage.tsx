import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DownloadIcon from "@mui/icons-material/Download";

import CalendarMonth from "../components/CalendarMonth";
import MonthStats from "../components/MonthStats";

import { useSpecialDays } from "../hooks/useSpecialDays";
import { useWorklog } from "../hooks/useWorklog";

import { exportMonthToExcel } from "../services/excelExport";
import { getMonthBalance } from "../utils/monthStats";

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayMonth(): Date {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { entries } = useWorklog();
  const { specialDateMap } = useSpecialDays();

  const [month, setMonth] = useState(
    getTodayMonth
  );

  const monthName = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        month: "long",
        year: "numeric",
      }).format(month),
    [month]
  );

  const balance = useMemo(
    () =>
      getMonthBalance(
        month,
        entries,
        specialDateMap
      ),
    [month, entries, specialDateMap]
  );

  function changeMonth(offset: number) {
    setMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + offset,
          1
        )
    );
  }

  function goToToday() {
    setMonth(getTodayMonth());
  }

  function openDay(date: Date) {
    navigate(`/day?date=${toDateKey(date)}`);
  }

  function exportMonth() {
    exportMonthToExcel(
      entries,
      month.getFullYear(),
      month.getMonth()
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
            >
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    textTransform:
                      "capitalize",
                    fontSize: {
                      xs: "1.75rem",
                      sm: "2.125rem",
                    },
                  }}
                >
                  {monthName}
                </Typography>

                <Typography color="text.secondary">
                  {balance.accountedHours.toFixed(
                    1
                  )}{" "}
                  /{" "}
                  {balance.plannedHours.toFixed(
                    1
                  )}{" "}
                  ч
                </Typography>
              </Box>

              <Box
                display="flex"
                alignItems="center"
              >
                <IconButton
                  aria-label="Предыдущий месяц"
                  onClick={() =>
                    changeMonth(-1)
                  }
                >
                  <ChevronLeftIcon />
                </IconButton>

                <Button
                  size="small"
                  onClick={goToToday}
                >
                  Сегодня
                </Button>

                <IconButton
                  aria-label="Следующий месяц"
                  onClick={() =>
                    changeMonth(1)
                  }
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Box>

            <MonthStats
              accountedHours={
                balance.accountedHours
              }
              plannedHours={
                balance.plannedHours
              }
              loggedHours={
                balance.loggedHours
              }
              specialDayHours={
                balance.specialDayHours
              }
              writtenOffHours={
                balance.writtenOffHours
              }
              remainingHours={
                balance.remainingHours
              }
              workingDays={
                balance.workingDays
              }
              completedDays={
                balance.completedDays
              }
              attentionDays={
                balance.attentionDays
              }
              specialDays={
                balance.specialDays
              }
            />

            <Button
              variant="outlined"
              startIcon={
                <DownloadIcon />
              }
              onClick={exportMonth}
            >
              Экспорт месяца в Excel
            </Button>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                flexWrap: "wrap",
                rowGap: 1,
              }}
            >
              <Typography
                variant="caption"
                color="success.dark"
                fontWeight={700}
              >
                ● 8 ч
              </Typography>

              <Typography
                variant="caption"
                color="warning.dark"
                fontWeight={700}
              >
                ● требует внимания
              </Typography>

              <Typography
                variant="caption"
                color="success.dark"
                fontWeight={700}
              >
                ● отпуск / больничный / Day off
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
              >
                ● выходной / праздник
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        <CalendarMonth
          month={month}
          entries={entries}
          specialDateMap={specialDateMap}
          onDayClick={openDay}
        />
      </Stack>
    </Container>
  );
}
