import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";

import type {
  EntryFormData,
  WorklogEntry,
} from "../models/WorklogEntry";

interface EntryDialogProps {
  open: boolean;
  entry?: WorklogEntry;
  initialDescription?: string;
  initialDate?: string;
  plannedHours?: number;
  alreadyLoggedHours?: number;
  onClose: () => void;
  onSave: (data: EntryFormData) => void;
}

function getTodayKey(): string {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

function formatDate(value: string): string {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}.${month}.${year}`;
}

function parseDisplayDate(value: string): string | null {
  const match = value.trim().match(
    /^(\d{2})\.(\d{2})\.(\d{4})$/
  );

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  const valid =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);

  if (!valid) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

const HOUR_PRESETS = [0.5, 1, 2, 4];

export default function EntryDialog({
  open,
  entry,
  initialDescription = "",
  initialDate,
  plannedHours = 8,
  alreadyLoggedHours = 0,
  onClose,
  onSave,
}: EntryDialogProps) {
  const defaultDate =
    initialDate ?? getTodayKey();

  const [description, setDescription] =
    useState("");

  const [hours, setHours] = useState(1);

  const [, setDate] =
    useState(defaultDate);

  const [dateText, setDateText] =
    useState(formatDate(defaultDate));

  const [writtenOff, setWrittenOff] =
    useState(false);

  const [descriptionError, setDescriptionError] =
    useState("");

  const [hoursError, setHoursError] =
    useState("");

  const [dateError, setDateError] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (entry) {
      setDescription(entry.description);
      setHours(entry.hours);
      setDate(entry.date);
      setDateText(formatDate(entry.date));
      setWrittenOff(entry.writtenOff);
    } else {
      setDescription(initialDescription);
      setHours(1);
      setDate(defaultDate);
      setDateText(formatDate(defaultDate));
      setWrittenOff(false);
    }

    setDescriptionError("");
    setHoursError("");
    setDateError("");
  }, [
    open,
    entry,
    initialDescription,
    defaultDate,
  ]);

  const hoursAfterSave = useMemo(() => {
    const baseHours = entry
      ? alreadyLoggedHours - entry.hours
      : alreadyLoggedHours;

    return baseHours + hours;
  }, [
    alreadyLoggedHours,
    entry,
    hours,
  ]);

  const remainingAfterSave =
    plannedHours - hoursAfterSave;

  const saveDisabled =
    !description.trim() ||
    !Number.isFinite(hours) ||
    hours < 0.1 ||
    hours > 8 ||
    !parseDisplayDate(dateText);

  function handleDateChange(
    value: string
  ) {
    setDateText(value);

    if (!value.trim()) {
      setDateError("Введите дату.");
      return;
    }

    const parsed = parseDisplayDate(value);

    if (!parsed) {
      setDateError(
        "Введите дату в формате ДД.ММ.ГГГГ."
      );
      return;
    }

    setDate(parsed);
    setDateError("");
  }

  function handleSave() {
    let valid = true;

    if (!description.trim()) {
      setDescriptionError(
        "Введите описание задачи."
      );
      valid = false;
    } else {
      setDescriptionError("");
    }

    if (
      !Number.isFinite(hours) ||
      hours < 0.1 ||
      hours > 8
    ) {
      setHoursError(
        "Введите значение от 0,1 до 8 часов."
      );
      valid = false;
    } else {
      setHoursError("");
    }

    const parsedDate =
      parseDisplayDate(dateText);

    if (!parsedDate) {
      setDateError(
        "Введите дату в формате ДД.ММ.ГГГГ."
      );
      valid = false;
    } else {
      setDate(parsedDate);
      setDateError("");
    }

    if (!valid || !parsedDate) {
      return;
    }

    onSave({
      description: description.trim(),
      hours,
      date: parsedDate,
      writtenOff,
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {entry
          ? "Редактировать запись"
          : "Новая запись"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="Описание"
            value={description}
            error={Boolean(descriptionError)}
            helperText={descriptionError}
            onChange={(event) => {
              setDescription(event.target.value);

              if (event.target.value.trim()) {
                setDescriptionError("");
              }
            }}
          />

          <TextField
            fullWidth
            label="Часы"
            type="number"
            value={hours}
            error={Boolean(hoursError)}
            helperText={hoursError}
            inputProps={{
              min: 0.1,
              max: 8,
              step: 0.1,
            }}
            onChange={(event) => {
              setHours(
                Number(event.target.value)
              );

              if (
                event.target.value &&
                Number(event.target.value) >= 0.1 &&
                Number(event.target.value) <= 8
              ) {
                setHoursError("");
              }
            }}
          />

          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: "wrap",
              rowGap: 1,
            }}
          >
            {HOUR_PRESETS.map((preset) => (
              <Button
                key={preset}
                size="small"
                variant={
                  hours === preset
                    ? "contained"
                    : "outlined"
                }
                onClick={() => {
                  setHours(preset);
                  setHoursError("");
                }}
              >
                {preset} ч
              </Button>
            ))}
          </Stack>

          <Alert
            severity={
              remainingAfterSave < 0
                ? "warning"
                : "info"
            }
          >
            {remainingAfterSave >= 0
              ? `После сохранения останется ${remainingAfterSave.toFixed(
                  1
                )} ч из дневной нормы.`
              : `После сохранения будет превышение дневной нормы на ${Math.abs(
                  remainingAfterSave
                ).toFixed(1)} ч.`}
          </Alert>

          <TextField
            fullWidth
            label="Дата"
            value={dateText}
            placeholder="ДД.ММ.ГГГГ"
            error={Boolean(dateError)}
            helperText={
              dateError ||
              "Например, 15.09.2026"
            }
            inputProps={{
              inputMode: "numeric",
              maxLength: 10,
            }}
            onChange={(event) =>
              handleDateChange(
                event.target.value
              )
            }
          />

          <FormControlLabel
            label="Списано в Jira"
            control={
              <Checkbox
                checked={writtenOff}
                onChange={(event) =>
                  setWrittenOff(
                    event.target.checked
                  )
                }
              />
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saveDisabled}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
