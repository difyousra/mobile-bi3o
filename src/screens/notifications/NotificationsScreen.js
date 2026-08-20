import { useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useInfiniteNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useReservationNotificationAction,
} from "../../hooks/useEngagement";
import { colors } from "../../theme/colors";
import { useTabBarInset } from "../../hooks/useTabBarInset";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

function notificationTitle(item, t) {
  return (
    item.title ??
    item.titre ??
    item.type ??
    t("mobile.notifications.fallbackTitle")
  );
}

function notificationBody(item) {
  return item.excerpt || item.message || item.body || "";
}

function isRead(item) {
  return Boolean(item.read ?? item.lu);
}

function typeLabel(type, t) {
  const key = String(type || "").toUpperCase();
  if (key === "MESSAGE") return t("mobile.notifications.typeMessage");
  if (key === "RESERVATION_REQUEST")
    return t("mobile.notifications.typeReservationRequest");
  if (key === "RESERVATION_STATUS")
    return t("mobile.notifications.typeReservationStatus");
  if (key === "FOLLOW") return t("mobile.notifications.typeFollow");
  if (key === "FAVORITE") return t("mobile.notifications.typeFavorite");
  if (key === "AD_VIEW") return t("mobile.notifications.typeAdView");
  if (key === "WHATSAPP_CLICK") return t("mobile.notifications.typeWhatsapp");
  if (key === "REPORT" || key === "REPORT_RESOLVED")
    return t("mobile.notifications.typeReport");
  if (key === "AD_FROM_FOLLOWED")
    return t("mobile.notifications.typeFollowedAd");
  if (key === "AD_PUBLISHED") return t("mobile.notifications.typePublished");
  if (key === "SYSTEM") return t("mobile.notifications.typeSystem");
  if (key === "REMINDER") return t("mobile.notifications.typeReminder");
  return "";
}

function typeIcon(type) {
  const key = String(type || "").toUpperCase();
  if (key === "MESSAGE") return "chatbubble-outline";
  if (key.startsWith("RESERVATION")) return "calendar-outline";
  if (key === "FOLLOW") return "person-add-outline";
  if (key === "FAVORITE") return "heart-outline";
  if (key === "AD_VIEW") return "eye-outline";
  if (key === "WHATSAPP_CLICK") return "logo-whatsapp";
  if (key === "REPORT" || key === "REPORT_RESOLVED") return "flag-outline";
  if (key === "AD_FROM_FOLLOWED" || key === "AD_PUBLISHED")
    return "pricetag-outline";
  if (key === "REMINDER") return "alarm-outline";
  return "notifications-outline";
}

function Avatar({ item }) {
  const uri = resolveMediaUrl(item.actorAvatarUrl);
  const initials =
    item.actorInitials ||
    String(item.actorName || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() ||
    "?";

  if (uri) {
    return <Image source={{ uri }} style={styles.avatar} />;
  }

  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarInitials}>{initials.slice(0, 2)}</Text>
    </View>
  );
}

