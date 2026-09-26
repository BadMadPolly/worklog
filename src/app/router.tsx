import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import CalendarPage from "../pages/CalendarPage";
import DayPage from "../pages/DayPage";
import SettingsPage from "../pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/calendar" replace />,
      },
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      {
        path: "day",
        element: <DayPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
