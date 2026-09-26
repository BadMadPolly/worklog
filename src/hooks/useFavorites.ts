import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

import type { FavoriteTask } from "../models/FavoriteTask";

import {
  loadFavoriteTasks,
  saveFavoriteTasks,
} from "../services/favoritesStorage";

import {
  GOOGLE_SHEETS_REFRESH_EVENT,
  loadFavoritesFromGoogleSheets,
  saveAllToGoogleSheets,
} from "../services/googleSheetsApi";

import type { GoogleSheetsData } from "../services/googleSheetsApi";

function sortFavorites(
  favorites: FavoriteTask[]
) {
  return [...favorites].sort((a, b) =>
    a.description.localeCompare(
      b.description,
      "ru"
    )
  );
}

export function useFavorites() {
  const [favorites, setFavorites] =
    useState<FavoriteTask[]>(() =>
      sortFavorites(loadFavoriteTasks())
    );

  const [googleLoaded, setGoogleLoaded] =
    useState(false);

  useEffect(() => {
    function handleGoogleRefresh(event: Event) {
      const customEvent =
        event as CustomEvent<GoogleSheetsData>;

      const normalizedFavorites: FavoriteTask[] =
        customEvent.detail.favorites.map((favorite) => ({
          id: favorite.id,
          description: favorite.description,
          createdAt: favorite.createdAt,
        }));

      setFavorites(sortFavorites(normalizedFavorites));
      saveFavoriteTasks(normalizedFavorites);
    }

    window.addEventListener(
      GOOGLE_SHEETS_REFRESH_EVENT,
      handleGoogleRefresh
    );

    return () => {
      window.removeEventListener(
        GOOGLE_SHEETS_REFRESH_EVENT,
        handleGoogleRefresh
      );
    };
  }, []);

  useEffect(() => {
    async function loadFromGoogle() {
      const localFavorites =
        loadFavoriteTasks();

      try {
        const googleFavorites =
          await loadFavoritesFromGoogleSheets();

        if (googleFavorites.length > 0) {
          const normalizedFavorites: FavoriteTask[] =
            googleFavorites.map((favorite) => ({
              id: favorite.id,
              description:
                favorite.description,
              createdAt: favorite.createdAt,
            }));

          setFavorites(
            sortFavorites(
              normalizedFavorites
            )
          );

          saveFavoriteTasks(
            normalizedFavorites
          );
        } else if (
          localFavorites.length > 0
        ) {
          setFavorites(
            sortFavorites(localFavorites)
          );

          await saveAllToGoogleSheets({
            favorites: localFavorites,
          });
        }
      } catch (error) {
        console.error(
          "Ошибка загрузки Favorites:",
          error
        );

        setFavorites(
          sortFavorites(localFavorites)
        );
      } finally {
        setGoogleLoaded(true);
      }
    }

    loadFromGoogle();
  }, []);

  useEffect(() => {
    if (!googleLoaded) {
      return;
    }

    saveFavoriteTasks(favorites);

    saveAllToGoogleSheets({
      favorites,
    }).catch((error) => {
      console.error(
        "Ошибка сохранения Favorites:",
        error
      );
    });
  }, [favorites, googleLoaded]);

  function addFavorite(
    description: string
  ): void {
    const normalized =
      description.trim();

    if (!normalized) {
      return;
    }

    const exists = favorites.some(
      (item) =>
        item.description.toLowerCase() ===
        normalized.toLowerCase()
    );

    if (exists) {
      return;
    }

    setFavorites((prev) =>
      sortFavorites([
        ...prev,
        {
          id: uuid(),
          description: normalized,
          createdAt:
            new Date().toISOString(),
        },
      ])
    );
  }

  function removeFavorite(
    id: string
  ): void {
    setFavorites((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  }

  return {
    favorites,
    addFavorite,
    removeFavorite,
  };
}