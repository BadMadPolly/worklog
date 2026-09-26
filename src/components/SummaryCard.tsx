import {
    Card,
    CardContent,
    Typography,
  } from "@mui/material";
  
  import ProgressSummary from "./ProgressSummary";
  
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
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography
            color="text.secondary"
            gutterBottom
          >
            {title}
          </Typography>
  
          <ProgressSummary
            value={value}
            total={total}
          />
        </CardContent>
      </Card>
    );
  }