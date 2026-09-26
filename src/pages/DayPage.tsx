import { useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import ConfirmDialog from "../components/ConfirmDialog";
import DayJiraSummary from "../components/DayJiraSummary";
import EntryDialog from "../components/EntryDialog";
import EntryTable from "../components/EntryTable";
import FavoriteQuickAdd from "../components/FavoriteQuickAdd";
import SummaryCard from "../components/SummaryCard";

import { useFavorites } from "../hooks/useFavorites";
import { useSpecialDays } from "../hooks/useSpecialDays";
import { useWorklog } from "../hooks/useWorklog";

import type { FavoriteTask } from "../models/FavoriteTask";
import type {
  EntryFormData,
  WorklogEntry,
} from "../models/WorklogEntry";
import type { SpecialDayType } from "../models/SpecialDay";

import {
  getPlannedHours,
  isHoliday,
  isWeekend,
} from "../utils/productionCalendar";

function getTodayKey(): string {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

function parseDateKey(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function shiftDate(
  dateKey: string,
  offset: number
): string {
  const value = parseDateKey(dateKey);

  value.setDate(value.getDate() + offset);

  return toDateKey(value);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(parseDateKey(date));
}

function getTypeLabel(
  type: SpecialDayType
): string {
  switch (type) {
    case "vacation":
      return "Отпуск";

    case "sick":
      return "Больничный";

    case "day_off":
      return "Day off";
  }
}

export default function DayPage() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const selectedDate =
    searchParams.get("date") ??
    getTodayKey();

  const {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleWrittenOff,
    copyEntriesFromDate,
  } = useWorklog();

  const { specialDateMap } =
    useSpecialDays();

  const {
    favorites,
    addFavorite,
  } = useFavorites();

  const selectedDateObject =
    parseDateKey(selectedDate);

  const specialDayType =
    specialDateMap.get(selectedDate);

  const isCalendarNonWorking =
    isWeekend(selectedDateObject) ||
    isHoliday(selectedDateObject);

  const isSelectedDayBlocked =
    Boolean(specialDayType) ||
    isCalendarNonWorking;

  const dayEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.date === selectedDate
      ),
    [entries, selectedDate]
  );

  const actualHours = useMemo(
    () =>
      dayEntries.reduce(
        (sum, entry) =>
          sum + entry.hours,
        0
      ),
    [dayEntries]
  );

  const writtenOffHours = useMemo(
    () =>
      dayEntries
        .filter(
          (entry) => entry.writtenOff
        )
        .reduce(
          (sum, entry) =>
            sum + entry.hours,
          0
        ),
    [dayEntries]
  );

  const plannedHours =
    specialDayType ||
    isHoliday(selectedDateObject)
      ? 8
      : getPlannedHours(
          selectedDateObject
        );

  const autoAccounted =
    Boolean(specialDayType) ||
    isHoliday(selectedDateObject);

  const accountedHours = autoAccounted
    ? Math.max(actualHours, 8)
    : actualHours;

  const displayedWrittenOffHours =
    autoAccounted
      ? Math.max(writtenOffHours, 8)
      : writtenOffHours;

  const remainingHours = Math.max(
    plannedHours - accountedHours,
    0
  );

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [selectedEntry, setSelectedEntry] =
    useState<WorklogEntry>();

  const [favoriteDescription, setFavoriteDescription] =
    useState("");

  const [saveError, setSaveError] =
    useState("");

  const favoriteIds = useMemo(
    () =>
      new Set(
        favorites
          .map((favorite) => {
            const match = entries.find(
              (entry) =>
                entry.description
                  .toLowerCase() ===
                favorite.description
                  .toLowerCase()
            );

            return match?.id;
          })
          .filter(
            (id): id is string =>
              Boolean(id)
          )
      ),
    [entries, favorites]
  );

  function goToDate(dateKey: string) {
    setSaveError("");
    navigate(`/day?date=${dateKey}`);
  }

  function goToPreviousDay() {
    goToDate(
      shiftDate(selectedDate, -1)
    );
  }

  function goToNextDay() {
    goToDate(
      shiftDate(selectedDate, 1)
    );
  }

  function goToToday() {
    goToDate(getTodayKey());
  }

  function openCreateDialog() {
    if (isSelectedDayBlocked) {
      return;
    }

    setSelectedEntry(undefined);
    setFavoriteDescription("");
    setSaveError("");
    setDialogOpen(true);
  }

  function openFavoriteDialog(
    favorite: FavoriteTask
  ) {
    if (isSelectedDayBlocked) {
      return;
    }

    setSelectedEntry(undefined);
    setFavoriteDescription(
      favorite.description
    );
    setSaveError("");
    setDialogOpen(true);
  }

  function openEditDialog(
    entry: WorklogEntry
  ) {
    setSelectedEntry(entry);
    setFavoriteDescription("");
    setSaveError("");
    setDialogOpen(true);
  }

  function openDeleteDialog(
    entry: WorklogEntry
  ) {
    setSelectedEntry(entry);
    setDeleteOpen(true);
  }

  function handleSave(
    data: EntryFormData
  ) {
    const targetDate =
      parseDateKey(data.date);

    const targetSpecialDay =
      specialDateMap.get(data.date);

    const targetBlocked =
      Boolean(targetSpecialDay) ||
      isWeekend(targetDate) ||
      isHoliday(targetDate);

    if (
      targetBlocked &&
      data.date !== selectedEntry?.date
    ) {
      setSaveError(
        "Нельзя перенести запись на выходной, праздник, отпуск, больничный или Day off."
      );
      return;
    }

    if (
      isSelectedDayBlocked &&
      !selectedEntry
    ) {
      setSaveError(
        "Для этого дня ввод записей заблокирован."
      );
      return;
    }

    setSaveError("");

    if (selectedEntry) {
      updateEntry(
        selectedEntry.id,
        data
      );
    } else {
      addEntry({
        ...data,
        date: selectedDate,
      });
    }

    setDialogOpen(false);
    setFavoriteDescription("");
  }

  function handleDelete() {
    if (!selectedEntry) {
      return;
    }

    deleteEntry(
      selectedEntry.id
    );
    setDeleteOpen(false);
  }

  function handleCopyPreviousDay() {
    if (isSelectedDayBlocked) {
      return;
    }

    const copied =
      copyEntriesFromDate(
        shiftDate(selectedDate, -1),
        selectedDate
      );

    if (copied === 0) {
      window.alert(
        "За предыдущий день нет записей для копирования."
      );
    }
  }

  function toggleFavorite(
    entry: WorklogEntry
  ) {
    const exists = favorites.some(
      (favorite) =>
        favorite.description
          .trim()
          .toLowerCase() ===
        entry.description
          .trim()
          .toLowerCase()
    );

    if (!exists) {
      addFavorite(
        entry.description
      );
    }
  }

  const isToday =
    selectedDate === getTodayKey();

  return (
    <>
      <Container
        maxWidth="md"
        sx={{ py: 3 }}
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <IconButton
              aria-label="Предыдущий день"
              onClick={
                goToPreviousDay
              }
            >
              <ChevronLeftIcon />
            </IconButton>

            <Box
              textAlign="center"
              minWidth={0}
            >
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
                {isToday
                  ? "Сегодня"
                  : formatDate(
                      selectedDate
                    )}
              </Typography>

              <Typography color="text.secondary">
                {selectedDate}
              </Typography>
            </Box>

            <IconButton
              aria-label="Следующий день"
              onClick={goToNextDay}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          {!isToday && (
            <Button
              variant="text"
              onClick={goToToday}
            >
              Перейти к сегодня
            </Button>
          )}

          {saveError && (
            <Alert severity="error">
              {saveError}
            </Alert>
          )}

          {specialDayType && (
            <Alert severity="success">
              {getTypeLabel(
                specialDayType
              )}
              . Автоматически учитывается 8
              часов. Ввод новых записей
              заблокирован.
            </Alert>
          )}

          {!specialDayType &&
            isHoliday(
              selectedDateObject
            ) && (
              <Alert severity="success">
                Праздничный день.
                Автоматически учитывается 8
                часов. Ввод новых записей
                заблокирован.
              </Alert>
            )}

          {!specialDayType &&
            !isHoliday(
              selectedDateObject
            ) &&
            isWeekend(
              selectedDateObject
            ) && (
              <Alert severity="info">
                Выходной день. Ввод новых
                записей заблокирован.
              </Alert>
            )}

          {!isSelectedDayBlocked && (
            <Alert severity="info">
              Осталось внести:{" "}
              <strong>
                {remainingHours.toFixed(1)} ч
              </strong>{" "}
              из {plannedHours.toFixed(1)} ч.
            </Alert>
          )}

          <SummaryCard
            title="Всего часов"
            value={accountedHours}
            total={plannedHours}
          />

          <DayJiraSummary
            loggedHours={accountedHours}
            writtenOffHours={
              displayedWrittenOffHours
            }
            plannedHours={plannedHours}
          />

          {!isSelectedDayBlocked && (
            <FavoriteQuickAdd
              favorites={favorites}
              onSelect={
                openFavoriteDialog
              }
            />
          )}

          {!isSelectedDayBlocked && (
            <Button
              variant="outlined"
              startIcon={
                <ContentCopyIcon />
              }
              onClick={
                handleCopyPreviousDay
              }
            >
              Скопировать
              предыдущий день
            </Button>
          )}

          <Typography variant="h6">
            Записи
          </Typography>

          <EntryTable
            entries={dayEntries}
            onToggleWrittenOff={
              toggleWrittenOff
            }
            onEdit={openEditDialog}
            onDelete={
              openDeleteDialog
            }
            favoriteIds={
              favoriteIds
            }
            onToggleFavorite={
              toggleFavorite
            }
          />

          <Button
            variant="contained"
            size="large"
            onClick={
              openCreateDialog
            }
            disabled={
              isSelectedDayBlocked
            }
          >
            Добавить запись
          </Button>
        </Stack>
      </Container>

      <EntryDialog
        open={dialogOpen}
        entry={selectedEntry}
        initialDescription={
          favoriteDescription
        }
        initialDate={selectedDate}
        plannedHours={plannedHours}
        alreadyLoggedHours={
          actualHours
        }
        onClose={() => {
          setDialogOpen(false);
          setFavoriteDescription("");
          setSaveError("");
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Удалить запись?"
        message={`Удалить "${selectedEntry?.description ?? ""}"?`}
        onCancel={() =>
          setDeleteOpen(false)
        }
        onConfirm={handleDelete}
      />
    </>
  );
}
