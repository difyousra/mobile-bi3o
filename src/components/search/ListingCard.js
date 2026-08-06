/**
 * Carte annonce résultats — style Leboncoin :
 * image arrondie, pas de border/shadow, séparateur fin entre cards.
 */
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import PriceConversionRow from "../common/PriceConversionRow";
import { sellerInitials } from "../../utils/formatListingDisplay";
import { useAppLanguage } from "../../i18n/LanguageProvider";

const FALLBACK_IMAGE =
  "https://new.bi3oo.com/uploads/1_vehicules/1_voitures/ann_31/2025/09/pexels-trksami-20277838_19e3a356740e426398e293fc5ac0ef2b.jpg";

function ListingImage({ uri, style }) {
  const [src, setSrc] = useState(uri || FALLBACK_IMAGE);
  useEffect(() => {
    setSrc(uri || FALLBACK_IMAGE);
  }, [uri]);

  return (
    <Image
      source={{ uri: src }}
      style={style}
      resizeMode="cover"
      onError={() => {
        if (src !== FALLBACK_IMAGE) setSrc(FALLBACK_IMAGE);
      }}
    />
  );
}

function buildAttrsLine(listing) {
  const parts = [];
  if (listing.attrsLine) return listing.attrsLine;
  if (listing.subtitle && listing.subtitle !== listing.location) {
    parts.push(listing.subtitle);
  }
  if (listing.date) parts.push(listing.date);
  return parts.filter(Boolean).join(" · ");
}

export default function ListingCard({
  listing,
  isFavorite,
  onPress,
  onToggleFavorite,
  rates,
  compact = false,
  showDivider = true,
}) {
  const { t } = useAppLanguage();
  const sellerName = String(listing.sellerName || "").trim();
  const attrsLine = buildAttrsLine(listing);
  const isPro = Boolean(listing.isPro);

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      activeOpacity={0.92}
      onPress={() => onPress(listing)}
    >
      <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
        <ListingImage uri={listing.image} style={styles.image} />

        {listing.featured || listing.tag?.type === "featured" ? (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>{t("mobile.search.featuredBadge")}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.favoriteBtn}
          activeOpacity={0.85}
          onPress={() => onToggleFavorite?.(listing.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? colors.primary : colors.textDark}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>

        <PriceConversionRow listing={listing} rates={rates} />

        {isPro ? (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>{t("categoryUi.sellerPro")}</Text>
          </View>
        ) : null}

        {attrsLine ? (
          <Text style={styles.attrs} numberOfLines={1}>
            {attrsLine}
          </Text>
        ) : null}

        {(sellerName || listing.location) && (
          <View style={styles.sellerRow}>
            <View style={styles.avatar}>
              {listing.sellerPhotoUrl ? (
                <Image
                  source={{ uri: listing.sellerPhotoUrl }}
                  style={styles.avatarImg}
                />
              ) : (
                <Text style={styles.avatarInitials}>
                  {sellerInitials(sellerName || "?")}
                </Text>
              )}
            </View>
            <View style={styles.sellerText}>
              {sellerName ? (
                <Text style={styles.sellerName} numberOfLines={1}>
                  {sellerName}
                </Text>
              ) : null}
              {listing.location ? (
                <Text style={styles.sellerLocation} numberOfLines={1}>
                  {listing.location}
                </Text>
              ) : null}
            </View>
          </View>
        )}
      </View>

      {showDivider && !compact ? <View style={styles.divider} /> : null}
    </TouchableOpacity>
  );
}

/** Mini-carte horizontale (vue carte). */
export function ListingMapCard({
  listing,
  selected = false,
  onPress,
  onOpen,
  rates,
}) {
  const { t } = useAppLanguage();

  return (
    <TouchableOpacity
      style={[styles.miniCard, selected && styles.miniCardSelected]}
      activeOpacity={0.92}
      onPress={() => {
        if (selected) onOpen?.(listing);
        else onPress?.(listing);
      }}
    >
      <View style={styles.miniMedia}>
        <ListingImage uri={listing.image} style={styles.miniImage} />
      </View>
      <View style={styles.miniBody}>
        <PriceConversionRow listing={listing} rates={rates} size="sm" />
        <Text style={styles.miniTitle} numberOfLines={2}>
          {listing.title}
        </Text>
        {listing.location ? (
          <Text style={styles.miniLocation} numberOfLines={1}>
            {listing.location}
          </Text>
        ) : null}
        {selected ? (
          <Text style={styles.miniCta}>{t("mobile.search.viewListingCta")}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.white,
    paddingTop: 14,
  },
  cardCompact: {
    width: 240,
    paddingTop: 0,
  },
  imageWrap: {
    position: "relative",
    height: 210,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F4F6F8",
  },
  imageWrapCompact: {
    height: 120,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#5B21B6",
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.white,
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingTop: 12,
    paddingBottom: 14,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    lineHeight: 22,
  },
  proBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  attrs: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#EEF1F5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textHeading,
  },
  sellerText: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  sellerName: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
  },
  sellerLocation: {
    fontSize: 12,
    color: colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginTop: 2,
  },
  miniCard: {
    width: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  miniCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  miniMedia: {
    height: 100,
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
  },
  miniImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F0F2F5",
  },
  miniBody: {
    paddingTop: 10,
    gap: 4,
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
  },
  miniLocation: {
    fontSize: 12,
    color: colors.textMuted,
  },
  miniCta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
});
