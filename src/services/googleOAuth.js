import { Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { API_BASE_URL } from "../config/api";

WebBrowser.maybeCompleteAuthSession();

const APP_SCHEME = "bi3oo";

/** Origine sans /api — nginx proxifie /oauth2/authorization/ vers Spring. */
export function getApiOrigin() {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}

/**
 * Web : authorization Google directe (retour /oauth2/success).
 * Native : mobile-start pose un cookie puis Google → 302 bi3oo://oauth?code=…
 */
export function getGoogleAuthorizationUrl() {
  if (Platform.OS === "web") {
    return `${getApiOrigin()}/oauth2/authorization/google`;
  }
  // Nginx : /api/ → Spring (préfixe retiré). /auth/... hors /api tombe sur le SPA.
  return `${getApiOrigin()}/api/auth/oauth/mobile-start`;
}

/** Deep link store / handoff depuis la page web /oauth2/success. */
export function getOAuthAppSchemeUrl(code) {
  const q = code ? `?code=${encodeURIComponent(code)}` : "";
  return `${APP_SCHEME}://oauth${q}`;
}

/**
 * URL de retour pour openAuthSessionAsync.
 * Web Expo : préfixe HTTPS success (popup + window.opener).
 * Native : scheme bi3oo:// — doit matcher le 302 backend / handoff success.
 */
export function getOAuthReturnUrl() {
  if (Platform.OS === "web") {
    return `${getApiOrigin()}/oauth2/success`;
  }
  return getOAuthAppSchemeUrl();
}

/**
 * Extrait le code one-time depuis une URL de retour
 * (bi3oo://oauth?code=…, exp://…/oauth?code=…, https://…/oauth2/success?code=…).
 */
export function extractOAuthCodeFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const match = url.match(/[?&#]code=([^&#]+)/i);
    if (match?.[1]) return decodeURIComponent(match[1].trim());
    const normalized = url.includes("://") ? url : `${APP_SCHEME}://${url}`;
    const parsed = new URL(normalized);
    const code =
      parsed.searchParams.get("code") ||
      parsed.searchParams.get("oauthCode");
    return code ? code.trim() : null;
  } catch {
    const match = url.match(/[?&#]code=([^&#]+)/i);
    return match?.[1] ? decodeURIComponent(match[1].trim()) : null;
  }
}

export function isOAuthReturnUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (!extractOAuthCodeFromUrl(url)) return false;
  return (
    url.startsWith(`${APP_SCHEME}://`) ||
    url.includes("/oauth2/success") ||
    url.includes("/oauth") ||
    /:\/\/oauth([/?#]|$)/i.test(url)
  );
}

/**
 * Lance Google OAuth (Custom Tab / ASWebAuthenticationSession / popup web).
 * Native : /auth/oauth/mobile-start → Google → 302 bi3oo://oauth?code=…
 *
 * @returns {{ ok: true, code: string } | { ok: false, cancelled?: boolean, pendingBrowser?: boolean, message: string }}
 */
export async function startGoogleOAuth() {
  const authUrl = getGoogleAuthorizationUrl();
  const returnUrl = getOAuthReturnUrl();

  try {
    const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl, {
      // false : le cookie bi3oo_oauth_client doit survivre Google → /login/oauth2/code
      preferEphemeralSession: false,
      showInRecents: false,
    });

    if (result.type === "cancel" || result.type === "dismiss") {
      return { ok: false, cancelled: true, message: "Connexion Google annulée." };
    }

    if (result.type === "success" && result.url) {
      const code = extractOAuthCodeFromUrl(result.url);
      if (code) return { ok: true, code };
      return {
        ok: false,
        message: "Réponse Google sans code. Réessayez.",
      };
    }

    return {
      ok: false,
      message:
        "Impossible de récupérer le code Google. Réessayez ou utilisez e-mail / mot de passe.",
    };
  } catch (e) {
    try {
      await Linking.openURL(authUrl);
      return {
        ok: false,
        pendingBrowser: true,
        message:
          "Finalisez la connexion Google dans le navigateur ; l’app récupérera le code au retour.",
      };
    } catch {
      return {
        ok: false,
        message: e?.message ?? "Impossible d’ouvrir Google OAuth.",
      };
    }
  }
}
