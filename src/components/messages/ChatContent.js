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
  useSendChatAudio,
  useSendChatImage,
  useSendMessage,
} from "../../hooks/useMessaging";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { colors } from "../../theme/colors";
import { formatPrice } from "../../utils/productMapper";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function ChatContent({
  conversation,
  conversationId,
  onBack,
  navigation,
}) {
  const { t } = useAppLanguage();
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const id = conversationId ?? conversation.id;

  const { data: messages = [], isLoading, isError, refetch } =
    useConversationMessages(id, currentUserId);
  const sendMutation = useSendMessage(id);
  const imageMutation = useSendChatImage(id);
  const audioMutation = useSendChatAudio(id);
  const archiveMutation = useArchiveConversation();
  const voice = useVoiceRecorder();

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
        t("mobile.messages.sendFailedTitle"),
        error?.message ?? t("mobile.messages.sendFailedBody")
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
    Alert.alert(t("mobile.messages.optionsTitle"), undefined, [
      {
        text: t("mobile.messages.archive"),
        onPress: () =>
          archiveMutation.mutate(id, {
            onSuccess: () => {
              Alert.alert(
                t("mobile.messages.archivedTitle"),
                t("mobile.messages.archivedBody")
              );
              onBack?.();
            },
            onError: (e) =>
              Alert.alert(
                t("mobile.common.error"),
                e?.message ?? t("mobile.messages.archiveError")
              ),
          }),
      },
      { text: t("mobile.common.cancel"), style: "cancel" },
    ]);
  };

  const uploadPickedImage = async (asset) => {
    if (!asset?.uri) return;
    try {
      await imageMutation.mutateAsync({
        uri: asset.uri,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileName: asset.fileName ?? "chat.jpg",
      });
    } catch (error) {
      Alert.alert(
        t("mobile.messages.photoTitle"),
        error?.message ?? t("mobile.messages.photoSendError")
      );
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        t("mobile.account.galleryPermissionTitle"),
        t("mobile.account.galleryPermission")
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    await uploadPickedImage(result.assets[0]);
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        t("mobile.account.galleryPermissionTitle"),
        t("mobile.messages.cameraPermission")
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    await uploadPickedImage(result.assets[0]);
  };

  const handleAttachPress = () => {
    Alert.alert(t("mobile.messages.sendPhotoTitle"), undefined, [
      { text: t("mobile.messages.gallery"), onPress: () => pickFromGallery() },
      { text: t("mobile.messages.camera"), onPress: () => pickFromCamera() },
      { text: t("mobile.common.cancel"), style: "cancel" },
    ]);
  };

  const handleMicPress = async () => {
    const result = await voice.start();
    if (!result?.ok) {
      const msg =
        result?.error === "not-allowed"
          ? t("mobile.messages.micDenied")
          : t("mobile.messages.micError");
      Alert.alert(t("mobile.messages.micTitle"), msg);
    }
  };

  const handleStopRecording = async () => {
    const file = await voice.stop();
    if (!file?.uri) return;
    try {
      await audioMutation.mutateAsync(file);
    } catch (error) {
      Alert.alert(
        t("mobile.messages.voiceTitle"),
        error?.message ?? t("mobile.messages.voiceSendError")
      );
    }
  };

  const handleCancelRecording = async () => {
    await voice.cancel();
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
            {t("mobile.messages.loadMessagesError")}
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
          onMicPress={handleMicPress}
          onStopRecording={handleStopRecording}
          onCancelRecording={handleCancelRecording}
          isRecording={voice.isRecording}
          recordingMs={voice.elapsedMs}
          sendingMedia={imageMutation.isPending || audioMutation.isPending}
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
