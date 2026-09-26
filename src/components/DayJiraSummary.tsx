import {
  Box,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface DayJiraSummaryProps {
  loggedHours: number;
  writtenOffHours: number;
  plannedHours: number;
}

export default function DayJiraSummary({
  loggedHours,
  writtenOffHours,
  plannedHours,
}: DayJiraSummaryProps) {
  const notWrittenOffHours = Math.max(
    loggedHours - writtenOffHours,
    0
  );

  const progress =
    loggedHours > 0
      ? Math.min(
          (writtenOffHours / loggedHours) * 100,
          100
        )
      : 0;

  const status =
    notWrittenOffHours === 0
      ? "success"
      : "warning";

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Списание в Jira
            </Typography>

            <Typography
              variant="h6"
              fontWeight={700}
            >
              {writtenOffHours.toFixed(1)} /{" "}
              {loggedHours.toFixed(1)} ч
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color={
              status === "success"
                ? "success.main"
                : "warning.main"
            }
            fontWeight={700}
            textAlign="right"
          >
            {notWrittenOffHours === 0
              ? "Всё списано"
              : `Осталось списать ${notWrittenOffHours.toFixed(
                  1
                )} ч`}
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progress}
          color={status}
          sx={{ height: 8, borderRadius: 4 }}
        />

        <Stack
          direction="row"
          justifyContent="space-between"
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Внесено: {loggedHours.toFixed(1)} ч
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Норма дня: {plannedHours.toFixed(1)} ч
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
