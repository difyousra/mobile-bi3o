/**
 * Temps réel + bannières :
 * - STOMP si dispo
 * - Polling REST qui détecte les nouvelles notifs → bannière in-app (Expo Go + web)
 * - Push OS uniquement sur native (pas Expo Go Android remote / pas web)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform, StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import { queryKeys } from "../api/queryKeys";
import {
  connectNotificationsStomp,
  disconnectNotificationsStomp,
  isStompConnected,
} from "../services/notificationsStomp";
import {
  presentLocalBanner,
  registerPushTokenWithBackend,
  requestNotificationPermission,
  ensureNotificationPrefsLoaded,
} from "../services/pushNotifications";
import * as engagement from "../services/engagementService";
import { isNotificationTypeAllowed } from "../services/notificationPreferencesService";
import { navigate } from "../navigation/navigationRef";
import InAppNotificationBanner from "../components/notifications/InAppNotificationBanner";

const isNative = Platform.OS === "ios" || Platform.OS === "android";
const POLL_MS = 5_000;

function openFromNotificationData(data) {
  if (!data) {
    navigate("Notifications");
    return;
  }
  const type = String(data.type || "").toUpperCase();
  if (type === "MESSAGE" && data.conversationId) {
    navigate("Messages", {
      screen: "Chat",
      params: { conversationId: data.conversationId },
    });
    return;
  }
  if (
    (type === "RESERVATION_REQUEST" || type === "RESERVATION_STATUS") &&
    data.reservationId
  ) {
    navigate("MyReservations", { reservationId: data.reservationId });
    return;
  }
  if (data.annonceId) {
    navigate("ProductDetail", { annonceId: data.annonceId });
    return;
  }
  navigate("Notifications");
}

export function NotificationsRealtimeProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);
  const [toast, setToast] = useState(null);
  const lastToastIdRef = useRef(null);
  const knownMaxIdRef = useRef(null);
  const bootstrappedRef = useRef(false);

  const showToast = useCallback((payload) => {
    if (!payload) return;
    if (!isNotificationTypeAllowed(payload.type)) return;
    const id = payload.id ?? `${payload.type}-${payload.createdAt}-${Date.now()}`;
    if (lastToastIdRef.current === id) return;
    lastToastIdRef.current = id;
    setToast({ ...payload, _toastId: id });

    // Bannière OS native (ignore web / permission refusée)
    if (isNative) {
      presentLocalBanner(payload).catch(() => {});
    }
  }, []);

  const invalidateLists = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["me", "notifications"] });
  }, [queryClient]);

  /** Détecte une nouvelle notif via REST (filet si STOMP muet). */
  const pollForNew = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const page = await engagement.fetchNotifications({ page: 0, size: 5 });
      const items = page?.content ?? page?.items ?? [];
      const newest = items[0];
      const newestId = newest?.id != null ? Number(newest.id) : null;

      if (!bootstrappedRef.current) {
        bootstrappedRef.current = true;
        knownMaxIdRef.current = newestId;
        return;
      }

      if (newestId != null && knownMaxIdRef.current != null && newestId > knownMaxIdRef.current) {
        // Afficher la plus récente non encore vue (et celles entre-deux si besoin)
        const previousMax = knownMaxIdRef.current;
        const fresh = items.filter((n) => Number(n.id) > previousMax);
        knownMaxIdRef.current = newestId;
        const toShow = fresh[0] || newest;
        showToast(toShow);
        invalidateLists();
        queryClient.invalidateQueries({
          queryKey: queryKeys.notificationsUnread,
        });
        return;
      }

      if (newestId != null) {
        knownMaxIdRef.current = Math.max(knownMaxIdRef.current ?? 0, newestId);
      }

      // Toujours rafraîchir le badge
      const count = await engagement.fetchUnreadCount();
      queryClient.setQueryData(queryKeys.notificationsUnread, count);
    } catch {
      // ignore network
    }
  }, [isAuthenticated, invalidateLists, queryClient, showToast]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer = null;
    let notifSubs = [];

    const start = async () => {
      if (!isAuthenticated) {
        await disconnectNotificationsStomp();
        bootstrappedRef.current = false;
        knownMaxIdRef.current = null;
        if (pollTimer) clearInterval(pollTimer);
        return;
      }
      if (cancelled) return;

      if (isNative) {
        requestNotificationPermission().catch(() => {});
        registerPushTokenWithBackend().catch(() => {});
      }
      ensureNotificationPrefsLoaded().catch(() => {});

      await connectNotificationsStomp({
        onNotification: (payload) => {
          const id = payload?.id != null ? Number(payload.id) : null;
          if (id != null) {
            knownMaxIdRef.current = Math.max(knownMaxIdRef.current ?? 0, id);
          }
          invalidateLists();
          showToast(payload);
        },
        onUnreadCount: (count) => {
          queryClient.setQueryData(queryKeys.notificationsUnread, count);
          queryClient.invalidateQueries({
            queryKey: queryKeys.notificationsInfinite,
          });
        },
        onConnected: () => {
          invalidateLists();
        },
      });

      // Bootstrap + polling (indispensable sur web / si STOMP instable)
      await pollForNew();
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(() => {
        if (!cancelled) pollForNew();
      }, isStompConnected() ? POLL_MS * 2 : POLL_MS);
    };

    start();

    const sub = AppState.addEventListener("change", (next) => {
      const wasBg =
        appState.current === "background" || appState.current === "inactive";
      appState.current = next;
      if (wasBg && next === "active" && isAuthenticated) {
        pollForNew();
        if (!isStompConnected()) start();
      }
    });

    if (isNative) {
      try {
        // Import dynamique pour éviter plantage web au chargement du module parent
        // eslint-disable-next-line global-require
        const Notifications = require("expo-notifications");
        notifSubs.push(
          Notifications.addNotificationReceivedListener(() => {
            invalidateLists();
          })
        );
        notifSubs.push(
          Notifications.addNotificationResponseReceivedListener((response) => {
            openFromNotificationData(
              response?.notification?.request?.content?.data
            );
          })
        );
      } catch {
        // Expo Go web / runtime sans module natif
      }
    }

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      sub.remove();
      notifSubs.forEach((s) => s?.remove?.());
      disconnectNotificationsStomp();
    };
  }, [
    isAuthenticated,
    queryClient,
    showToast,
    invalidateLists,
    pollForNew,
  ]);

  return (
    <View style={styles.host} collapsable={false}>
      {children}
      <InAppNotificationBanner
        notification={toast}
        onPress={(n) => openFromNotificationData(n)}
        onDismiss={() => setToast(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
});
