import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import { useCreateReservation } from "../../hooks/useMessaging";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import {
  buildMonthCells,
  buildReservedDaysSet,
  extractConfirmedRanges,
  toIsoLocal,
} from "../../features/vacances/utils/reservationDateUtils";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function MonthGrid({ offset, reservedDays, language }) {
  const { first, cells } = useMemo(() => buildMonthCells(offset), [offset]);
  const locale = language === "ar" ? "ar-DZ" : language === "en" ? "en-GB" : "fr-FR";
  const monthLabel = first.toLocaleDateString(locale, { month: "long", year: "numeric" });

  return (
    <View style={styles.month}>
      <Text style={styles.monthTitle}>{monthLabel}</Text>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((day, idx) => (
          <Text key={`${day}-${idx}`} style={styles.weekday}>{day}</Text>
        ))}
      </View>
      <View style={styles.days}>
        {cells.map((date, idx) => {
          if (!date) return <View key={`e-${idx}`} style={styles.dayEmpty} />;
          const iso = toIsoLocal(date);
          const reserved = reservedDays.has(iso);
          return (
            <View
              key={iso}
              style={[styles.day, reserved ? styles.dayReserved : styles.dayFree]}
            >
              <Text style={[styles.dayText, reserved ? styles.dayTextReserved : styles.dayTextFree]}>
                {date.getDate()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function AdDetailReservationCard({
  annonceId,
  sellerId,
  calendarData,
  navigation,
}) {
  const { t, language } = useAppLanguage();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const createReservation = useCreateReservation();
  const [arrivee, setArrivee] = useState("");
  const [depart, setDepart] = useState("");
  const [voyageurs, setVoyageurs] = useState("1");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const confirmedRanges = useMemo(
    () => extractConfirmedRanges(calendarData),
    [calendarData]
  );
  const reservedDays = useMemo(
    () => buildReservedDaysSet(confirmedRanges),
    [confirmedRanges]
  );

  const isOwner =
    sellerId != null && user?.id != null && Number(sellerId) === Number(user.id);

  const dateProps =
    Platform.OS === "web"
      ? { type: "date" }
      : {
          placeholder: t("mobile.filters.datePlaceholder"),
          placeholderTextColor: colors.placeholder,
        };

  const submit = async () => {
    if (isOwner) {
      navigation.navigate("MyReservations", { annonceId });
      return;
    }
    if (!isAuthenticated) {
      requireAuth({ name: "ProductDetail", params: { annonceId } });
      return;
    }
    const guests = Number(voyageurs);
    if (!arrivee || !depart) {
      setFeedback({ type: "error", text: t("annonceDetail.reservationDatesRequired") });
      return;
    }
    if (!Number.isFinite(guests) || guests < 1) {
      setFeedback({ type: "error", text: t("annonceDetail.reservationGuestsRequired") });
      return;
    }

    setFeedback({ type: "", text: "" });
    try {
      await createReservation.mutateAsync({
        annonceId,
        body: {
          dateArrivee: arrivee,
          dateDepart: depart,
          voyageurs: guests,
          message: message.trim() || "",
        },
      });
      setFeedback({ type: "success", text: t("annonceDetail.reservationSuccess") });
      setMessage("");
    } catch (err) {
      const raw = String(err?.message || err?.response?.data?.message || "");
      const conflict =
        raw.toLowerCase().includes("reserve") ||
        raw.toLowerCase().includes("conflit") ||
        err?.status === 409;
      setFeedback({
        type: "error",
        text: conflict
          ? t("annonceDetail.reservationDatesConflict")
          : raw || t("annonceDetail.reservationFailed"),
      });
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t("annonceDetail.reservationTitle")}</Text>
        {isOwner ? (
          <TouchableOpacity onPress={() => navigation.navigate("MyReservations", { annonceId })}>
            <Text style={styles.link}>{t("annonceDetail.viewRequests")}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.intro}>{t("annonceDetail.reservationIntro")}</Text>
      <Text style={styles.legend}>{t("annonceDetail.reservationLegend")}</Text>

      <View style={styles.calendars}>
        <MonthGrid offset={0} reservedDays={reservedDays} language={language} />
        <MonthGrid offset={1} reservedDays={reservedDays} language={language} />
      </View>

      {isOwner ? null : (
        <>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>{t("annonceDetail.dateArrival")}</Text>
              <TextInput
                style={styles.input}
                value={arrivee}
                onChangeText={setArrivee}
                {...dateProps}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t("annonceDetail.dateDeparture")}</Text>
              <TextInput
                style={styles.input}
                value={depart}
                onChangeText={setDepart}
                {...dateProps}
              />
            </View>
          </View>

          <Text style={styles.label}>{t("annonceDetail.travelers")}</Text>
          <TextInput
            style={styles.input}
            value={voyageurs}
            onChangeText={setVoyageurs}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>{t("annonceDetail.messageOptional")}</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={message}
            onChangeText={setMessage}
            multiline
            placeholder={t("annonceDetail.reservationPlaceholder")}
            placeholderTextColor={colors.placeholder}
          />

          {feedback.text ? (
            <Text style={feedback.type === "success" ? styles.ok : styles.err}>
              {feedback.text}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.submit, createReservation.isPending && styles.submitDisabled]}
            onPress={submit}
            disabled={createReservation.isPending}
            activeOpacity={0.85}
          >
            {createReservation.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>{t("annonceDetail.sendRequest")}</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 15, fontWeight: "700", color: colors.textHeading },
  link: { fontSize: 13, fontWeight: "600", color: colors.primary },
  intro: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  legend: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  calendars: { gap: 10, marginBottom: 12 },
  month: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
  },
  monthTitle: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: colors.textHeading,
    textTransform: "capitalize",
    marginBottom: 8,
  },
  weekRow: { flexDirection: "row" },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },
  days: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  dayEmpty: { width: "14.28%", height: 28 },
  day: {
    width: "14.28%",
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  dayFree: { backgroundColor: "#DCFCE7" },
  dayReserved: { backgroundColor: "#FEE2E2" },
  dayText: { fontSize: 11, fontWeight: "700" },
  dayTextFree: { color: "#15803D" },
  dayTextReserved: { color: "#B91C1C" },
  row: { flexDirection: "row", gap: 8 },
  field: { flex: 1 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textHeading,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textHeading,
    backgroundColor: colors.white,
  },
  textarea: { minHeight: 72, textAlignVertical: "top" },
  ok: { marginTop: 10, color: "#15803D", fontSize: 13, fontWeight: "600" },
  err: { marginTop: 10, color: colors.primary, fontSize: 13, fontWeight: "600" },
  submit: {
    marginTop: 14,
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: colors.white, fontSize: 14, fontWeight: "700" },
});
