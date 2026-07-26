import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useMessages } from "../../context/MessagesContext";
import ChatContent from "../../components/messages/ChatContent";
import { colors } from "../../theme/colors";

export default function ChatScreen({ route, navigation }) {
  const { conversationId, seedConversation } = route.params ?? {};
  const { getConversation, isLoading } = useMessages();
  const fromList = getConversation(conversationId);

  const conversation = fromList ?? seedConversation ?? null;

  if (isLoading && !conversation) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!conversationId) {
    navigation.goBack();
    return null;
  }

  const safeConversation = conversation ?? {
    id: conversationId,
    sellerName: "Conversation",
    sellerAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    lastSeen: "Messagerie Bi3oo",
    product: {
      id: route.params?.annonceId ?? conversationId,
      title: route.params?.productTitle ?? "Annonce",
      status: "Annonce",
      price: "",
      image:
        route.params?.productImage ??
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80",
    },
    headerVariant: "seller",
    messages: [],
  };

  return (
    <ChatContent
      conversation={safeConversation}
      conversationId={conversationId}
      onBack={() => navigation.goBack()}
      navigation={navigation}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});
