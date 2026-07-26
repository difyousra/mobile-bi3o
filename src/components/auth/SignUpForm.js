import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthInput from "./AuthInput";
import PhoneInput from "./PhoneInput";
import SocialButton from "./SocialButton";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

const scaleX = SCREEN_WIDTH / DESIGN_WIDTH;
const scaleY = SCREEN_HEIGHT / DESIGN_HEIGHT;

function OrSeparator() {
  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>Or</Text>
      <View style={styles.orLine} />
    </View>
  );
}

export default function SignUpForm({ onRegisterSuccess, onGooglePress }) {
  const { register, isSubmitting } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Prénom, nom, e-mail et mot de passe sont requis.");
      return;
    }

    const result = await register({
      prenom: firstName,
      nom: lastName,
      email,
      password,
      telephone: phone,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onRegisterSuccess?.(result.email);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.nameRow}>
            <AuthInput
              placeholder="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.nameInput}
            />

            <AuthInput
              placeholder="Nom"
              value={lastName}
              onChangeText={setLastName}
              style={styles.nameInput}
            />
          </View>

          <AuthInput
            placeholder="jean@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <PhoneInput value={phone} onChangeText={setPhone} />

          <AuthInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={21 * scaleX}
                  color={colors.iconMuted}
                />
              </TouchableOpacity>
            }
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.disabled]}
            activeOpacity={0.85}
            onPress={handleSignUp}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Sign up</Text>
            )}
          </TouchableOpacity>

          <OrSeparator />

          <SocialButton onPress={onGooglePress} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    position: "absolute",
    top: -132 * scaleY,
    left: 24 * scaleX,
    right: 24 * scaleX,
    minHeight: 486 * scaleY,
    borderRadius: 10 * scaleX,
    backgroundColor: colors.white,
    paddingTop: 24 * scaleY,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 24 * scaleX,
    paddingBottom: 24 * scaleY,
    gap: 17 * scaleY,
  },
  nameRow: {
    flexDirection: "row",
    gap: 16 * scaleX,
  },
  nameInput: {
    flex: 1,
  },
  error: {
    fontSize: 13 * scaleX,
    color: "#D32F2F",
    marginTop: -8 * scaleY,
  },
  primaryButton: {
    height: 50 * scaleY,
    borderRadius: 25 * scaleX,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3 * scaleY,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  disabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 15 * scaleX,
    fontWeight: "500",
    color: colors.white,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16 * scaleX,
    marginTop: 2 * scaleY,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8EDF2",
  },
  orText: {
    fontSize: 14 * scaleX,
    fontWeight: "400",
    color: "#6F747B",
  },
});
