import { useRef, useState } from "react";

import {
  Alert,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import {
  downloadBackup,
  restoreBackup,
} from "../services/backup";

export default function BackupRestore() {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [error, setError] =
    useState("");

  async function handleRestore(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    try {
      await restoreBackup(file);
    } catch {
      setError(
        "Не удалось восстановить резервную копию. Проверьте файл."
      );
    } finally {
      event.target.value = "";
    }
  }

  return (
    <Stack spacing={2}>
      <div>
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Резервная копия
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Скачайте копию всех записей, избранных
          задач и периодов отпуска/больничного.
        </Typography>
      </div>

      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={downloadBackup}
      >
        Скачать резервную копию
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleRestore}
      />

      <Button
        variant="outlined"
        startIcon={<UploadFileIcon />}
        onClick={() => inputRef.current?.click()}
      >
        Восстановить из файла
      </Button>

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}
    </Stack>
  );
}
