/**
 * TokenManager — access + refresh.
 * Native : SecureStore (Keychain / Keystore Expo).
 * Web : fallback AsyncStorage (SecureStore non fiable / absent).
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession } from "../types/auth";

const SERVICE = "bi3oo.auth.session";

let memory: AuthSession | null = null;

let useSecureStore: boolean | null = null;

async function canUseSecureStore(): Promise<boolean> {
  if (useSecureStore != null) return useSecureStore;
  if (Platform.OS === "web") {
    useSecureStore = false;
    return false;
  }
  try {
    useSecureStore = await SecureStore.isAvailableAsync();
  } catch {
    useSecureStore = false;
  }
  return useSecureStore;
}

async function writePersist(json: string): Promise<void> {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(SERVICE, json);
    return;
  }
  await AsyncStorage.setItem(SERVICE, json);
}

async function readPersist(): Promise<string | null> {
  if (await canUseSecureStore()) {
    try {
      return await SecureStore.getItemAsync(SERVICE);
    } catch {
      return null;
    }
  }
  try {
    return await AsyncStorage.getItem(SERVICE);
  } catch {
    return null;
  }
}

async function deletePersist(): Promise<void> {
  if (await canUseSecureStore()) {
    try {
      await SecureStore.deleteItemAsync(SERVICE);
    } catch {
      // déjà absent
    }
    return;
  }
  try {
    await AsyncStorage.removeItem(SERVICE);
  } catch {
    // déjà absent
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  if (!session.token || !session.refreshToken) {
    throw new Error("SESSION_INCOMPLETE");
  }
  memory = session;
  await writePersist(JSON.stringify(session));
}

export async function getSession(): Promise<AuthSession | null> {
  if (memory?.token && memory.refreshToken) return memory;
  const raw = await readPersist();
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
  await deletePersist();
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
