import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  useInfiniteFavorites,
  useToggleFavorite,
  useToggleFollow,
} from "../hooks/useEngagement";
import { useAuth } from "./AuthContext";
import { returnToTab } from "../navigation/authRoutes";

const FavoritesContext = createContext(null);

/**
 * Favoris / follow — API Phase 3 (JWT requis).
 * Remplace la persistance AsyncStorage locale.
 */
export function FavoritesProvider({ children }) {
  const { isAuthenticated, requireAuth } = useAuth();
  const {
    products,
    favoriteIds,
    isLoading,
    isError,
    refetch,
    pageData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfiniteFavorites(24);
  const toggleMutation = useToggleFavorite();
  const followMutation = useToggleFollow();

  const isFavorite = useCallback(
    (id) => favoriteIds.has(String(id)),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    (id) => {
      if (!isAuthenticated) {
        requireAuth(returnToTab("Favorites"));
        return;
      }
      const currentlyFavorite = favoriteIds.has(String(id));
      toggleMutation.mutate({
        annonceId: id,
        currentlyFavorite,
      });
    },
    [favoriteIds, toggleMutation, isAuthenticated, requireAuth]
  );

  const unfollowSeller = useCallback(
    (sellerId) => {
      followMutation.mutate({
        sellerId,
        currentlyFollowing: true,
      });
    },
    [followMutation]
  );

  const followSeller = useCallback(
    (sellerId) => {
      followMutation.mutate({
        sellerId,
        currentlyFollowing: false,
      });
    },
    [followMutation]
  );

  const value = useMemo(
    () => ({
      isReady: !isLoading,
      isLoading,
      isError,
      isRefetching,
      favoriteIds,
      products,
      pageData,
      savedSellers: [],
      isFavorite,
      toggleFavorite,
      removeSavedSeller: unfollowSeller,
      followSeller,
      unfollowSeller,
      refetch,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isToggling: toggleMutation.isPending,
    }),
    [
      isLoading,
      isError,
      isRefetching,
      favoriteIds,
      products,
      pageData,
      isFavorite,
      toggleFavorite,
      unfollowSeller,
      followSeller,
      refetch,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      toggleMutation.isPending,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
