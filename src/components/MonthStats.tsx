import {
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

interface MonthStatsProps {
  accountedHours: number;
  plannedHours: number;
  loggedHours: number;
  specialDayHours: number;
  writtenOffHours: number;
  remainingHours: number;
  workingDays: number;
  completedDays: number;
  attentionDays: number;
  specialDays: number;
}

function Stat({
  title,
  value,
  secondary,
}: {
  title: string;
  value: string;
  secondary?: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: "100%",
      }}
    >
      <Stack spacing={0.5}>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {title}
        </Typography>

        <Typography
          variant="h5"
          fontWeight={700}
        >
          {value}
        </Typography>

        {secondary && (
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {secondary}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function MonthStats({
  accountedHours,
  plannedHours,
  loggedHours,
  specialDayHours,
  writtenOffHours,
  remainingHours,
  workingDays,
  completedDays,
  attentionDays,
  specialDays,
}: MonthStatsProps) {
  return (
    <Grid container spacing={1.5}>
      <Grid xs={6} sm={4}>
        <Stat
          title="Учтено времени"
          value={`${accountedHours.toFixed(1)} ч`}
          secondary={`из ${plannedHours.toFixed(1)} ч`}
        />
      </Grid>

      <Grid xs={6} sm={4}>
        <Stat
          title="Осталось"
          value={`${remainingHours.toFixed(1)} ч`}
          secondary={`внесено: ${loggedHours.toFixed(
            1
          )} ч`}
        />
      </Grid>

      <Grid xs={6} sm={4}>
        <Stat
          title="В Jira"
          value={`${writtenOffHours.toFixed(1)} ч`}
          secondary={
            specialDayHours > 0
              ? `особые дни: ${specialDayHours.toFixed(1)} ч`
              : undefined
          }
        />
      </Grid>

      <Grid xs={6} sm={4}>
        <Stat
          title="Рабочих дней"
          value={`${completedDays} / ${workingDays}`}
          secondary={`внимание: ${attentionDays}`}
        />
      </Grid>

      <Grid xs={6} sm={4}>
        <Stat
          title="Особых дней"
          value={`${specialDays}`}
          secondary="отпуск / больничный / Day off"
        />
      </Grid>
    </Grid>
  );
}
