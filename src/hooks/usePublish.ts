import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import * as publishService from "../services/publishService";
import {
  collectLocalPhotos,
  draftToCreateDto,
} from "../models/publishMapper";
import { useAuth } from "../context/AuthContext";
import type { CreateAnnonceDto, LocalPhoto } from "../types/publish";

export function useMyManagedAds(page = 0, size = 20) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.myAds(page),
    queryFn: () => publishService.fetchMyManagedAds({ page, size }),
    staleTime: 30_000,
    enabled: isAuthenticated,
  });
}

export function usePauseAnnonce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => publishService.pauseAnnonce(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["annonces", "me", "manage"] });
    },
  });
}

export function useReactivateAnnonce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => publishService.reactivateAnnonce(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["annonces", "me", "manage"] });
    },
  });
}

export function useDeleteAnnonce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => publishService.deleteAnnonce(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["annonces", "me", "manage"] });
    },
  });
}

export type PublishResult = {
  id: number;
  moderationScore?: number;
};

/**
 * Flux documenté : moderation/check → POST /annonces (multipart) ou /annonces/json
 */
export function usePublishAnnonce() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (draft: Record<string, unknown>): Promise<PublishResult> => {
      const dto = draftToCreateDto(draft);
      const photos = collectLocalPhotos(
        draft.photos as Record<string, string | LocalPhoto> | undefined
      );

      const moderation = await publishService.checkModeration({
        titre: dto.titre,
        description: dto.description,
      });

      if (moderation.allowed === false) {
        throw Object.assign(
          new Error(
            moderation.reason ??
              "Annonce refusée par la modération."
          ),
          { code: "MODERATION_REJECTED", score: moderation.score }
        );
      }

      let created: { id: number };
      if (photos.length > 0) {
        created = await publishService.createAnnonceMultipart(dto, photos);
      } else {
        created = await publishService.createAnnonceJson(dto);
      }

      if (!created?.id) {
        throw Object.assign(
          new Error("Création réussie mais id manquant dans la réponse."),
          { code: "MISSING_CREATED_ID" }
        );
      }

      return { id: created.id, moderationScore: moderation.score };
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["annonces", "me", "manage"] });
      qc.invalidateQueries({ queryKey: ["annonces", "public"] });
    },
  });
}

export type { CreateAnnonceDto };
