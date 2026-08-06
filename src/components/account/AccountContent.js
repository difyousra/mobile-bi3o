import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../theme/colors";
import { useWallet } from "../../context/WalletContext";
import { useAuth } from "../../context/AuthContext";
import { useUploadAvatar } from "../../hooks/useProfile";
import { queryKeys } from "../../api/queryKeys";
import { fetchPublicSeller } from "../../services/annoncesService";
import { useMyManagedAds } from "../../hooks/usePublish";
import {
  useConversations,
  useMyReservations,
} from "../../hooks/useMessaging";
import {
  mapPublicSeller,
  userAvatarUrl,
  userDisplayName,
} from "../../utils/profileHelpers";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import { alertDialog, confirmDialog } from "../../utils/confirmDialog";
import { useTabBarInset } from "../../hooks/useTabBarInset";
import { ENABLE_BUY_WALLET } from "../../config/featureFlags";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import WalletBalanceCard from "./WalletBalanceCard";
import TopUpModal from "./TopUpModal";

const MENU_ITEM_DEFS = [
  {
    id: "password",
    labelKey: "settings.security.changePassword",
    icon: "key-outline",
    route: "ChangePassword",
  },
  {
    id: "editProfile",
    labelKey: "profilePublicUi.editTitle",
    icon: "create-outline",
    route: "EditProfile",
  },
  {
    id: "favorites",
    labelKey: "nav.favorites",
    icon: "heart-outline",
    tab: "Favorites",
  },
  {
    id: "reservations",
    labelKey: "mobile.account.reservations",
    icon: "calendar-outline",
    route: "MyReservations",
  },
  {
    id: "settings",
    labelKey: "mobile.accountSettings.title",
    icon: "settings-outline",
    route: "AccountSettings",
  },
];

function ActivityTile({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.activityTile} onPress={onPress}>
      {item.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      ) : null}
      <Ionicons name={item.icon} size={28} color={colors.navy} />
      <Text style={styles.activityLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
}

