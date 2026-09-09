import AsyncStorage from "@react-native-async-storage/async-storage";

/** Même clé que le frontend web — block local (pas d’API serveur). */
export const BLOCKED_USERS_KEY = "bioo_blocked_users_v1";

export async function getBlockedUserIds() {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));
  } catch {
    return [];
  }
}

export async function isUserBlocked(userId) {
  const id = Number(userId);
  if (!Number.isFinite(id)) return false;
  const list = await getBlockedUserIds();
  return list.includes(id);
}

export async function blockUser(userId) {
  const id = Number(userId);
  if (!Number.isFinite(id)) return [];
  const list = await getBlockedUserIds();
  if (list.includes(id)) return list;
  const next = [...list, id];
  await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(next));
  return next;
}

export async function unblockUser(userId) {
  const id = Number(userId);
  if (!Number.isFinite(id)) return getBlockedUserIds();
  const next = (await getBlockedUserIds()).filter((x) => x !== id);
  await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(next));
  return next;
}

export function formatMemberSinceDate(iso, locale = "fr-FR") {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
