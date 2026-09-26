import { useState } from "react";

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/ConfirmDialog";
import EntryDialog from "../../components/EntryDialog";
import EntryTable from "../../components/EntryTable";
import SummaryCard from "../../components/SummaryCard";

import { useWorklog } from "../../hooks/useWorklog";
import type {
  EntryFormData,
  WorklogEntry,
} from "../../models/WorklogEntry";

export default function TodayPage() {
  const {
    entries,
    totalHours,
    writtenOffHours,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleWrittenOff,
  } = useWorklog();

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [selectedEntry, setSelectedEntry] =
    useState<WorklogEntry>();

  function openCreateDialog() {
    setSelectedEntry(undefined);
    setDialogOpen(true);
  }

  function openEditDialog(
    entry: WorklogEntry
  ) {
    setSelectedEntry(entry);
    setDialogOpen(true);
  }

  function openDeleteDialog(
    entry: WorklogEntry
  ) {
    setSelectedEntry(entry);
    setDeleteOpen(true);
  }

  function handleSave(data: EntryFormData) {
    if (selectedEntry) {
      updateEntry(selectedEntry.id, data);
    } else {
      addEntry(data);
    }

    setDialogOpen(false);
  }

  function handleDelete() {
    if (!selectedEntry) return;

    deleteEntry(selectedEntry.id);

    setDeleteOpen(false);
  }

  return (
    <>
      <Container
        maxWidth="md"
        sx={{ py: 4 }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
            >
              Сегодня
            </Typography>

            <Typography color="text.secondary">
              Worklog
            </Typography>
          </Box>

          <SummaryCard
            title="Всего часов"
            value={totalHours}
            total={8}
          />

          <SummaryCard
            title="Списано"
            value={writtenOffHours}
            total={totalHours}
          />

          <Typography variant="h6">
            Записи
          </Typography>

          <EntryTable
            entries={entries}
            onToggleWrittenOff={
              toggleWrittenOff
            }
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />

          <Button
            variant="contained"
            size="large"
            onClick={openCreateDialog}
          >
            Добавить запись
          </Button>
        </Stack>
      </Container>

      <EntryDialog
        open={dialogOpen}
        entry={selectedEntry}
        onClose={() =>
          setDialogOpen(false)
        }
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