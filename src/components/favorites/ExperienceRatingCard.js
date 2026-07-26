import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function ExperienceRatingCard({ rating, onRate }) {
  return (
    <View style={styles.card}>
      <Text style={styles.question}>
        Comment noteriez-vous votre expérience sur Bi3oo ?
      </Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            activeOpacity={0.7}
            onPress={() => onRate(star)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={28}
              color={star <= rating ? "#F5A623" : "#D1D5DB"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
    marginBottom: 24,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    gap: 14,
  },
  question: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textDark,
    textAlign: "center",
    lineHeight: 20,
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
