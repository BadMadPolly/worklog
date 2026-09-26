import { useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  CircularProgress,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import TodayIcon from "@mui/icons-material/Today";

import { refreshAllFromGoogleSheets } from "../services/googleSheetsApi";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  const value = location.pathname.startsWith("/day")
    ? "/day"
    : location.pathname.startsWith("/settings")
      ? "/settings"
      : "/calendar";

  async function handleRefresh() {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await refreshAllFromGoogleSheets();
    } catch (error) {
      console.error(
        "Не удалось обновить данные из Google Sheets:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ flex: 1 }}
          >
            Worklog
          </Typography>

          <Button
            color="inherit"
            startIcon={
              refreshing ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <RefreshIcon />
              )
            }
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {refreshing ? "Обновление…" : "Обновить данные"}
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          pb: 8,
        }}
      >
        <Outlet />
      </Box>

      <Paper
        elevation={6}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <BottomNavigation
          value={value}
          onChange={(_, newValue) =>
            navigate(newValue)
          }
        >
          <BottomNavigationAction
            value="/calendar"
            label="Календарь"
            icon={<CalendarMonthIcon />}
          />

          <BottomNavigationAction
            value="/day"
            label="Сегодня"
            icon={<TodayIcon />}
          />

          <BottomNavigationAction
            value="/settings"
            label="Настройки"
            icon={<SettingsIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
