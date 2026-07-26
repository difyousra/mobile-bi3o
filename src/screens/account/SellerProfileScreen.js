import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../theme/colors";
import { queryKeys } from "../../api/queryKeys";
import { fetchPublicSeller } from "../../services/annoncesService";
import { mapPublicSeller } from "../../utils/profileHelpers";
import {
  useFollowStatus,
  useToggleFollow,
} from "../../hooks/useEngagement";
import { useAuth } from "../../context/AuthContext";

export default function SellerProfileScreen({ route, navigation }) {
  const sellerId = route.params?.sellerId;
  const seedName = route.params?.sellerName;
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.sellerPublic(Number(sellerId) || 0),
    queryFn: () => fetchPublicSeller(Number(sellerId)),
    enabled: Boolean(sellerId),
  });

  const seller = useMemo(
    () =>
      mapPublicSeller(data, Number(sellerId) || 0) ?? {
        id: Number(sellerId),
        name: seedName || `Vendeur #${sellerId}`,
      },
    [data, sellerId, seedName]
  );

  const { data: following = false } = useFollowStatus(
    isAuthenticated ? sellerId : undefined
  );
  const toggleFollow = useToggleFollow();

  if (!sellerId) {
    navigation.goBack();
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title}>Vendeur</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : null}

        {isError ? (
          <Text style={styles.error}>
            Impossible de charger le profil public.
          </Text>
        ) : null}

        <View style={styles.card}>
          {seller.avatar ? (
            <Image source={{ uri: seller.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="person" size={40} color={colors.iconMuted} />
            </View>
          )}
          <Text style={styles.name}>{seller.name || seedName}</Text>
          {seller.typeCompte ? (
            <Text style={styles.meta}>{seller.typeCompte}</Text>
          ) : null}
          {seller.ville ? (
            <Text style={styles.meta}>
              <Ionicons name="location-outline" size={14} /> {seller.ville}
            </Text>
          ) : null}
          {seller.bio ? <Text style={styles.bio}>{seller.bio}</Text> : null}

          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.followBtn}
              disabled={toggleFollow.isPending}
              onPress={() =>
                toggleFollow.mutate({
                  sellerId,
                  currentlyFollowing: following,
                })
              }
            >
              <Text style={styles.followText}>
                {following ? "Ne plus suivre" : "Suivre"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.followBtn}
              onPress={() =>
                Alert.alert("Connexion", "Connectez-vous pour suivre ce vendeur.")
              }
            >
              <Text style={styles.followText}>Suivre</Text>
            </TouchableOpacity>
          )}
        </View>
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
  content: { padding: 20 },
  card: { alignItems: "center", gap: 8 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceMuted,
  },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textHeading,
    marginTop: 8,
  },
  meta: { fontSize: 14, color: colors.textMuted },
  bio: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textHeading,
    textAlign: "center",
    lineHeight: 20,
  },
  followBtn: {
    marginTop: 20,
    backgroundColor: colors.navy,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  followText: { color: colors.white, fontWeight: "600" },
  error: { color: colors.primary, textAlign: "center", marginBottom: 16 },
});
