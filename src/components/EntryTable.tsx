import {
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import type { WorklogEntry } from "../models/WorklogEntry";

interface EntryTableProps {
  entries: WorklogEntry[];
  onToggleWrittenOff: (id: string) => void;
  onEdit: (entry: WorklogEntry) => void;
  onDelete: (entry: WorklogEntry) => void;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (entry: WorklogEntry) => void;
}

export default function EntryTable({
  entries,
  onToggleWrittenOff,
  onEdit,
  onDelete,
  favoriteIds,
  onToggleFavorite,
}: EntryTableProps) {
  if (entries.length === 0) {
    return (
      <Paper
        sx={{
          py: 6,
          textAlign: "center",
        }}
      >
        <Typography variant="h6">
          Пока нет записей
        </Typography>

        <Typography color="text.secondary">
          Добавьте первую запись.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflowX: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Описание</TableCell>
            <TableCell width={80}>Часы</TableCell>
            <TableCell width={80}>Jira</TableCell>
            <TableCell width={55}>⭐</TableCell>
            <TableCell width={55} />
            <TableCell width={55} />
          </TableRow>
        </TableHead>

        <TableBody>
          {entries.map((entry) => {
            const isFavorite =
              favoriteIds?.has(entry.id) ?? false;

            return (
              <TableRow key={entry.id}>
                <TableCell>{entry.description}</TableCell>

                <TableCell>
                  {entry.hours.toFixed(1)}
                </TableCell>

                <TableCell>
                  <Checkbox
                    checked={entry.writtenOff}
                    onChange={() =>
                      onToggleWrittenOff(entry.id)
                    }
                  />
                </TableCell>

                <TableCell>
                  {onToggleFavorite && (
                    <IconButton
                      size="small"
                      aria-label={
                        isFavorite
                          ? "Убрать из избранного"
                          : "Добавить в избранное"
                      }
                      onClick={() =>
                        onToggleFavorite(entry)
                      }
                    >
                      {isFavorite ? (
                        <StarIcon color="warning" />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>
                  )}
                </TableCell>

                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(entry)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>

                <TableCell>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(entry)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