export default function AccountContent() {
  const { t } = useAppLanguage();
  const navigation = useNavigation();
  const tabBarInset = useTabBarInset();
  const { user, setUser, logout, refreshUser } = useAuth();
  const uploadAvatar = useUploadAvatar();
  const { balance, balanceUpdated, topUp } = useWallet();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [topUpVisible, setTopUpVisible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("1000");

  const displayName = userDisplayName(user);
  const sellerId = user?.id;

  const {
    data: publicSellerData,
    refetch: refetchPublicSeller,
  } = useQuery({
    queryKey: queryKeys.sellerPublic(Number(sellerId) || 0),
    queryFn: () => fetchPublicSeller(Number(sellerId)),
    enabled: Boolean(sellerId),
    staleTime: 60_000,
  });

  const publicSeller = useMemo(
    () =>
      publicSellerData
        ? mapPublicSeller(publicSellerData, Number(sellerId) || 0)
        : null,
    [publicSellerData, sellerId]
  );

  const avatarUri = userAvatarUrl(user, publicSellerData);
  const city = publicSeller?.ville;
  const bio = publicSeller?.bio;
  const { data: managedAds } = useMyManagedAds(0, 50);
  const { data: conversations = [] } = useConversations(0, 50);
  const { data: reservations } = useMyReservations(0);

  const activityItems = useMemo(
    () => [
      {
        id: "selling",
        label: t("profileUi.tabListings"),
        icon: "cube-outline",
        badge: Number(managedAds?.totalElements ?? managedAds?.content?.length ?? 0),
        route: "MyListings",
      },
      {
        id: "reservations",
        label: t("mobile.account.reservationsShort"),
        icon: "calendar-outline",
        badge: Number(
          reservations?.totalElements ?? reservations?.content?.length ?? 0
        ),
        route: "MyReservations",
      },
      {
        id: "contact",
        label: t("common.messages"),
        icon: "chatbubble-outline",
        badge: conversations.reduce(
          (sum, conv) => sum + Number(conv?.unreadCount ?? 0),
          0
        ),
        route: "Messages",
      },
    ],
    [managedAds, conversations, reservations, t]
  );

  const menuItems = useMemo(
    () =>
      MENU_ITEM_DEFS.map((item) => ({
        ...item,
        label: t(item.labelKey),
      })),
    [t]
  );

  const handleActivityPress = (item) => {
    if (item.route === "Messages") {
      navigation.navigate("Messages");
      return;
    }
    if (item.route) {
      navigation.navigate(item.route);
      return;
    }
  };

  const handleMenuPress = (item) => {
    if (item.tab) {
      navigation.navigate("MainTabs", { screen: item.tab });
      return;
    }
    if (item.route) {
      navigation.navigate(item.route);
      return;
    }
  };

  const handleAvatarPress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alertDialog(
        t("mobile.account.galleryPermissionTitle"),
        t("mobile.account.galleryPermission")
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    try {
      const uploaded = await uploadAvatar.mutateAsync({
        uri: asset.uri,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileName: asset.fileName ?? "avatar.jpg",
      });
      const photoAbsolute =
        uploaded?.photoUrlAbsolute ??
        resolveMediaUrl(uploaded?.photoUrl) ??
        asset.uri;
      if (setUser && user) {
        setUser({
          ...user,
          photoUrl: uploaded?.photoUrl ?? photoAbsolute,
          avatarUrl: photoAbsolute,
        });
      }
      await refreshUser?.();
      await refetchPublicSeller?.();
      alertDialog(
        t("mobile.account.avatarTitle"),
        t("mobile.account.avatarUpdated")
      );
    } catch (error) {
      alertDialog(
        t("mobile.account.avatarTitle"),
        error?.message ?? t("mobile.account.avatarUploadError")
      );
    }
  };

  const handleLogout = () => {
    confirmDialog(
      t("mobile.account.logoutConfirmTitle"),
      t("mobile.account.logoutConfirmBody"),
      [
        { text: t("mobile.common.cancel"), style: "cancel" },
        {
          text: t("mobile.account.logoutAction"),
          style: "destructive",
          onPress: async () => {
          try {
            await logout();
          } catch {
            // AuthContext nettoie déjà la session ; navigation Home
          }
        },
      },
    ]);
  };

  const handleTopUpConfirm = () => {
    topUp(topUpAmount);
    setTopUpVisible(false);
  };

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleAvatarPress}
            disabled={uploadAvatar.isPending}
          >
            {uploadAvatar.isPending ? (
              <View style={[styles.avatar, styles.avatarLoading]}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              {t("mobile.account.greeting", { name: displayName })}
            </Text>
            <Text style={styles.greetingSub}>
              {user?.email ?? t("mobile.account.greetingSub")}
            </Text>
            {city ? <Text style={styles.accountType}>{city}</Text> : null}
            {bio ? (
              <Text style={styles.accountType} numberOfLines={2}>
                {bio}
              </Text>
            ) : null}
            {user?.typeCompte ? (
              <Text style={styles.accountType}>{user.typeCompte}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.sheet}>
          {ENABLE_BUY_WALLET ? (
            <>
              <TouchableOpacity
                style={styles.walletHeader}
                onPress={() => navigation.navigate("MyWallet")}
              >
                <Text style={styles.walletBrand}>
                  <Text style={styles.walletBrandAccent}>Bi3oo </Text>
                  {t("mobile.account.walletBrandSuffix")}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              <WalletBalanceCard
                balance={balance}
                balanceVisible={balanceVisible}
                onToggleVisibility={() => setBalanceVisible((v) => !v)}
                updatedAt={balanceUpdated}
                onTransfer={() => {}}
                onTopUp={() => setTopUpVisible(true)}
                onPressCard={() => navigation.navigate("MyWallet")}
              />
            </>
          ) : null}

          <Text style={styles.sectionTitle}>{t("mobile.account.myActivity")}</Text>
          <View style={styles.activityRow}>
            {activityItems.map((item) => (
              <ActivityTile
                key={item.id}
                item={item}
                onPress={() => handleActivityPress(item)}
              />
            ))}
          </View>

          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuRow, index > 0 && styles.menuRowBorder]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={22} color={colors.navy} />
                </View>
                <Text style={styles.menuTitle}>{item.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.iconMuted}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.logoutRow}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel={t("mobile.account.logoutAction")}
          >
            <Ionicons name="power-outline" size={22} color={colors.primary} />
            <Text style={styles.logoutText}>{t("mobile.account.logoutAction")}</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.iconMuted}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {ENABLE_BUY_WALLET ? (
        <TopUpModal
          visible={topUpVisible}
          amount={topUpAmount}
          onChangeAmount={setTopUpAmount}
          onClose={() => setTopUpVisible(false)}
          onConfirm={handleTopUpConfirm}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  content: {
    // paddingBottom via useTabBarInset
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  avatar: {
    width: 63,
    height: 65,
    borderRadius: 32,
    backgroundColor: colors.white,
  },
  avatarLoading: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 16,
    color: colors.brandLight,
  },
  greetingSub: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.white,
    marginTop: 4,
  },
  accountType: {
    marginTop: 4,
    fontSize: 12,
    color: "#CCE4FD",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 26,
    minHeight: 800,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  walletBrand: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textHeading,
  },
  walletBrandAccent: {
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 16,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  activityTile: {
    width: "31%",
    alignItems: "center",
    paddingVertical: 10,
    position: "relative",
  },
  activityLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
  },
  menuCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    marginBottom: 24,
  },
  logoutText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
});
