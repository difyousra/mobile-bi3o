/**
 * Affichage prix DA >>> EUR — aligné new front.
 * EUR principal = marché parallèle (plus cher → moins d’euros).
 * Banque = tooltip / ligne secondaire (plus d’euros).
 */
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import {
  buildEurRatesTooltip,
  resolveListingCardPrices,
  shouldHideEurConversion,
} from "../../utils/formatListingDisplay";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function PriceConversionRow({
  listing,
  priceDa,
  categorieId,
  sousCategorieId,
  rates,
  size = "md",
  showBankLine = false,
  style,
}) {
  const { t } = useAppLanguage();
  const payload = listing ?? {
    prix: priceDa,
    priceDzd: priceDa,
    categorieId,
    sousCategorieId,
  };

  if (shouldHideEurConversion(payload)) {
    const da =
      payload.priceLabel ||
      (Number(payload.prix ?? payload.priceDzd) > 0
        ? `${Number(payload.prix ?? payload.priceDzd).toLocaleString("fr-FR")} Da`
        : "");
    if (!da) return null;
    return (
      <View style={[styles.row, style]}>
        <Text style={[styles.price, size === "sm" && styles.priceSm, size === "lg" && styles.priceLg]}>
          {da}
        </Text>
      </View>
    );
  }

  const { price, eurPrice, eurPriceOfficial } = resolveListingCardPrices(
    payload,
    rates
  );
  if (!price && !eurPrice) return null;

  const tooltip = buildEurRatesTooltip(eurPrice, eurPriceOfficial);

  return (
    <View style={style}>
      <View
        style={styles.row}
        accessibilityLabel={tooltip}
        accessibilityHint={tooltip}
      >
        {price ? (
          <Text
            style={[
              styles.price,
              size === "sm" && styles.priceSm,
              size === "lg" && styles.priceLg,
            ]}
          >
            {price}
          </Text>
        ) : null}
        {price && eurPrice ? (
          <Text style={[styles.chevrons, size === "sm" && styles.chevronsSm]}>
            {">>>"}
          </Text>
        ) : null}
        {eurPrice ? (
          <Text
            style={[
              styles.eur,
              size === "sm" && styles.eurSm,
              size === "lg" && styles.eurLg,
            ]}
          >
            {eurPrice}
          </Text>
        ) : null}
      </View>
      {showBankLine && eurPriceOfficial ? (
        <Text style={styles.bankLine}>
          {t("mobile.format.bankApprox", { price: eurPriceOfficial })}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textDark,
  },
  priceSm: {
    fontSize: 11,
  },
  priceLg: {
    fontSize: 20,
  },
  chevrons: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -1,
  },
  chevronsSm: {
    fontSize: 9,
  },
  eur: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  eurSm: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textDark,
  },
  eurLg: {
    fontSize: 16,
  },
  bankLine: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  hint: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: "italic",
  },
});
