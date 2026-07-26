import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PublishTopBar from "./PublishTopBar";
import PublishStepIndicator from "./PublishStepIndicator";
import { colors } from "../../theme/colors";

export function PublishPrimaryButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.primaryBtnText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.white} />
    </TouchableOpacity>
  );
}

export function PublishSecondaryButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.secondaryBtn} onPress={onPress}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function PublishStepLayout({
  step,
  totalSteps = 9,
  stepLabel,
  title,
  subtitle,
  onBack,
  onClose,
  children,
  onContinue,
  continueLabel = "Continuer",
  showDraft = true,
  onDraft,
}) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <PublishTopBar
        title="Déposer une annonce"
        onBack={onBack}
        onClose={onClose}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>Poser une annonce</Text>
        <PublishStepIndicator
          currentStep={step}
          totalSteps={totalSteps}
          stepLabel={stepLabel}
        />
        <Text style={styles.heading}>{title}</Text>
        {subtitle ? <Text style={styles.lead}>{subtitle}</Text> : null}
        {children}
        {onContinue ? (
          <>
            <PublishPrimaryButton label={continueLabel} onPress={onContinue} />
            {showDraft && onDraft ? (
              <PublishSecondaryButton
                label="Enregistrer le brouillon"
                onPress={onDraft}
              />
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 120,
    gap: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.navy,
    marginTop: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textHeading,
    lineHeight: 32,
  },
  lead: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
  },
  secondaryBtn: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(18, 25, 38, 0.2)",
  },
});
