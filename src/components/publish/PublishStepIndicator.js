import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function PublishStepIndicator({ currentStep, totalSteps, stepLabel }) {
  const progress = currentStep / totalSteps;

  return (
    <View style={styles.wrap}>
      <View style={styles.labels}>
        <Text style={styles.stepText}>
          ÉTAPE {currentStep} SUR {totalSteps}
        </Text>
        <Text style={styles.stepText}>{stepLabel}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.navy,
    letterSpacing: 0.24,
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.progressTrack,
    overflow: "hidden",
  },
  fill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.navy,
  },
});
