import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useNotificationPreferences } from "../../hooks/useNotificationPreferences";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import {
  requestNotificationPermission,
  registerPushTokenWithBackend,
} from "../../services/pushNotifications";

const TOGGLE_ON = "#1B2B4B";
const TOGGLE_OFF = "#C8CDD3";
const PAGE_BG = "#F2F3F5";

function NotifToggle({ value, onValueChange }) {
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      activeOpacity={0.85}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={[
        styles.toggleTrack,
        { backgroundColor: value ? TOGGLE_ON : TOGGLE_OFF },
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          value ? styles.toggleThumbOn : styles.toggleThumbOff,
        ]}
      >
        <Ionicons
          name={value ? "checkmark" : "close"}
          size={12}
          color={value ? TOGGLE_ON : "#8B9198"}
        />
      </View>
    </TouchableOpacity>
  );
}

function ChannelRow({ label, value, onValueChange, isLast, busy }) {
  return (
    <View style={[styles.channelRow, isLast && styles.channelRowLast]}>
      <View style={styles.channelLeft}>
        <Ionicons name="phone-portrait-outline" size={20} color={colors.textHeading} />
        <Text style={styles.channelLabel}>{label}</Text>
      </View>
      {busy ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <NotifToggle value={value} onValueChange={onValueChange} />
      )}
    </View>
  );
}

