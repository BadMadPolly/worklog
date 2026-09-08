import {
    Checkbox,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
  } from "@mui/material";
  
  import EditIcon from "@mui/icons-material/Edit";
  import DeleteIcon from "@mui/icons-material/Delete";
  
  import type { WorklogEntry } from "../models/WorklogEntry";
  
  interface Props {
    entries: WorklogEntry[];
    onToggleWrittenOff: (id: string) => void;
  }
  
  export default function EntryTable({
    entries,
    onToggleWrittenOff,
  }: Props) {
    return (
      <Paper elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={60}>✔</TableCell>
              <TableCell>Задача</TableCell>
              <TableCell width={90}>Часы</TableCell>
              <TableCell width={100}></TableCell>
            </TableRow>
          </TableHead>
  
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Checkbox
                    checked={entry.writtenOff}
                    onChange={() => onToggleWrittenOff(entry.id)}
                  />
                </TableCell>
  
                <TableCell>{entry.description}</TableCell>
  
                <TableCell>{entry.hours}</TableCell>
  
                <TableCell align="right">
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
  
                  <IconButton size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }