import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import {
  useMyReservations,
  useCreateReservation,
} from "../../hooks/useMessaging";
import * as reservationService from "../../services/reservationService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function statusLabel(item) {
  return String(item.status ?? item.statut ?? "PENDING").toUpperCase();
}

export default function MyReservationsScreen({ navigation, route }) {
  const prefillAnnonceId = route.params?.annonceId;
  const { data, isLoading, isError, refetch, isRefetching } =
    useMyReservations(0);
  const createMutation = useCreateReservation();
  const qc = useQueryClient();
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [annonceId, setAnnonceId] = useState(
    prefillAnnonceId ? String(prefillAnnonceId) : ""
  );

  const items = useMemo(() => data?.content ?? [], [data]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      reservationService.updateReservationStatus(id, status),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  const handleCreate = async () => {
    if (!annonceId.trim()) {
      Alert.alert("Réservation", "Indiquez l'ID d'annonce.");
      return;
    }
    if (!dateDebut.trim() || !dateFin.trim()) {
      Alert.alert(
        "Réservation",
        "Indiquez dateDebut et dateFin (YYYY-MM-DD).\nCorps minimal — non détaillé dans Postman."
      );
      return;
    }
    try {
      await createMutation.mutateAsync({
        annonceId: annonceId.trim(),
        body: {
          dateDebut: dateDebut.trim(),
          dateFin: dateFin.trim(),
        },
      });
      Alert.alert("OK", "Réservation créée (si le contrat backend accepte ces champs).");
      setDateDebut("");
      setDateFin("");
      refetch();
    } catch (error) {
      Alert.alert(
        "Erreur",
        error?.message ??
          "Création refusée — ajuster le corps selon OpenAPI/QA."
      );
    }
  };

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
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nouvelle demande</Text>
          <Text style={styles.hint}>
            POST /reservations/annonces/{"{id}"} — champs dateDebut / dateFin
            (hypothèse documentée comme gap Postman).
          </Text>
          <TextInput
            style={styles.input}
            placeholder="ID annonce"
            placeholderTextColor={colors.textMuted}
            value={annonceId}
            onChangeText={setAnnonceId}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="dateDebut (YYYY-MM-DD)"
            placeholderTextColor={colors.textMuted}
            value={dateDebut}
            onChangeText={setDateDebut}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="dateFin (YYYY-MM-DD)"
            placeholderTextColor={colors.textMuted}
            value={dateFin}
            onChangeText={setDateFin}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={handleCreate}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnText}>Créer</Text>
            )}
          </TouchableOpacity>
        </View>

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
  formCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  formTitle: { fontSize: 16, fontWeight: "700", color: colors.textHeading },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textHeading,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: colors.white, fontWeight: "700" },
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
