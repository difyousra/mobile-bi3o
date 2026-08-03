import { useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import MessagesListHeader from "../../components/messages/MessagesListHeader";
import MessagesEmptyState from "../../components/messages/MessagesEmptyState";
import HomeSearchBar from "../../components/home/HomeSearchBar";
import { useMessages } from "../../context/MessagesContext";
import { showDevMessage } from "../../utils/devFeedback";
import { colors } from "../../theme/colors";
import { useTabBarInset } from "../../hooks/useTabBarInset";

export default function MessagesListScreen({ navigation }) {
  const rootNavigation = useNavigation();
  const tabBarInset = useTabBarInset();
  const {
    filterConversations,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMessages();
  const [searchQuery, setSearchQuery] = useState("");
  const conversations = useMemo(
    () => filterConversations(searchQuery),
    [filterConversations, searchQuery]
  );
  const showList = conversations.length > 0;
  const canGoBack = rootNavigation.canGoBack();

  const openChat = (conversationId) => {
    navigation.navigate("Chat", { conversationId });
  };

  const handleNewChat = () => {
    Alert.alert(
      "Nouvelle conversation",
      "Ouvrez une annonce et appuyez sur Contacter pour démarrer un fil (POST /messagerie/annonces/{id}/conversations)."
    );
  };

  const handleFilterPress = () => {
    showDevMessage("Filtres", "Filtres de messages non documentés côté API.");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <MessagesListHeader
          showBack={canGoBack}
          onBackPress={() => rootNavigation.goBack()}
          onNewChatPress={handleNewChat}
          onRefreshPress={() => refetch()}
          onLogoPress={() =>
            rootNavigation.navigate("MainTabs", { screen: "Home" })
          }
        />

        <HomeSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={handleFilterPress}
          placeholder="Rechercher une conversation"
        />

        {isLoading ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: 32 }}
          />
        ) : null}

        {isError ? (
          <Text style={styles.error}>
            Impossible de charger les conversations (JWT requis).
          </Text>
        ) : null}

        {!isLoading && showList ? (
          <ScrollView
            contentContainerStyle={[styles.list, { paddingBottom: tabBarInset }]}
            refreshControl={
              <RefreshControl
                refreshing={Boolean(isRefetching)}
                onRefresh={refetch}
              />
            }
          >
            {conversations.map((conv) => (
              <TouchableOpacity
                key={String(conv.id)}
                style={styles.conversationRow}
                activeOpacity={0.8}
                onPress={() => openChat(conv.id)}
              >
                <Image
                  source={{ uri: conv.product.image || conv.sellerAvatar }}
                  style={styles.avatar}
                />
                <View style={styles.convInfo}>
                  <View style={styles.convNameRow}>
                    <Text style={styles.convName} numberOfLines={1}>
                      {conv.sellerName}
                    </Text>
                    {conv.unreadCount ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.convPreview} numberOfLines={1}>
                    {conv.preview || conv.product.title}
                  </Text>
                  <Text style={styles.convLastSeen} numberOfLines={1}>
                    {conv.lastSeen}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        {!isLoading && !isError && !showList ? <MessagesEmptyState /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  list: {
    gap: 8,
    marginTop: 8,
  },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F2F5",
  },
  convInfo: {
    flex: 1,
    gap: 2,
  },
  convNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  convName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
  },
  convPreview: {
    fontSize: 13,
    color: colors.textMuted,
  },
  convLastSeen: {
    fontSize: 11,
    color: colors.textMuted,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  error: {
    marginTop: 24,
    textAlign: "center",
    color: colors.primary,
    fontSize: 13,
  },
});
