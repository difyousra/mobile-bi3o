import { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import ChatHeader from "./ChatHeader";
import ProductContextBar from "./ProductContextBar";
import MessageBubble, { DateSeparator } from "./MessageBubble";
import ChatInput from "./ChatInput";
import MessagesEmptyState from "./MessagesEmptyState";
import { useAuth } from "../../context/AuthContext";
import {
  useArchiveConversation,
  useConversationMessages,
  useSendChatImage,
  useSendMessage,
} from "../../hooks/useMessaging";
import { colors } from "../../theme/colors";
import { formatPrice } from "../../utils/productMapper";

export default function ChatContent({
  conversation,
  conversationId,
  onBack,
  navigation,
}) {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const id = conversationId ?? conversation.id;

  const { data: messages = [], isLoading, isError, refetch } =
    useConversationMessages(id, currentUserId);
  const sendMutation = useSendMessage(id);
  const imageMutation = useSendChatImage(id);
  const archiveMutation = useArchiveConversation();

  const [draft, setDraft] = useState("");

  const handleSellerPress = () => {
    const sellerId = conversation?.sellerId;
    if (!sellerId || !navigation) return;
    navigation.navigate("SellerProfile", {
      sellerId: Number(sellerId),
      sellerName: conversation.sellerName,
      sellerAvatar: conversation.sellerAvatar,
    });
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sendMutation.isPending) return;
    setDraft("");
    try {
      await sendMutation.mutateAsync(text);
    } catch (error) {
      setDraft(text);
      Alert.alert(
        "Envoi impossible",
        error?.message ?? "Réessayez dans un instant."
      );
    }
  };

  const handleViewProduct = () => {
    const annonceId = conversation.annonceId ?? conversation.product?.id;
    if (!annonceId || !navigation) return;
    navigation.navigate("ProductDetail", {
      annonceId,
      product: {
        id: annonceId,
        title: conversation.product?.title,
        image: conversation.product?.image,
        priceDa: 0,
        priceEuro: 0,
      },
    });
  };

  const handleMenuPress = () => {
    Alert.alert("Options", undefined, [
      {
        text: "Archiver",
        onPress: () =>
          archiveMutation.mutate(id, {
            onSuccess: () => {
              Alert.alert("Archivée", "Conversation archivée.");
              onBack?.();
            },
            onError: (e) =>
              Alert.alert("Erreur", e?.message ?? "Archive impossible."),
          }),
      },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const handleAttachPress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission", "Autorisez l'accès à la galerie.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    try {
      await imageMutation.mutateAsync({
        uri: asset.uri,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileName: asset.fileName ?? "chat.jpg",
      });
    } catch (error) {
      Alert.alert(
        "Image",
        error?.message ?? "Upload image échoué (vérifier le contrat multipart)."
      );
    }
  };

  const isEmpty = !isLoading && messages.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ChatHeader
        variant={conversation.headerVariant}
        sellerName={conversation.sellerName}
        sellerAvatar={conversation.sellerAvatar}
        lastSeen={conversation.lastSeen}
        onBackPress={onBack}
        onMenuPress={handleMenuPress}
        onSellerPress={conversation?.sellerId ? handleSellerPress : undefined}
      />

      <ProductContextBar
        product={{
          ...conversation.product,
          price:
            conversation.product?.price ||
            (conversation.product?.priceDa
              ? formatPrice(conversation.product.priceDa)
              : ""),
        }}
        onViewPress={handleViewProduct}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: 24 }}
          />
        ) : null}

        {isError ? (
          <Text style={styles.error} onPress={() => refetch()}>
            Impossible de charger les messages. Toucher pour réessayer.
          </Text>
        ) : null}

        {isEmpty ? (
          <MessagesEmptyState />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<DateSeparator />}
            renderItem={({ item }) => <MessageBubble message={item} />}
          />
        )}

        <ChatInput
          value={draft}
          onChangeText={setDraft}
          onSend={handleSend}
          onAttachPress={handleAttachPress}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  error: {
    textAlign: "center",
    color: colors.primary,
    marginTop: 16,
    paddingHorizontal: 16,
  },
});
