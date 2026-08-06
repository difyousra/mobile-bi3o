import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { useAppLanguage } from "../../../i18n/LanguageProvider";
import {
  computeVehicleFinancing,
  DEFAULT_VEHICLE_DURATION_MONTHS,
  DEFAULT_VEHICLE_RATE,
  fmtVehicleDA,
  MAX_VEHICLE_DURATION_MONTHS,
  MIN_VEHICLE_DURATION_MONTHS,
  recommendedVehicleApport,
  RECOMMENDED_VEHICLE_APPORT_PCT,
  VEHICLE_DURATION_STEP,
} from "../utils/vehicleLoanCalculator";

export default function VehicleFinancingSimulator({
  initialPrix = 0,
  compact = false,
  showFullPageLink = false,
  onOpenFull,
  onContact,
}) {
  const { t } = useAppLanguage();
  const [prix, setPrix] = useState(() => {
    const n = Number(initialPrix) || 0;
    return n > 0 ? String(n) : "";
  });
  const [apport, setApport] = useState(() => {
    const n = Number(initialPrix) || 0;
    return n > 0 ? String(recommendedVehicleApport(n)) : "";
  });
  const [dureeMois, setDureeMois] = useState(DEFAULT_VEHICLE_DURATION_MONTHS);

  useEffect(() => {
    const next = Number(initialPrix) || 0;
    if (!next) return;
    setPrix(String(next));
    setApport(String(recommendedVehicleApport(next)));
  }, [initialPrix]);

  const simulation = useMemo(
    () =>
      computeVehicleFinancing({
        prix,
        apport,
        dureeMois,
        tauxAnnuel: DEFAULT_VEHICLE_RATE,
      }),
    [prix, apport, dureeMois]
  );

  const handlePrixChange = (val) => {
    setPrix(val);
    const n = Number(val);
    setApport(n > 0 ? String(recommendedVehicleApport(n)) : "");
  };

  const apportHint = simulation.apportExceedsPrice
    ? t("vehiculesUi.downPaymentTooHigh")
    : simulation.downPaymentPct > 0
      ? t("vehiculesUi.downPaymentCurrentPct", {
          pct: simulation.downPaymentPct,
          recommended: RECOMMENDED_VEHICLE_APPORT_PCT,
        })
      : t("vehiculesUi.downPaymentHint", { pct: RECOMMENDED_VEHICLE_APPORT_PCT });

  const showReadOnlyPrice = compact && Number(prix) > 0;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.heading}>
        <Ionicons name="car-outline" size={20} color={colors.primary} />
        <Text style={styles.title}>{t("vehiculesUi.financeTitle")}</Text>
        {!compact ? (
          <View style={styles.rateBadge}>
            <Text style={styles.rateBadgeText}>
              {t("vehiculesUi.rateBadge", { rate: DEFAULT_VEHICLE_RATE })}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.creditType}>
        <Text style={styles.creditTypeText}>{t("vehiculesUi.classicCredit")}</Text>
      </View>

      {showReadOnlyPrice ? (
        <View style={styles.priceBox}>
          <Text style={styles.label}>{t("vehiculesUi.vehiclePrice")}</Text>
          <Text style={styles.priceBoxValue}>{fmtVehicleDA(Number(prix))}</Text>
        </View>
      ) : (
        <View style={styles.field}>
          <Text style={styles.label}>{t("vehiculesUi.vehiclePrice")}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={prix}
              onChangeText={handlePrixChange}
              placeholder="0"
              placeholderTextColor={colors.placeholder}
            />
            <Text style={styles.suffix}>DA</Text>
          </View>
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>{t("vehiculesUi.downPayment")}</Text>
        <View
          style={[
            styles.inputWrap,
            simulation.apportExceedsPrice && styles.inputWarn,
          ]}
        >
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={apport}
            onChangeText={setApport}
            placeholder="0"
            placeholderTextColor={colors.placeholder}
          />
          <Text style={styles.suffix}>DA</Text>
        </View>
        <Text
          style={[
            styles.hint,
            simulation.apportExceedsPrice && styles.hintWarn,
          ]}
        >
          {apportHint}
        </Text>
      </View>

      <View style={styles.field}>
        <View style={styles.durationHead}>
          <Text style={styles.label}>{t("vehiculesUi.loanDuration")}</Text>
          <Text style={styles.durationValue}>
            {t("vehiculesUi.durationMonths", { months: dureeMois })}
          </Text>
        </View>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() =>
              setDureeMois((d) =>
                Math.max(MIN_VEHICLE_DURATION_MONTHS, d - VEHICLE_DURATION_STEP)
              )
            }
          >
            <Ionicons name="remove" size={18} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.stepValue}>
            {t("vehiculesUi.durationMonths", { months: dureeMois })}
          </Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() =>
              setDureeMois((d) =>
                Math.min(MAX_VEHICLE_DURATION_MONTHS, d + VEHICLE_DURATION_STEP)
              )
            }
          >
            <Ionicons name="add" size={18} color={colors.textDark} />
          </TouchableOpacity>
        </View>
        <View style={styles.bounds}>
          <Text style={styles.boundText}>
            {t("vehiculesUi.durationMonths", { months: MIN_VEHICLE_DURATION_MONTHS })}
          </Text>
          <Text style={styles.boundText}>
            {t("vehiculesUi.durationMonths", { months: MAX_VEHICLE_DURATION_MONTHS })}
          </Text>
        </View>
      </View>

      <View style={styles.results}>
        <View style={styles.resultMain}>
          <Text style={styles.resultLabel}>{t("vehiculesUi.monthlyPayments")}</Text>
          <Text style={styles.resultMainValue}>
            {fmtVehicleDA(simulation.monthlyPayment)}
            <Text style={styles.perMonth}> {t("vehiculesUi.perMonth")}</Text>
          </Text>
        </View>
        <ResultRow
          label={t("vehiculesUi.loanAmount")}
          value={fmtVehicleDA(simulation.loanAmount)}
        />
        <ResultRow
          label={t("vehiculesUi.creditCost")}
          hint={t("vehiculesUi.interestRateNote", { rate: DEFAULT_VEHICLE_RATE })}
          value={fmtVehicleDA(simulation.creditCost)}
        />
        <Text style={styles.disclaimer}>{t("vehiculesUi.disclaimer")}</Text>
        {(showFullPageLink || compact) && onOpenFull ? (
          <TouchableOpacity onPress={onOpenFull} activeOpacity={0.8}>
            <Text style={styles.fullLink}>{t("vehiculesUi.openFullSimulator")}</Text>
          </TouchableOpacity>
        ) : null}
        {onContact ? (
          <TouchableOpacity style={styles.contactBtn} onPress={onContact} activeOpacity={0.85}>
            <Text style={styles.contactBtnText}>{t("vehiculesUi.contactSeller")}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function ResultRow({ label, hint, value }) {
  return (
    <View style={styles.resultRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.resultLabel}>{label}</Text>
        {hint ? <Text style={styles.resultHint}>{hint}</Text> : null}
      </View>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 16,
    gap: 14,
  },
  cardCompact: { marginTop: 4 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textHeading,
  },
  rateBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rateBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  creditType: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  creditTypeText: { fontSize: 12, fontWeight: "600", color: colors.textMuted },
  priceBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  priceBoxValue: { fontSize: 18, fontWeight: "800", color: colors.textHeading },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textDark },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  inputWarn: { borderColor: "#F59E0B" },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textDark,
  },
  suffix: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  hint: { fontSize: 12, color: colors.textMuted },
  hintWarn: { color: "#B45309" },
  durationHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  durationValue: { fontSize: 14, fontWeight: "700", color: colors.primary },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 4,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textDark,
    minWidth: 80,
    textAlign: "center",
  },
  bounds: { flexDirection: "row", justifyContent: "space-between" },
  boundText: { fontSize: 11, color: colors.textMuted },
  results: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  resultMain: { gap: 4, marginBottom: 4 },
  resultMainValue: { fontSize: 22, fontWeight: "800", color: colors.textHeading },
  perMonth: { fontSize: 13, fontWeight: "500", color: colors.textMuted },
  resultRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  resultLabel: { fontSize: 13, color: colors.textMuted },
  resultHint: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  resultValue: { fontSize: 13, fontWeight: "700", color: colors.textDark },
  disclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 4,
  },
  fullLink: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
  contactBtn: {
    marginTop: 4,
    backgroundColor: "#1A1C1E",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  contactBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
});
