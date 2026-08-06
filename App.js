import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  extractOAuthCodeFromUrl,
  isOAuthReturnUrl,
  startGoogleOAuth,
} from "./src/services/googleOAuth";
import { showDevMessage } from "./src/utils/devFeedback";
import { colors } from "./src/theme/colors";
import { LanguageProvider } from "./src/i18n/LanguageProvider";
import "./src/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

function AuthFlowOverlay() {
  const {
    authGate,
    setAuthGate,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    closeAuth,
    exchangeOAuthCode,
    isSubmitting,
  } = useAuth();
  const [verifyEmail, setVerifyEmail] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const oauthHandledRef = useRef(new Set());

  const goToSignIn = () => setAuthGate("signin");
  const goToSignUp = () => setAuthGate("signup");
  const goToForgotPassword = () => setAuthGate("forgot-password");

  const completeOAuthWithCode = useCallback(
    async (code, { silent } = {}) => {
      if (!code) return { ok: false };
      if (oauthHandledRef.current.has(code)) {
        return { ok: true, duplicate: true };
      }
      oauthHandledRef.current.add(code);

      setGoogleLoading(true);
      try {
        const result = await exchangeOAuthCode(code);
        if (!result.ok) {
          oauthHandledRef.current.delete(code);
          if (!silent) {
            showDevMessage(
              "Google",
              result.message ?? "Échec de la connexion Google."
            );
          }
          return result;
        }
        return { ok: true };
      } finally {
        setGoogleLoading(false);
      }
    },
    [exchangeOAuthCode]
  );

  const handleOAuthUrl = useCallback(
    async (url) => {
      if (!isOAuthReturnUrl(url)) return;
      const code = extractOAuthCodeFromUrl(url);
      if (!code) return;
      await completeOAuthWithCode(code);
    },
    [completeOAuthWithCode]
  );

  useEffect(() => {
    let sub;
    (async () => {
      try {
        const initial = await Linking.getInitialURL();
        if (initial) await handleOAuthUrl(initial);
      } catch {
        // ignore
      }
      sub = Linking.addEventListener("url", ({ url }) => {
        handleOAuthUrl(url);
      });
    })();
    return () => sub?.remove?.();
  }, [handleOAuthUrl]);

  const handleGoogleAuth = async () => {
    if (googleLoading || isSubmitting) return;
    setGoogleLoading(true);
    try {
      const started = await startGoogleOAuth();
      if (started.ok && started.code) {
        await completeOAuthWithCode(started.code);
        return;
      }
      if (started.cancelled) return;
      if (started.pendingBrowser) {
        showDevMessage("Google", started.message);
        return;
      }
      showDevMessage(
        "Google",
        started.message ?? "Connexion Google impossible."
      );
    } finally {
      setGoogleLoading(false);
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
        googleLoading={googleLoading}
      />
    );
  } else {
    screen = (
      <SignInScreen
        onSignUpPress={goToSignUp}
        onGooglePress={handleGoogleAuth}
        onForgotPasswordPress={goToForgotPassword}
        onBackPress={closeAuth}
        googleLoading={googleLoading}
      />
    );
  }

  return (
    <View style={styles.authOverlay}>
      {screen}
      {googleLoading ? (
        <View style={styles.googleOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </View>
  );
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

  // Providers Buy/Wallet restent montés (évite crash imports) mais UI/routes masqués via flag.
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
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </QueryClientProvider>
      </LanguageProvider>
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
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: colors.background,
  },
  googleOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    zIndex: 2,
  },
});
