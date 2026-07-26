/**
 * TokenManager — access + refresh dans SecureStore (Keychain / Keystore Expo).
 * Jamais AsyncStorage pour les JWT (contrat mobile_api.md).
 */
import * as SecureStore from "expo-secure-store";
import type { AuthSession } from "../types/auth";

const SERVICE = "bi3oo.auth.session";

let memory: AuthSession | null = null;

async function writeSecure(json: string): Promise<void> {
  await SecureStore.setItemAsync(SERVICE, json);
}

async function readSecure(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SERVICE);
  } catch {
    return null;
  }
}

async function deleteSecure(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SERVICE);
  } catch {
    // déjà absent
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  if (!session.token || !session.refreshToken) {
    throw new Error("SESSION_INCOMPLETE");
  }
  memory = session;
  await writeSecure(JSON.stringify(session));
}

export async function getSession(): Promise<AuthSession | null> {
  if (memory?.token && memory.refreshToken) return memory;
  const raw = await readSecure();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed?.token && parsed?.refreshToken) {
      memory = parsed;
      return parsed;
    }
  } catch {
    await clearSession();
  }
  return null;
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.token ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const session = await getSession();
  return session?.refreshToken ?? null;
}

export async function clearSession(): Promise<void> {
  memory = null;
  await deleteSecure();
}

/** Compat anciens imports — access token uniquement. */
export async function saveToken(token: string): Promise<void> {
  const current = await getSession();
  if (current?.refreshToken) {
    await saveSession({ token, refreshToken: current.refreshToken });
  } else {
    memory = { token, refreshToken: current?.refreshToken ?? "" };
  }
}

export async function getToken(): Promise<string | null> {
  return getAccessToken();
}

export async function clearToken(): Promise<void> {
  await clearSession();
}
