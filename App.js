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

function AuthFlowOverlay() {
  const {
    authGate,
    setAuthGate,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    closeAuth,
  } = useAuth();
  const [verifyEmail, setVerifyEmail] = useState(null);

  const goToSignIn = () => setAuthGate("signin");
  const goToSignUp = () => setAuthGate("signup");
  const goToForgotPassword = () => setAuthGate("forgot-password");

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

  if (!authGate) return null;

  let screen = null;

  if (authGate === "verify-email" && (verifyEmail || pendingVerificationEmail)) {
    const email = verifyEmail ?? pendingVerificationEmail;
    screen = (
      <VerifyEmailScreen
        email={email}
        onSuccess={goToSignIn}
        onBackPress={goToSignUp}
      />
    );
  } else if (authGate === "forgot-password") {
    screen = (
      <ForgotPasswordScreen
        onBackPress={goToSignIn}
        onSuccess={goToSignIn}
      />
    );
  } else if (authGate === "onboarding") {
    screen = <OnboardingScreen onContinue={goToSignIn} />;
  } else if (authGate === "signup") {
    screen = (
      <SignUpScreen
        onSignInPress={goToSignIn}
        onRegisterSuccess={(email) => {
          setVerifyEmail(email);
          setPendingVerificationEmail(email);
          setAuthGate("verify-email");
        }}
        onGooglePress={handleGoogleAuth}
        onBackPress={goToSignIn}
      />
    );
  } else {
    screen = (
      <SignInScreen
        onSignUpPress={goToSignUp}
        onGooglePress={handleGoogleAuth}
        onForgotPasswordPress={goToForgotPassword}
        onBackPress={closeAuth}
      />
    );
  }

  return <View style={styles.authOverlay}>{screen}</View>;
}

function AppContent() {
  const { isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <CartProvider>
      <CheckoutProvider>
        <WalletProvider>
          <FavoritesProvider>
            <MessagesProvider>
              <View style={styles.root}>
                <AppNavigator />
                <AuthFlowOverlay />
              </View>
            </MessagesProvider>
          </FavoritesProvider>
        </WalletProvider>
      </CheckoutProvider>
    </CartProvider>
  );
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
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  authOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
    backgroundColor: colors.background,
  },
});
