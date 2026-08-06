import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as authService from "../services/authService";
import { getAccessToken } from "../api/tokenManager";
import { queryKeys } from "../api/queryKeys";
import { normalizePhoneForApi } from "../utils/phone";
import { fetchPublicSeller } from "../services/annoncesService";
import { publicProfilePhotoUrl } from "../utils/profileHelpers";
import {
  navigateToReturnTarget,
  resetToHome,
} from "../navigation/navigationRef";
import i18n from "../i18n";

const AuthContext = createContext(null);

const LOGIN_ERROR_I18N_KEYS = {
  ACCOUNT_DISABLED_PENDING_PRO: "mobile.auth.accountDisabledPendingPro",
  ACCOUNT_DISABLED_ADMIN: "mobile.auth.accountDisabledAdmin",
};

async function enrichUserWithPhoto(user) {
  if (!user?.id) return user;
  try {
    const pub = await fetchPublicSeller(user.id);
    const photo = publicProfilePhotoUrl(pub);
    if (photo) {
      return { ...user, photoUrl: photo, avatarUrl: photo };
    }
  } catch {
    // ignore — photo optionnelle
  }
  return user;
}

function loginErrorMessage(parsed) {
  const { statusCode, message, error } = parsed;

  if (statusCode === 403) {
    if (error && LOGIN_ERROR_I18N_KEYS[error]) {
      return i18n.t(LOGIN_ERROR_I18N_KEYS[error]);
    }
    if (message && LOGIN_ERROR_I18N_KEYS[message]) {
      return i18n.t(LOGIN_ERROR_I18N_KEYS[message]);
    }
    return typeof error === "string" && error.length > 40
      ? error
      : message ?? i18n.t("mobile.auth.accessDenied");
  }

  if (statusCode === 401 || message === "Credentials are wrong") {
    return i18n.t("mobile.auth.wrongCredentials");
  }

  return message ?? i18n.t("mobile.auth.loginFailed");
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);
  /** null = app libre (home) ; sinon écran auth affiché en overlay */
  const [authGate, setAuthGate] = useState(null);
  const pendingReturnToRef = useRef(null);

  const finishAuthSuccess = useCallback(() => {
    setAuthGate(null);
    const target = pendingReturnToRef.current;
    pendingReturnToRef.current = null;
    if (target) {
      // laisser l’overlay se démonter avant navigation
      setTimeout(() => navigateToReturnTarget(target), 0);
    }
  }, []);

  const openAuth = useCallback((screen = "signin", options = {}) => {
    if (options.returnTo) {
      pendingReturnToRef.current = options.returnTo;
    }
    setAuthGate(screen);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthGate(null);
    pendingReturnToRef.current = null;
  }, []);

  const requireAuth = useCallback(
    (returnTo) => {
      openAuth("signin", returnTo ? { returnTo } : undefined);
    },
    [openAuth]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = await getAccessToken();
      if (!token) {
        if (mounted) setIsBootstrapping(false);
        return;
      }

      const result = await authService.getMe();
      if (mounted) {
        if (result.ok) {
          const nextUser = await enrichUserWithPhoto(result.data);
          setUser(nextUser);
          queryClient.setQueryData(queryKeys.me, nextUser);
        } else {
          await authService.logout();
        }
        setIsBootstrapping(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [queryClient]);

  const login = useCallback(
    async (email, password) => {
      setIsSubmitting(true);
      try {
        const result = await authService.login(email, password);
        if (!result.ok) {
          return { ok: false, message: loginErrorMessage(result) };
        }

        const me = await authService.getMe();
        if (me.ok) {
          const nextUser = await enrichUserWithPhoto(me.data);
          setUser(nextUser);
          queryClient.setQueryData(queryKeys.me, nextUser);
          finishAuthSuccess();
          return { ok: true };
        }

        const fallbackUser = authService.userFromLoginData(result.data);
        if (fallbackUser?.email) {
          setUser(fallbackUser);
          finishAuthSuccess();
          return { ok: true };
        }

        await authService.logout();
        return {
          ok: false,
          message:
            me.message ??
            i18n.t("mobile.auth.profileLoadFailed"),
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, finishAuthSuccess]
  );

  const register = useCallback(async (form) => {
    setIsSubmitting(true);
    try {
      const payload = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        telephone: normalizePhoneForApi(form.telephone),
        typeCompte: "PARTICULIER",
        role: "USER",
      };

      const result = await authService.register(payload);
      if (!result.ok) return { ok: false, message: result.message };

      setPendingVerificationEmail(payload.email);
      return { ok: true, email: payload.email };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const verifyEmail = useCallback(async (email, code) => {
    setIsSubmitting(true);
    try {
      const result = await authService.verifyEmail(email.trim(), code.trim());
      if (!result.ok) return { ok: false, message: result.message };
      setPendingVerificationEmail(null);
      return { ok: true, message: result.data?.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resendOtp = useCallback(async (email) => {
    setIsSubmitting(true);
    try {
      const result = await authService.resendOtp(email.trim());
      if (!result.ok) return { ok: false, message: result.message };
      return { ok: true, message: result.data?.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setIsSubmitting(true);
    try {
      const result = await authService.forgotPassword(email.trim());
      if (!result.ok) return { ok: false, message: result.message };
      return {
        ok: true,
        message:
          result.data?.message ??
          i18n.t("mobile.auth.forgotPasswordSent"),
      };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    setIsSubmitting(true);
    try {
      const result = await authService.resetPassword(token, newPassword);
      if (!result.ok) return { ok: false, message: result.message };
      return { ok: true, message: result.data?.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const exchangeOAuthCode = useCallback(
    async (code) => {
      setIsSubmitting(true);
      try {
        const result = await authService.oauthExchange(code);
        if (!result.ok) {
          return { ok: false, message: loginErrorMessage(result) };
        }
        const me = await authService.getMe();
        if (me.ok) {
          const nextUser = await enrichUserWithPhoto(me.data);
          setUser(nextUser);
          queryClient.setQueryData(queryKeys.me, nextUser);
          finishAuthSuccess();
          return { ok: true };
        }
        await authService.logout();
        return {
          ok: false,
          message: me.message ?? i18n.t("mobile.auth.oauthProfileFailed"),
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, finishAuthSuccess]
  );

  const logout = useCallback(async () => {
    // Quitter les écrans protégés AVANT de vider la session,
    // sinon ProtectedScreen/Account rouvre le gate login.
    resetToHome();
    try {
      await authService.logout();
    } catch {
      // session déjà nettoyée côté service
    }
    setUser(null);
    setPendingVerificationEmail(null);
    pendingReturnToRef.current = null;
    setAuthGate(null);
    queryClient.clear();
    // Second reset au cas où un écran stack était encore au-dessus
    setTimeout(() => resetToHome(), 0);
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    const me = await authService.getMe();
    if (me.ok) {
      const nextUser = await enrichUserWithPhoto(me.data);
      setUser((prev) => ({
        ...nextUser,
        // conserver photo locale si API /users/me n’en renvoie pas encore
        photoUrl: nextUser.photoUrl ?? prev?.photoUrl,
        avatarUrl: nextUser.avatarUrl ?? prev?.avatarUrl,
      }));
      queryClient.setQueryData(queryKeys.me, nextUser);
      return { ok: true, data: nextUser };
    }
    return { ok: false, message: me.message };
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      isSubmitting,
      pendingVerificationEmail,
      authGate,
      openAuth,
      closeAuth,
      requireAuth,
      setAuthGate,
      login,
      register,
      verifyEmail,
      resendOtp,
      forgotPassword,
      resetPassword,
      exchangeOAuthCode,
      logout,
      refreshUser,
      setUser,
      setPendingVerificationEmail,
    }),
    [
      user,
      isBootstrapping,
      isSubmitting,
      pendingVerificationEmail,
      authGate,
      openAuth,
      closeAuth,
      requireAuth,
      login,
      register,
      verifyEmail,
      resendOtp,
      forgotPassword,
      resetPassword,
      exchangeOAuthCode,
      logout,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
