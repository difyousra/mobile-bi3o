import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Alert } from "react-native";
import {
  useFavoritesPage,
  useToggleFavorite,
  useToggleFollow,
} from "../hooks/useEngagement";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

/**
 * Favoris / follow — API Phase 3 (JWT requis).
 * Remplace la persistance AsyncStorage locale.
 */
export function FavoritesProvider({ children }) {
  const { isAuthenticated, openAuth } = useAuth();
  const { products, favoriteIds, isLoading, isError, refetch, pageData } =
    useFavoritesPage(0, 48);
  const toggleMutation = useToggleFavorite();
  const followMutation = useToggleFollow();

  const isFavorite = useCallback(
    (id) => favoriteIds.has(String(id)),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    (id) => {
      if (!isAuthenticated) {
        Alert.alert(
          "Connexion requise",
          "Connectez-vous pour ajouter aux favoris.",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Se connecter", onPress: () => openAuth("signin") },
          ]
        );
        return;
      }
      const currentlyFavorite = favoriteIds.has(String(id));
      toggleMutation.mutate({
        annonceId: id,
        currentlyFavorite,
      });
    },
    [favoriteIds, toggleMutation, isAuthenticated, openAuth]
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
      isToggling: toggleMutation.isPending,
    }),
    [
      isLoading,
      isError,
      favoriteIds,
      products,
      pageData,
      isFavorite,
      toggleFavorite,
      unfollowSeller,
      followSeller,
      refetch,
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
