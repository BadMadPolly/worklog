import { LinearProgress, Stack, Typography } from "@mui/material";

interface ProgressSummaryProps {
  value: number;
  total: number;
}

export default function ProgressSummary({
  value,
  total,
}: ProgressSummaryProps) {
  const percent =
    total === 0 ? 0 : Math.min((value / total) * 100, 100);

  return (
    <Stack spacing={1}>
      <Typography variant="h4" fontWeight={700}>
        {value.toFixed(1)} / {total.toFixed(1)}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 10,
          borderRadius: 999,
        }}
      />
    </Stack>
  );
}