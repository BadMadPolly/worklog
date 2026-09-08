import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import SummaryCard from "../../components/SummaryCard";
import EntryTable from "../../components/EntryTable";

import type { WorklogEntry } from "../../models/WorklogEntry";

const initialEntries: WorklogEntry[] = [
  {
    id: "1",
    description: "Разработка CFB",
    hours: 2.5,
    date: "2026-09-09",
    writtenOff: false,
  },
  {
    id: "2",
    description: "Исправление бага",
    hours: 3,
    date: "2026-09-09",
    writtenOff: true,
  },
];

export default function TodayPage() {
  const [entries, setEntries] = useState(initialEntries);

  const totalHours = useMemo(
    () => entries.reduce((sum, x) => sum + x.hours, 0),
    [entries]
  );

  const writtenOffHours = useMemo(
    () =>
      entries
        .filter((x) => x.writtenOff)
        .reduce((sum, x) => sum + x.hours, 0),
    [entries]
  );

  function toggleWrittenOff(id: string) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              writtenOff: !entry.writtenOff,
            }
          : entry
      )
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
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
          onToggleWrittenOff={toggleWrittenOff}
        />

        <Button
          variant="contained"
          size="large"
        >
          Добавить запись
        </Button>
      </Stack>
    </Container>
  );
}