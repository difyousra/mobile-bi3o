import { useState } from "react";
import { ActivityIndicator, View, StyleSheet, Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OnboardingScreen from "./src/screens/onboarding/OnboardingScreen";
import SignInScreen from "./src/screens/auth/SignInScreen";
import SignUpScreen from "./src/screens/auth/SignUpScreen";
import VerifyEmailScreen from "./src/screens/auth/VerifyEmailScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { CheckoutProvider } from "./src/context/CheckoutContext";
import { WalletProvider } from "./src/context/WalletContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { MessagesProvider } from "./src/context/MessagesContext";
import { API_BASE_URL } from "./src/config/api";
import { showDevMessage } from "./src/utils/devFeedback";
import { colors } from "./src/theme/colors";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

/** Origine sans /api pour OAuth Spring (mobile_api.md §2). */
function getApiOrigin() {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}

function AppContent() {
  const {
    isAuthenticated,
    isBootstrapping,
    pendingVerificationEmail,
    setPendingVerificationEmail,
  } = useAuth();
  const [flow, setFlow] = useState("onboarding");
  const [verifyEmail, setVerifyEmail] = useState(null);

  const goToSignIn = () => setFlow("signin");
  const goToSignUp = () => setFlow("signup");
  const goToOnboarding = () => setFlow("onboarding");
  const goToForgotPassword = () => setFlow("forgot-password");

  const handleGoogleAuth = async () => {
    const url = `${getApiOrigin()}/oauth2/authorization/google`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        showDevMessage(
          "Google OAuth",
          "Impossible d'ouvrir le navigateur. URL: " + url
        );
        return;
      }
      await Linking.openURL(url);
      showDevMessage(
        "Google OAuth",
        "Après redirection, récupérez ?code= puis échangez via POST /auth/oauth/exchange (deep link à finaliser)."
      );
    } catch {
      showDevMessage("Google OAuth", "Échec d'ouverture du navigateur système.");
    }
  };

  if (isBootstrapping) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <CartProvider>
        <CheckoutProvider>
          <WalletProvider>
            <FavoritesProvider>
              <MessagesProvider>
                <AppNavigator />
              </MessagesProvider>
            </FavoritesProvider>
          </WalletProvider>
        </CheckoutProvider>
      </CartProvider>
    );
  }

  if (flow === "verify-email" && (verifyEmail || pendingVerificationEmail)) {
    const email = verifyEmail ?? pendingVerificationEmail;
    return (
      <VerifyEmailScreen
        email={email}
        onSuccess={goToSignIn}
        onBackPress={goToSignUp}
      />
    );
  }

  if (flow === "forgot-password") {
    return (
      <ForgotPasswordScreen
        onBackPress={goToSignIn}
        onSuccess={goToSignIn}
      />
    );
  }

  if (flow === "onboarding") {
    return <OnboardingScreen onContinue={goToSignIn} />;
  }

  if (flow === "signin") {
    return (
      <SignInScreen
        onSignUpPress={goToSignUp}
        onGooglePress={handleGoogleAuth}
        onForgotPasswordPress={goToForgotPassword}
        onBackPress={goToOnboarding}
      />
    );
  }

  if (flow === "signup") {
    return (
      <SignUpScreen
        onSignInPress={goToSignIn}
        onRegisterSuccess={(email) => {
          setVerifyEmail(email);
          setPendingVerificationEmail(email);
          setFlow("verify-email");
        }}
        onGooglePress={handleGoogleAuth}
        onBackPress={goToSignIn}
      />
    );
  }

  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
