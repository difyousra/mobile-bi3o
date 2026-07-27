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

function statusLabel(item) {
  return String(item.status ?? item.statut ?? "PENDING").toUpperCase();
}

export default function MyReservationsScreen({ navigation, route }) {
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
        <Text style={styles.title}>Mes réservations</Text>
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
          <Text style={styles.error}>Chargement impossible (JWT requis).</Text>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <Text style={styles.empty}>Aucune réservation.</Text>
        ) : (
          items.map((item) => (
            <View key={String(item.id)} style={styles.card}>
              <Text style={styles.cardTitle}>Réservation #{item.id}</Text>
              <Text style={styles.cardMeta}>
                Annonce {item.annonceId ?? "—"} · {statusLabel(item)}
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
                    <Text style={styles.chipText}>{st}</Text>
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
