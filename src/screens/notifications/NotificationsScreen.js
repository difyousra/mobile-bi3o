import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../../hooks/useEngagement";
import { colors } from "../../theme/colors";
import { useTabBarInset } from "../../hooks/useTabBarInset";
import { useAppLanguage } from "../../i18n/LanguageProvider";

function notificationTitle(item, t) {
  return item.titre ?? item.title ?? item.type ?? t("mobile.notifications.fallbackTitle");
}

function notificationBody(item) {
  return item.message ?? item.body ?? "";
}

function isRead(item) {
  return Boolean(item.read ?? item.lu);
}

export default function NotificationsScreen({ navigation }) {
  const { t } = useAppLanguage();
  const tabBarInset = useTabBarInset();
  const { data, isLoading, isError, refetch, isRefetching } =
    useNotifications(0, 20);
  const { data: unread = 0 } = useUnreadNotificationsCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = data?.content ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty}>{t("notifications.empty")}</Text>
          ) : null
        }
        renderItem={({ item }) => {
          const read = isRead(item);
          return (
            <TouchableOpacity
              style={[styles.row, !read && styles.rowUnread]}
              onPress={() => {
                if (!read) markRead.mutate(item.id);
              }}
            >
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{notificationTitle(item, t)}</Text>
                {notificationBody(item) ? (
                  <Text style={styles.rowMessage} numberOfLines={3}>
                    {notificationBody(item)}
                  </Text>
                ) : null}
                {item.createdAt ? (
                  <Text style={styles.rowDate}>{item.createdAt}</Text>
                ) : null}
              </View>
              {!read ? <View style={styles.dot} /> : null}
            </TouchableOpacity>
          );
        }}
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
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowUnread: {
    backgroundColor: "#FFF8F6",
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
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
