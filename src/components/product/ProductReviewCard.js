import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function ProductReviewCard({ review }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: review.avatar }} style={styles.avatar} />
        <View style={styles.headerBody}>
          <Text style={styles.author}>{review.author}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.rating}>{review.rating}</Text>
          </View>
        </View>
        <View style={styles.likes}>
          <Ionicons name="thumbs-up-outline" size={14} color={colors.textMuted} />
          <Text style={styles.likesText}>{review.likes}</Text>
        </View>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaLine}>
          <Text style={styles.metaLabel}>Variant : </Text>
          {review.variant}
        </Text>
        <Text style={styles.metaLine}>
          <Text style={styles.metaLabel}>Storage : </Text>
          {review.storage}
        </Text>
        <Text style={styles.metaLine}>
          <Text style={styles.metaLabel}>Color : </Text>
          {review.color}
        </Text>
      </View>

      <Text style={styles.text}>{review.text}</Text>

      {review.images?.length > 0 ? (
        <View style={styles.reviewImages}>
          {review.images.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.reviewImage} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
  },
  headerBody: { flex: 1 },
  author: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textHeading,
  },
  likes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likesText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  meta: {
    gap: 4,
    marginBottom: 12,
  },
  metaLine: {
    fontSize: 13,
    color: colors.textHeading,
  },
  metaLabel: {
    color: colors.textMuted,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  reviewImages: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  reviewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
});