export default function NotificationsScreen({ navigation }) {
  const { t, language } = useAppLanguage();
  const tabBarInset = useTabBarInset();
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications(20);
  const { data: unread = 0 } = useUnreadNotificationsCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const reservationAction = useReservationNotificationAction();

  const items = useMemo(
    () => data?.pages?.flatMap((p) => p.content ?? []) ?? [],
    [data]
  );

  const ensureRead = useCallback(
    async (item) => {
      if (!isRead(item)) {
        try {
          await markRead.mutateAsync(item.id);
        } catch {
          // navigation continues even if mark-read fails
        }
      }
    },
    [markRead]
  );

  const openDeepLink = useCallback(
    async (item) => {
      await ensureRead(item);
      const type = String(item.type || "").toUpperCase();

      if (type === "MESSAGE" && item.conversationId) {
        navigation.navigate("Messages", {
          screen: "Chat",
          params: { conversationId: item.conversationId },
        });
        return;
      }

      if (
        (type === "RESERVATION_REQUEST" || type === "RESERVATION_STATUS") &&
        item.reservationId
      ) {
        navigation.navigate("MyReservations", {
          reservationId: item.reservationId,
        });
        return;
      }

      if (type === "FOLLOW" && item.actorUserId) {
        navigation.navigate("SellerProfile", { sellerId: item.actorUserId });
        return;
      }

      if (item.annonceId) {
        navigation.navigate("ProductDetail", { annonceId: item.annonceId });
        return;
      }

      if (item.conversationId) {
        navigation.navigate("Messages", {
          screen: "Chat",
          params: { conversationId: item.conversationId },
        });
      }
    },
    [ensureRead, navigation]
  );

  const handleReservationBtn = useCallback(
    (item, action) => {
      if (!item.reservationId) return;
      const labels = {
        accept: t("mobile.notifications.acceptConfirm"),
        reject: t("mobile.notifications.rejectConfirm"),
        dismiss: t("mobile.notifications.dismissConfirm"),
      };
      Alert.alert(
        t("mobile.notifications.actionTitle"),
        labels[action] || "",
        [
          { text: t("mobile.common.cancel"), style: "cancel" },
          {
            text: t("mobile.listings.confirm"),
            style: action === "reject" ? "destructive" : "default",
            onPress: () =>
              reservationAction.mutate({
                notificationId: item.id,
                reservationId: item.reservationId,
                action,
              }),
          },
        ]
      );
    },
    [reservationAction, t]
  );

  const renderItem = ({ item }) => {
    const read = isRead(item);
    const type = String(item.type || "").toUpperCase();
    const label = typeLabel(type, t);
    const isReservationRequest = type === "RESERVATION_REQUEST" && item.reservationId;
    const primary = item.primaryAction;
    const secondary = item.secondaryAction;

    return (
      <TouchableOpacity
        style={[styles.row, !read && styles.rowUnread]}
        activeOpacity={0.85}
        onPress={() => openDeepLink(item)}
      >
        <View style={styles.avatarWrap}>
          {item.actorName || item.actorAvatarUrl ? (
            <Avatar item={item} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons
                name={typeIcon(type)}
                size={18}
                color={colors.textMuted}
              />
            </View>
          )}
        </View>

        <View style={styles.rowBody}>
          {label ? <Text style={styles.typeChip}>{label}</Text> : null}
          <Text style={[styles.rowTitle, !read && styles.rowTitleUnread]}>
            {notificationTitle(item, t)}
          </Text>
          {notificationBody(item) ? (
            <Text style={styles.rowMessage} numberOfLines={3}>
              {notificationBody(item)}
            </Text>
          ) : null}
          {item.createdAt ? (
            <Text style={styles.rowDate}>
              {formatRelativeTime(item.createdAt, language || "fr")}
            </Text>
          ) : null}

          {isReservationRequest ? (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionPrimary]}
                disabled={reservationAction.isPending}
                onPress={() => handleReservationBtn(item, "accept")}
              >
                <Text style={styles.actionPrimaryText}>
                  {primary?.label || t("mobile.notifications.accept")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionSecondary]}
                disabled={reservationAction.isPending}
                onPress={() => handleReservationBtn(item, "reject")}
              >
                <Text style={styles.actionSecondaryText}>
                  {secondary?.label || t("mobile.notifications.reject")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dismissBtn}
                disabled={reservationAction.isPending}
                onPress={() => handleReservationBtn(item, "dismiss")}
                hitSlop={8}
              >
                <Text style={styles.dismissText}>
                  {t("mobile.notifications.dismiss")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {!read ? <View style={styles.dot} /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("notifications.title")}</Text>
        <TouchableOpacity
          onPress={() => markAll.mutate()}
          disabled={markAll.isPending || unread === 0}
        >
          <Text style={[styles.markAll, unread === 0 && styles.disabled]}>
            {t("mobile.notifications.markAllShort")}
          </Text>
        </TouchableOpacity>
      </View>

      {unread > 0 ? (
        <Text style={styles.unread}>
          {t("mobile.notifications.unread", { count: unread })}
        </Text>
      ) : null}

      {isLoading && items.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : null}

      {isError ? (
        <Text style={styles.error}>{t("notifications.loadError")}</Text>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: tabBarInset }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty}>{t("notifications.empty")}</Text>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginVertical: 16 }}
            />
          ) : null
        }
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  markAll: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  disabled: {
    opacity: 0.4,
  },
  unread: {
    paddingHorizontal: 16,
    marginBottom: 8,
    color: colors.textMuted,
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowUnread: {
    backgroundColor: "#FFF8F6",
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  avatarWrap: {
    paddingTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF1F5",
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textHeading,
  },
  rowBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  typeChip: {
    alignSelf: "flex-start",
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textDark,
  },
  rowTitleUnread: {
    fontWeight: "700",
  },
  rowMessage: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  rowDate: {
    fontSize: 11,
    color: colors.iconMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionPrimary: {
    backgroundColor: colors.primary,
  },
  actionPrimaryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  actionSecondary: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  actionSecondaryText: {
    color: colors.textHeading,
    fontSize: 13,
    fontWeight: "600",
  },
  dismissBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dismissText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 40,
  },
  error: {
    color: "#D32F2F",
    textAlign: "center",
    marginVertical: 12,
  },
});
