import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import * as messagerieService from "../services/messagerieService";
import * as reservationService from "../services/reservationService";
import {
  mapConversationToUi,
  mapMessageToUi,
} from "../models/messagingMapper";
import { useAuth } from "../context/AuthContext";
import type { LocalPhoto } from "../types/publish";
import type { UiConversation, UiMessage } from "../types/messaging";

const POLL_MS = 12_000;

export function useConversations(page = 0, size = 50) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.conversations, page, size],
    queryFn: async (): Promise<UiConversation[]> => {
      const pageData = await messagerieService.fetchConversations({ page, size });
      return (pageData.content ?? []).map((c) => mapConversationToUi(c));
    },
    staleTime: 15_000,
    refetchInterval: isAuthenticated ? POLL_MS : false,
    enabled: isAuthenticated,
  });
}

export function useConversationMessages(
  conversationId: number | string | undefined,
  currentUserId?: number | null
) {
  return useQuery({
    queryKey: [
      ...queryKeys.messages(Number(conversationId) || 0),
      currentUserId ?? "anon",
    ],
    queryFn: async (): Promise<UiMessage[]> => {
      const pageData = await messagerieService.fetchMessages(conversationId!);
      const items = pageData.content ?? [];
      // API souvent chronologique asc ; sinon reverse si besoin côté affichage
      return items.map((m) => mapMessageToUi(m, currentUserId));
    },
    enabled: conversationId != null && conversationId !== "",
    staleTime: 5_000,
    refetchInterval: POLL_MS,
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      annonceId,
      message,
    }: {
      annonceId: number | string;
      message: string;
    }) =>
      messagerieService.startConversation(annonceId, { message }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useSendMessage(conversationId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      messagerieService.sendMessage(conversationId, { body: text }),
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.messages(Number(conversationId) || 0),
      });
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useSendChatImage(conversationId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (image: LocalPhoto) =>
      messagerieService.sendConversationMedia(conversationId, image),
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.messages(Number(conversationId) || 0),
      });
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useSendChatAudio(conversationId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (audio: LocalPhoto) =>
      messagerieService.sendConversationMedia(conversationId, audio),
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.messages(Number(conversationId) || 0),
      });
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useArchiveConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number | string) =>
      messagerieService.archiveConversation(conversationId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useReservationCalendar(annonceId?: number | string) {
  return useQuery({
    queryKey: queryKeys.reservationCalendar(annonceId ?? 0),
    queryFn: () => reservationService.fetchReservationCalendar(annonceId!),
    enabled: annonceId != null && annonceId !== "",
    staleTime: 60_000,
  });
}

export function useMyReservations(page = 0) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.myReservations(page),
    queryFn: () => reservationService.fetchMyReservations({ page, size: 20 }),
    staleTime: 30_000,
    enabled: isAuthenticated,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      annonceId,
      body,
    }: {
      annonceId: number | string;
      body: Record<string, unknown>;
    }) => reservationService.createReservation(annonceId, body),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
