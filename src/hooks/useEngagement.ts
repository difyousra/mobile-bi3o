import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import * as engagement from "../services/engagementService";
import { mapAdCardToUi } from "../models/adMapper";
import { extractEurToDzd } from "../services/exchangeService";
import { useAuth } from "../context/AuthContext";
import { useExchangeRate } from "./useCatalog";
import type { AdCard } from "../types/catalog";
import type { FavoritePage } from "../types/engagement";

function toId(id: number | string): string {
  return String(id);
}

export function useFavoritesPage(page = 0, size = 24) {
  const { isAuthenticated } = useAuth();
  const eurToDzd = extractEurToDzd(useExchangeRate().data);

  const query = useQuery({
    queryKey: queryKeys.favorites(page),
    queryFn: () => engagement.fetchFavorites({ page, size }),
    staleTime: 60_000,
    enabled: isAuthenticated,
  });

  const products =
    query.data?.content.map((ad) => mapAdCardToUi(ad, { eurToDzd })) ?? [];

  const favoriteIds = new Set(products.map((p) => toId(p.id)));

  return { ...query, products, favoriteIds, pageData: query.data };
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      annonceId,
      currentlyFavorite,
    }: {
      annonceId: number | string;
      currentlyFavorite: boolean;
    }) => {
      if (currentlyFavorite) {
        await engagement.removeFavorite(annonceId);
      } else {
        await engagement.addFavorite(annonceId);
      }
    },
    onMutate: async ({ annonceId, currentlyFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ["me", "favoris"] });
      const previous = queryClient.getQueriesData<FavoritePage>({
        queryKey: ["me", "favoris"],
      });

      queryClient.setQueriesData<FavoritePage>(
        { queryKey: ["me", "favoris"] },
        (old) => {
          if (!old) return old;
          const idNum = Number(annonceId);
          if (currentlyFavorite) {
            return {
              ...old,
              content: old.content.filter((ad) => ad.id !== idNum),
              totalElements: Math.max(0, old.totalElements - 1),
            };
          }
          const stub: AdCard = {
            id: idNum,
            titre: "Annonce",
          };
          return {
            ...old,
            content: [stub, ...old.content.filter((ad) => ad.id !== idNum)],
            totalElements: old.totalElements + 1,
          };
        }
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "favoris"] });
    },
  });
}

export function useFollowStatus(sellerId: number | string | undefined) {
  return useQuery({
    queryKey: queryKeys.followStatus(sellerId ?? "none"),
    queryFn: () => engagement.fetchFollowStatus(sellerId as number),
    enabled: sellerId != null && Number(sellerId) > 0,
    staleTime: 60_000,
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sellerId,
      currentlyFollowing,
    }: {
      sellerId: number | string;
      currentlyFollowing: boolean;
    }) => {
      if (currentlyFollowing) {
        await engagement.unfollowSeller(sellerId);
      } else {
        await engagement.followSeller(sellerId);
      }
    },
    onMutate: async ({ sellerId, currentlyFollowing }) => {
      const key = queryKeys.followStatus(sellerId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<boolean>(key);
      queryClient.setQueryData(key, !currentlyFollowing);
      return { previous, key };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.key) queryClient.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.followStatus(vars.sellerId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.followedSellers });
    },
  });
}

export function useNotifications(page = 0, size = 20) {
  return useQuery({
    queryKey: queryKeys.notifications(page),
    queryFn: () => engagement.fetchNotifications({ page, size }),
    staleTime: 30_000,
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: queryKeys.notificationsUnread,
    queryFn: engagement.fetchUnreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => engagement.markNotificationRead(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => engagement.markAllNotificationsRead(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "notifications"] });
    },
  });
}

/**
 * Liste des vendeurs suivis (tab "Mes vendeurs" dans Favoris).
 * Backend : GET /users/me/following
 */
export function useFollowedSellers() {
  return useQuery({
    queryKey: queryKeys.followedSellers,
    queryFn: () => engagement.fetchFollowedSellers({ page: 0, size: 50 }),
    staleTime: 60_000,
  });
}

export function useSavedSearches() {
  return useQuery({
    queryKey: queryKeys.savedSearches,
    queryFn: engagement.fetchSavedSearches,
    staleTime: 60_000,
  });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { query: string; label?: string }) =>
      engagement.createSavedSearch(payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedSearches });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => engagement.deleteSavedSearch(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedSearches });
    },
  });
}
