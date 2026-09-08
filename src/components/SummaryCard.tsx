import { Card, CardContent, LinearProgress, Typography } from "@mui/material";

interface SummaryCardProps {
  title: string;
  value: number;
  total: number;
}

export default function SummaryCard({
  title,
  value,
  total,
}: SummaryCardProps) {
  const percent = total === 0 ? 0 : (value / total) * 100;

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          {value} / {total}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={Math.min(percent, 100)}
          sx={{
            height: 10,
            borderRadius: 5,
          }}
        />
      </CardContent>
    </Card>
  );
}