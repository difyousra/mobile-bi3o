import { useCallback, useEffect, useMemo, useState } from "react";
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
import AboutSellerCard from "./AboutSellerCard";
import ChatOverflowMenu from "./ChatOverflowMenu";
import ChatReportModal from "./ChatReportModal";
import MessageBubble, { DateSeparator } from "./MessageBubble";
import ChatInput from "./ChatInput";
import MessagesEmptyState from "./MessagesEmptyState";
import { useAuth } from "../../context/AuthContext";
import { useMessages } from "../../context/MessagesContext";
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
import { blockUser, isUserBlocked } from "../../utils/blockedUsers";

export default function ChatContent({
  conversation,
  conversationId,
  onBack,
  navigation,
}) {
  const { t } = useAppLanguage();
  const { user } = useAuth();
  const { refreshBlocked } = useMessages();
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const sellerId = conversation?.sellerId;
  const annonceId = conversation?.annonceId ?? conversation?.product?.id;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sellerId) {
        if (!cancelled) setBlocked(false);
        return;
      }
      const yes = await isUserBlocked(sellerId);
      if (!cancelled) setBlocked(yes);
    })();
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  const aboutHeader = useMemo(
    () => (
      <View>
        <AboutSellerCard
          name={conversation?.sellerName}
          ville={conversation?.sellerVille}
          memberSince={conversation?.sellerMemberSince}
          isSeller={conversation?.otherUserIsSeller !== false}
        />
        <DateSeparator />
      </View>
    ),
    [
      conversation?.sellerName,
      conversation?.sellerVille,
      conversation?.sellerMemberSince,
      conversation?.otherUserIsSeller,
    ]
  );

  const handleSellerPress = () => {
    if (!sellerId || !navigation) return;
    navigation.navigate("SellerProfile", {
      sellerId: Number(sellerId),
      sellerName: conversation.sellerName,
      sellerAvatar: conversation.sellerAvatar,
    });
  };

  const ensureNotBlocked = useCallback(() => {
    if (!blocked) return true;
    Alert.alert(
      t("mobile.messages.blockedTitle"),
      t("mobile.messages.blockedSendBody")
    );
    return false;
  }, [blocked, t]);

  const handleSend = async () => {
    if (!ensureNotBlocked()) return;
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

  const handleBlock = () => {
    if (!sellerId) {
      Alert.alert(t("mobile.common.error"), t("mobile.messages.blockUnavailable"));
      return;
    }
    Alert.alert(
      t("mobile.messages.blockConfirmTitle"),
      t("mobile.messages.blockConfirmBody", {
        name: conversation.sellerName || "",
      }),
      [
        { text: t("mobile.common.cancel"), style: "cancel" },
        {
          text: t("mobile.messages.blockUser"),
          style: "destructive",
          onPress: async () => {
            await blockUser(sellerId);
            setBlocked(true);
            await refreshBlocked?.();
            Alert.alert(
              t("mobile.messages.blockedTitle"),
              t("mobile.messages.blockedBody")
            );
            onBack?.();
          },
        },
      ]
    );
  };

  const handleReport = () => {
    if (!annonceId) {
      Alert.alert(
        t("mobile.messages.reportUser"),
        t("mobile.messages.reportNoListing")
      );
      return;
    }
    setReportVisible(true);
  };

  const handleDeleteConversation = () => {
    Alert.alert(
      t("mobile.messages.deleteConfirmTitle"),
      t("mobile.messages.deleteConfirmBody"),
      [
        { text: t("mobile.common.cancel"), style: "cancel" },
        {
          text: t("mobile.messages.deleteConversation"),
          style: "destructive",
          onPress: () =>
            archiveMutation.mutate(id, {
              onSuccess: () => {
                Alert.alert(
                  t("mobile.messages.deletedTitle"),
                  t("mobile.messages.deletedBody")
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
      ]
    );
  };

  const handlePersonalData = () => {
    const lines = [
      `${t("mobile.messages.personalDataName")}: ${
        conversation.sellerName || "—"
      }`,
      `${t("mobile.messages.personalDataCity")}: ${
        conversation.sellerVille || "—"
      }`,
      `${t("mobile.messages.personalDataMember")}: ${
        conversation.sellerMemberSince || "—"
      }`,
      `${t("mobile.messages.personalDataListing")}: ${
        conversation.product?.title || "—"
      }`,
    ];
    Alert.alert(t("mobile.messages.personalData"), lines.join("\n"));
  };

  const uploadPickedImage = async (asset) => {
    if (!ensureNotBlocked()) return;
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
    if (!ensureNotBlocked()) return;
    Alert.alert(t("mobile.messages.sendPhotoTitle"), undefined, [
      { text: t("mobile.messages.gallery"), onPress: () => pickFromGallery() },
      { text: t("mobile.messages.camera"), onPress: () => pickFromCamera() },
      { text: t("mobile.common.cancel"), style: "cancel" },
    ]);
  };

  const handleMicPress = async () => {
    if (!ensureNotBlocked()) return;
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
        onMenuPress={() => setMenuVisible(true)}
        onSellerPress={sellerId ? handleSellerPress : undefined}
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
          <View style={styles.emptyWrap}>
            {aboutHeader}
            <MessagesEmptyState />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={aboutHeader}
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

      <ChatOverflowMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onBlock={handleBlock}
        onReport={handleReport}
        onDelete={handleDeleteConversation}
        onPersonalData={handlePersonalData}
      />

      <ChatReportModal
        visible={reportVisible}
        annonceId={annonceId}
        onClose={() => setReportVisible(false)}
      />
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
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 16,
  },
  error: {
    textAlign: "center",
    color: colors.primary,
    marginTop: 16,
    paddingHorizontal: 16,
  },
});
