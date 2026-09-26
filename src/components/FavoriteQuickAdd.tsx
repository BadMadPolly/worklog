import {
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import StarIcon from "@mui/icons-material/Star";

import type { FavoriteTask } from "../models/FavoriteTask";

interface FavoriteQuickAddProps {
  favorites: FavoriteTask[];
  onSelect: (favorite: FavoriteTask) => void;
}

export default function FavoriteQuickAdd({
  favorites,
  onSelect,
}: FavoriteQuickAddProps) {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >
          <StarIcon color="warning" fontSize="small" />

          <Typography fontWeight={700}>
            Быстрое добавление
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: "wrap",
            rowGap: 1,
          }}
        >
          {favorites.map((favorite) => (
            <Button
              key={favorite.id}
              variant="outlined"
              size="small"
              onClick={() => onSelect(favorite)}
            >
              {favorite.description}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
