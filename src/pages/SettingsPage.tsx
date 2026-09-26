import { useState } from "react";

import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import BackupRestore from "../components/BackupRestore";
import ConfirmDialog from "../components/ConfirmDialog";
import SpecialDayDialog from "../components/SpecialDayDialog";

import { useFavorites } from "../hooks/useFavorites";
import { useSpecialDays } from "../hooks/useSpecialDays";

import type {
  SpecialDay,
  SpecialDayType,
} from "../models/SpecialDay";

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

export default function SettingsPage() {
  const {
    specialDays,
    addSpecialDay,
    updateSpecialDay,
    deleteSpecialDay,
  } = useSpecialDays();

  const {
    favorites,
    addFavorite,
    removeFavorite,
  } = useFavorites();

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [selectedSpecialDay, setSelectedSpecialDay] =
    useState<SpecialDay>();

  const [favoriteDescription, setFavoriteDescription] =
    useState("");

  function openCreateSpecialDay() {
    setSelectedSpecialDay(undefined);
    setDialogOpen(true);
  }

  function openEditSpecialDay(
    item: SpecialDay
  ) {
    setSelectedSpecialDay(item);
    setDialogOpen(true);
  }

  function openDeleteSpecialDay(
    item: SpecialDay
  ) {
    setSelectedSpecialDay(item);
    setDeleteOpen(true);
  }

  function handleSaveSpecialDay(data: {
    startDate: string;
    endDate: string;
    type: SpecialDayType;
  }) {
    if (selectedSpecialDay) {
      updateSpecialDay(
        selectedSpecialDay.id,
        data
      );
    } else {
      addSpecialDay(data);
    }

    setDialogOpen(false);
  }

  function handleDeleteSpecialDay() {
    if (!selectedSpecialDay) {
      return;
    }

    deleteSpecialDay(
      selectedSpecialDay.id
    );

    setDeleteOpen(false);
  }

  function handleAddFavorite() {
    addFavorite(favoriteDescription);
    setFavoriteDescription("");
  }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 3 }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Настройки
          </Typography>

          <Typography color="text.secondary">
            Рабочий календарь
          </Typography>
        </Box>

        <Paper>
          <Stack spacing={2} sx={{ p: 2 }}>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Избранные задачи
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Часто используемые задачи
                для быстрого добавления.
              </Typography>
            </Box>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
            >
              <TextField
                fullWidth
                size="small"
                label="Название задачи"
                value={favoriteDescription}
                onChange={(event) =>
                  setFavoriteDescription(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    handleAddFavorite();
                  }
                }}
              />

              <Button
                variant="contained"
                onClick={
                  handleAddFavorite
                }
              >
                Добавить
              </Button>
            </Stack>

            <Divider />

            {favorites.length === 0 ? (
              <Typography color="text.secondary">
                Избранных задач пока нет.
              </Typography>
            ) : (
              <List disablePadding>
                {favorites.map(
                  (favorite) => (
                    <ListItem
                      key={favorite.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() =>
                            removeFavorite(
                              favorite.id
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          favorite.description
                        }
                      />
                    </ListItem>
                  )
                )}
              </List>
            )}
          </Stack>
        </Paper>

        <Paper>
          <Stack spacing={2} sx={{ p: 2 }}>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Отпуск, больничный и Day off
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Добавляйте и редактируйте
                периоды.
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={
                openCreateSpecialDay
              }
            >
              Добавить период
            </Button>

            <Divider />

            {specialDays.length === 0 ? (
              <Typography color="text.secondary">
                Периодов пока нет.
              </Typography>
            ) : (
              <List disablePadding>
                {specialDays.map(
                  (item) => (
                    <ListItem
                      key={item.id}
                      secondaryAction={
                        <Stack
                          direction="row"
                          spacing={0.5}
                        >
                          <IconButton
                            onClick={() =>
                              openEditSpecialDay(
                                item
                              )
                            }
                            aria-label="Редактировать"
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            color="error"
                            onClick={() =>
                              openDeleteSpecialDay(
                                item
                              )
                            }
                            aria-label="Удалить"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={getTypeLabel(
                          item.type
                        )}
                        secondary={`${item.startDate} — ${item.endDate}`}
                      />
                    </ListItem>
                  )
                )}
              </List>
            )}
          </Stack>
        </Paper>

        <Paper>
          <Stack spacing={2} sx={{ p: 2 }}>
            <BackupRestore />
          </Stack>
        </Paper>
      </Stack>

      <SpecialDayDialog
        open={dialogOpen}
        initialValues={
          selectedSpecialDay
            ? {
                startDate:
                  selectedSpecialDay.startDate,
                endDate:
                  selectedSpecialDay.endDate,
                type:
                  selectedSpecialDay.type,
              }
            : undefined
        }
        onClose={() =>
          setDialogOpen(false)
        }
        onSave={handleSaveSpecialDay}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Удалить период?"
        message={
          selectedSpecialDay
            ? `${getTypeLabel(
                selectedSpecialDay.type
              )}: ${
                selectedSpecialDay.startDate
              } — ${
                selectedSpecialDay.endDate
              }`
            : "Период будет удалён."
        }
        onCancel={() =>
          setDeleteOpen(false)
        }
        onConfirm={
          handleDeleteSpecialDay
        }
      />
    </Container>
  );
}
