/**
 * Backend prod : /opt/monprojet/prod → https://bi3oo.com/api
 * Surcharge : EXPO_PUBLIC_API_URL / EXPO_PUBLIC_WS_URL
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://bi3oo.com/api";

/** STOMP temps réel — notifications + messagerie */
export const WS_URL =
  process.env.EXPO_PUBLIC_WS_URL ?? "wss://bi3oo.com/ws";

export const CONNECT_TIMEOUT_MS = 15000;
export const UPLOAD_TIMEOUT_MS = 240000;

export function getApiHostLabel() {
  try {
    return new URL(API_BASE_URL).host;
  } catch {
    return API_BASE_URL;
  }
}
