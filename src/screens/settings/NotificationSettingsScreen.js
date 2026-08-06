import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useAppLanguage } from "../../i18n/LanguageProvider";

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

function ChannelRow({ icon, label, value, onValueChange, isLast }) {
  return (
    <View style={[styles.channelRow, isLast && styles.channelRowLast]}>
      <View style={styles.channelLeft}>
        <Ionicons name={icon} size={20} color={colors.textHeading} />
        <Text style={styles.channelLabel}>{label}</Text>
      </View>
      <NotifToggle value={value} onValueChange={onValueChange} />
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

function PromoBanner({ onClose, onActivate, closeLabel, title, text, activateLabel }) {
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
      >
        <Text style={styles.promoBtnText}>{activateLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function NotificationSettingsScreen({ navigation }) {
  const { prefs, ready, setPreference } = useUserPreferences();
  const { t } = useAppLanguage();
  const [expanded, setExpanded] = useState({
    messaging: true,
    adLife: true,
    published: true,
    expiry: true,
    news: true,
  });

  const showPromo = prefs.notifPromoBannerVisible !== false;

  const toggleSection = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activateAllPush = () => {
    setPreference("notifMsgPush", true);
    setPreference("notifFavoritePush", true);
    setPreference("notifPublishedPush", true);
    setPreference("notifExpiryPush", true);
    setPreference("notifNewsPersonalizedPush", true);
    setPreference("notifPromoBannerVisible", false);
  };

  const screenTitle = t("mobile.accountSettings.notifications");
  const channelMobile = t("mobile.settings.notifications.channelMobile");
  const channelEmail = t("mobile.settings.notifications.channelEmail");

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
        {showPromo ? (
          <PromoBanner
            onClose={() => setPreference("notifPromoBannerVisible", false)}
            onActivate={activateAllPush}
            closeLabel={t("mobile.common.close")}
            title={t("mobile.settings.notifications.promoTitle")}
            text={t("mobile.settings.notifications.promoText")}
            activateLabel={t("mobile.settings.notifications.promoActivate")}
          />
        ) : null}

        <ExpandableSection
          title={t("mobile.settings.notifications.sectionMessaging")}
          expanded={expanded.messaging}
          onToggle={() => toggleSection("messaging")}
        >
          <GroupBlock subtitle={t("mobile.settings.notifications.groupNewMessages")}>
            <ChannelRow
              icon="phone-portrait-outline"
              label={channelMobile}
              value={!!prefs.notifMsgPush}
              onValueChange={(v) => setPreference("notifMsgPush", v)}
            />
            <ChannelRow
              icon="mail-outline"
              label={channelEmail}
              value={!!prefs.notifMsgEmail}
              onValueChange={(v) => setPreference("notifMsgEmail", v)}
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
              icon="phone-portrait-outline"
              label={channelMobile}
              value={!!prefs.notifFavoritePush}
              onValueChange={(v) => setPreference("notifFavoritePush", v)}
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
              icon="phone-portrait-outline"
              label={channelMobile}
              value={!!prefs.notifPublishedPush}
              onValueChange={(v) => setPreference("notifPublishedPush", v)}
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
              icon="phone-portrait-outline"
              label={channelMobile}
              value={!!prefs.notifExpiryPush}
              onValueChange={(v) => setPreference("notifExpiryPush", v)}
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
              icon="phone-portrait-outline"
              label={channelMobile}
              value={!!prefs.notifNewsletterPush}
              onValueChange={(v) => setPreference("notifNewsletterPush", v)}
            />
            <ChannelRow
              icon="mail-outline"
              label={channelEmail}
              value={!!prefs.notifNewsletterEmail}
              onValueChange={(v) => setPreference("notifNewsletterEmail", v)}
              isLast
            />
          </GroupBlock>
          <View style={styles.groupDivider} />
          <GroupBlock subtitle={t("mobile.settings.notifications.groupPersonalized")}>
            <ChannelRow
              icon="phone-portrait-outline"
              label={channelMobile}
              value={!!prefs.notifNewsPersonalizedPush}
              onValueChange={(v) =>
                setPreference("notifNewsPersonalizedPush", v)
              }
            />
            <ChannelRow
              icon="mail-outline"
              label={channelEmail}
              value={!!prefs.notifNewsPersonalizedEmail}
              onValueChange={(v) =>
                setPreference("notifNewsPersonalizedEmail", v)
              }
              isLast
            />
          </GroupBlock>
        </ExpandableSection>
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