function ExpandableSection({ title, expanded, onToggle, children }) {
  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {expanded ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
}

function GroupBlock({ subtitle, children }) {
  return (
    <View style={styles.groupBlock}>
      {subtitle ? <Text style={styles.groupSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function PromoBanner({ onClose, onActivate, closeLabel, title, text, activateLabel, loading }) {
  return (
    <View style={styles.promo}>
      <TouchableOpacity
        style={styles.promoClose}
        onPress={onClose}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={closeLabel}
      >
        <Ionicons name="close" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      <Text style={styles.promoTitle}>{title}</Text>
      <Text style={styles.promoText}>{text}</Text>
      <TouchableOpacity
        style={styles.promoBtn}
        onPress={onActivate}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.promoBtnText}>{activateLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function NotificationSettingsScreen({ navigation }) {
  const { prefs: localPrefs, setPreference } = useUserPreferences();
  const { prefs, ready, syncing, error, updatePref, updateMany } =
    useNotificationPreferences();
  const { t } = useAppLanguage();
  const [expanded, setExpanded] = useState({
    messaging: true,
    adLife: true,
    published: true,
    expiry: true,
    activity: true,
    news: true,
  });

  const showPromo = localPrefs.notifPromoBannerVisible !== false;
  const channelMobile = t("mobile.settings.notifications.channelMobile");

  const toggleSection = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showSaveError = () => {
    Alert.alert(
      t("mobile.common.error"),
      t("mobile.settings.notifications.saveError")
    );
  };

  const enableMobilePush = async (key, value) => {
    const result = await updatePref(key, value);
    if (!result.ok) {
      showSaveError();
      return;
    }

    // Permission OS optionnelle — ne bloque pas la prefs API.
    if (value) {
      try {
        const ok = await requestNotificationPermission();
        if (ok) {
          await registerPushTokenWithBackend();
        }
      } catch {
        // Expo Go / web : prefs enregistrées, push OS indisponible
      }
    }
  };

  const activateAllPush = async () => {
    const result = await updateMany({
      msgPush: true,
      favoritePush: true,
      publishedPush: true,
      expiryPush: true,
      personalizedPush: true,
      newsletterPush: true,
      activityPush: true,
    });
    if (!result.ok) {
      showSaveError();
      return;
    }
    await setPreference("notifPromoBannerVisible", false);

    try {
      const ok = await requestNotificationPermission();
      if (ok) {
        await registerPushTokenWithBackend();
      }
    } catch {
      // ignore
    }
  };

  const screenTitle = t("mobile.accountSettings.notifications");

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <SettingsScreenHeader
          title={screenTitle}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerWrap}>
        <SettingsScreenHeader
          title={screenTitle}
          onBack={() => navigation.goBack()}
        />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {error === "load_failed" ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              {t("mobile.settings.notifications.loadError")}
            </Text>
          </View>
        ) : null}

        {showPromo ? (
          <PromoBanner
            onClose={() => setPreference("notifPromoBannerVisible", false)}
            onActivate={activateAllPush}
            closeLabel={t("mobile.common.close")}
            title={t("mobile.settings.notifications.promoTitle")}
            text={t("mobile.settings.notifications.promoText")}
            activateLabel={t("mobile.settings.notifications.promoActivate")}
            loading={syncing}
          />
        ) : null}

        <ExpandableSection
          title={t("mobile.settings.notifications.sectionMessaging")}
          expanded={expanded.messaging}
          onToggle={() => toggleSection("messaging")}
        >
          <GroupBlock subtitle={t("mobile.settings.notifications.groupNewMessages")}>
            <ChannelRow
              label={channelMobile}
              value={!!prefs.msgPush}
              onValueChange={(v) => enableMobilePush("msgPush", v)}
              isLast
            />
          </GroupBlock>
        </ExpandableSection>

        <ExpandableSection
          title={t("mobile.settings.notifications.sectionAdLife")}
          expanded={expanded.adLife}
          onToggle={() => toggleSection("adLife")}
        >
          <GroupBlock subtitle={t("mobile.settings.notifications.groupFavorites")}>
            <ChannelRow
              label={channelMobile}
              value={!!prefs.favoritePush}
              onValueChange={(v) => enableMobilePush("favoritePush", v)}
              isLast
            />
          </GroupBlock>
        </ExpandableSection>

        <ExpandableSection
          title={t("mobile.settings.notifications.sectionPublished")}
          expanded={expanded.published}
          onToggle={() => toggleSection("published")}
        >
          <GroupBlock>
            <ChannelRow
              label={channelMobile}
              value={!!prefs.publishedPush}
              onValueChange={(v) => enableMobilePush("publishedPush", v)}
              isLast
            />
          </GroupBlock>
        </ExpandableSection>

        <ExpandableSection
          title={t("mobile.settings.notifications.sectionExpiry")}
          expanded={expanded.expiry}
          onToggle={() => toggleSection("expiry")}
        >
          <GroupBlock>
            <ChannelRow
              label={channelMobile}
              value={!!prefs.expiryPush}
              onValueChange={(v) => enableMobilePush("expiryPush", v)}
              isLast
            />
          </GroupBlock>
        </ExpandableSection>

        <ExpandableSection
          title={t("mobile.settings.notifications.sectionActivity")}
          expanded={expanded.activity}
          onToggle={() => toggleSection("activity")}
        >
          <GroupBlock subtitle={t("mobile.settings.notifications.groupActivity")}>
            <ChannelRow
              label={channelMobile}
              value={!!prefs.activityPush}
              onValueChange={(v) => enableMobilePush("activityPush", v)}
              isLast
            />
          </GroupBlock>
        </ExpandableSection>

        <ExpandableSection
          title={t("mobile.settings.notifications.sectionNews")}
          expanded={expanded.news}
          onToggle={() => toggleSection("news")}
        >
          <GroupBlock subtitle={t("mobile.settings.notifications.groupNewsletter")}>
            <ChannelRow
              label={channelMobile}
              value={!!prefs.newsletterPush}
              onValueChange={(v) => enableMobilePush("newsletterPush", v)}
              isLast
            />
          </GroupBlock>
          <View style={styles.groupDivider} />
          <GroupBlock subtitle={t("mobile.settings.notifications.groupPersonalized")}>
            <ChannelRow
              label={channelMobile}
              value={!!prefs.personalizedPush}
              onValueChange={(v) => enableMobilePush("personalizedPush", v)}
              isLast
            />
          </GroupBlock>
        </ExpandableSection>

        <Text style={styles.apiHint}>
          {t("mobile.settings.notifications.apiHint")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerWrap: {
    backgroundColor: colors.white,
  },
  scroll: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 12,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAGE_BG,
  },
  errorBanner: {
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
  },
  apiHint: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 8,
    marginTop: 4,
  },
  promo: {
    backgroundColor: "#E9EBEE",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  promoClose: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    paddingRight: 28,
    marginBottom: 8,
  },
  promoText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: 14,
  },
  promoBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  promoBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    paddingRight: 12,
  },
  sectionBody: {
    paddingBottom: 8,
  },
  groupBlock: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  groupSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: 8,
  },
  groupDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  channelRowLast: {
    borderBottomWidth: 0,
  },
  channelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  channelLabel: {
    fontSize: 15,
    color: colors.textHeading,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
  },
  toggleThumbOff: {
    alignSelf: "flex-start",
  },
});
