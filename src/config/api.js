import Constants from "expo-constants";

/**
 * Base URL — source de vérité : preprod.postman_environment.json
 * apiBaseUrl = https://new.bi3oo.com/api
 *
 * Surcharge : EXPO_PUBLIC_API_URL
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  Constants.expoConfig?.extra?.apiUrl ??
  "https://new.bi3oo.com/api";

/** STOMP — ne pas activer tant que REST messagerie n’est pas validé */
export const WS_URL =
  process.env.EXPO_PUBLIC_WS_URL ?? "wss://new.bi3oo.com/ws";

export const CONNECT_TIMEOUT_MS = 15000;
export const UPLOAD_TIMEOUT_MS = 240000;

export function getApiHostLabel() {
  try {
    return new URL(API_BASE_URL).host;
  } catch {
    return API_BASE_URL;
  }
}
