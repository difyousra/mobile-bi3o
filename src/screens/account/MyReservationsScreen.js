import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useMyReservations } from "../../hooks/useMessaging";
import * as reservationService from "../../services/reservationService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppLanguage } from "../../i18n/LanguageProvider";

function statusLabel(item, t) {
  const raw = String(item.status ?? item.statut ?? "PENDING").toUpperCase();
  if (raw === "CONFIRMED") return t("mobile.reservations.statusConfirmed");
  if (raw === "CANCELLED") return t("mobile.reservations.statusCancelled");
  if (raw === "REJECTED") return t("mobile.reservations.statusRejected");
  return raw;
}

export default function MyReservationsScreen({ navigation, route }) {
  const { t } = useAppLanguage();
  const { data, isLoading, isError, refetch, isRefetching } = useMyReservations(0);
  const qc = useQueryClient();

  const items = useMemo(() => data?.content ?? [], [data]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      reservationService.updateReservationStatus(id, status),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("mobile.account.reservations")}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={Boolean(isRefetching)} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : null}
        {isError ? (
          <Text style={styles.error}>{t("mobile.reservations.loadError")}</Text>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <Text style={styles.empty}>{t("mobile.reservations.empty")}</Text>
        ) : (
          items.map((item) => (
            <View key={String(item.id)} style={styles.card}>
              <Text style={styles.cardTitle}>
                {t("mobile.reservations.cardTitle", { id: item.id })}
              </Text>
              <Text style={styles.cardMeta}>
                {t("mobile.reservations.listingLine", {
                  id: item.annonceId ?? "—",
                  status: statusLabel(item, t),
                })}
              </Text>
              <Text style={styles.cardMeta}>
                {item.dateDebut ?? item.startDate ?? "?"} →{" "}
                {item.dateFin ?? item.endDate ?? "?"}
              </Text>
              <View style={styles.actions}>
                {["CONFIRMED", "CANCELLED", "REJECTED"].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={styles.chip}
                    onPress={() =>
                      statusMutation.mutate({ id: item.id, status: st })
                    }
                  >
                    <Text style={styles.chipText}>
                      {st === "CONFIRMED"
                        ? t("mobile.reservations.statusConfirmed")
                        : st === "CANCELLED"
                          ? t("mobile.reservations.statusCancelled")
                          : t("mobile.reservations.statusRejected")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 17, fontWeight: "700", color: colors.textHeading },
  content: { padding: 16, paddingBottom: 40 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 24 },
  error: { color: colors.primary, textAlign: "center", marginTop: 16 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: "700", color: colors.textHeading, fontSize: 15 },
  cardMeta: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
  chipText: { fontSize: 11, fontWeight: "600", color: colors.navy },
});
