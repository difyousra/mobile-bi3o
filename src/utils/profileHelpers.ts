import { resolveMediaUrl } from "../utils/mediaUrl";
import type { User } from "../types/auth";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80";

export function userDisplayName(user?: User | null): string {
  if (!user) return "Utilisateur";
  const full = `${user.prenom ?? ""} ${user.nom ?? ""}`.trim();
  if (full) return full;
  return user.email?.split("@")[0] ?? "Utilisateur";
}

/**
 * Photo profil API publique : nested dans `particulier.photoUrl` ou `pro.photoUrl`.
 * GET /users/public/{id} ne met pas photoUrl à la racine.
 */
export function publicProfilePhotoUrl(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const row = data as Record<string, unknown>;
  const particulier =
    row.particulier && typeof row.particulier === "object"
      ? (row.particulier as Record<string, unknown>)
      : null;
  const pro =
    row.pro && typeof row.pro === "object"
      ? (row.pro as Record<string, unknown>)
      : null;

  const raw =
    (typeof particulier?.photoUrl === "string" ? particulier.photoUrl : undefined) ??
    (typeof pro?.photoUrl === "string" ? pro.photoUrl : undefined) ??
    (typeof row.photoUrl === "string" ? row.photoUrl : undefined) ??
    (typeof row.avatarUrl === "string" ? row.avatarUrl : undefined) ??
    (typeof row.avatar === "string" ? row.avatar : undefined);

  return resolveMediaUrl(raw);
}

export function publicProfileVille(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const row = data as Record<string, unknown>;
  const particulier =
    row.particulier && typeof row.particulier === "object"
      ? (row.particulier as Record<string, unknown>)
      : null;
  const pro =
    row.pro && typeof row.pro === "object"
      ? (row.pro as Record<string, unknown>)
      : null;

  if (typeof particulier?.ville === "string" && particulier.ville.trim()) {
    return particulier.ville.trim();
  }
  if (typeof pro?.ville === "string" && pro.ville.trim()) {
    return pro.ville.trim();
  }
  if (typeof row.ville === "string" && row.ville.trim()) {
    return row.ville.trim();
  }
  return undefined;
}

export function userAvatarUrl(
  user?: User | null,
  publicProfile?: unknown
): string {
  if (user) {
    const fromUser = resolveMediaUrl(
      user.avatarUrl ?? user.photoUrl ?? user.avatar ?? undefined
    );
    if (fromUser) return fromUser;
  }
  const fromPublic = publicProfilePhotoUrl(publicProfile);
  if (fromPublic) return fromPublic;
  return FALLBACK_AVATAR;
}

/** Normalise GET /annonces/suggestions → libellés cliquables. */
export function normalizeSuggestions(data: unknown): string[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          const v =
            row.titre ??
            row.suggestion ??
            row.label ??
            row.q ??
            row.query ??
            row.text;
          return typeof v === "string" ? v.trim() : "";
        }
        return "";
      })
      .filter(Boolean)
      .slice(0, 8);
  }
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) return normalizeSuggestions(obj.content);
    if (Array.isArray(obj.suggestions)) {
      return normalizeSuggestions(obj.suggestions);
    }
  }
  return [];
}

export type PublicSellerUi = {
  id: number;
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
  typeCompte?: string;
  telephone?: string;
  ville?: string;
};

/** Mappe GET /users/public/{id} (shape défensive). */
export function mapPublicSeller(data: unknown, fallbackId: number): PublicSellerUi {
  if (!data || typeof data !== "object") {
    return { id: fallbackId, name: `Vendeur #${fallbackId}` };
  }
  const row = data as Record<string, unknown>;
  const id = Number(row.id ?? fallbackId);
  const prenom = String(row.prenom ?? "").trim();
  const nom = String(row.nom ?? "").trim();
  const name =
    `${prenom} ${nom}`.trim() ||
    String(row.name ?? row.nomComplet ?? row.email ?? `Vendeur #${id}`);

  const particulier =
    row.particulier && typeof row.particulier === "object"
      ? (row.particulier as Record<string, unknown>)
      : null;
  const pro =
    row.pro && typeof row.pro === "object"
      ? (row.pro as Record<string, unknown>)
      : null;

  return {
    id: Number.isFinite(id) ? id : fallbackId,
    name,
    email: typeof row.email === "string" ? row.email : undefined,
    bio:
      typeof row.biographie === "string"
        ? row.biographie
        : typeof row.bio === "string"
          ? row.bio
          : undefined,
    avatar: publicProfilePhotoUrl(data),
    typeCompte:
      typeof row.typeCompte === "string" ? row.typeCompte : undefined,
    telephone:
      typeof row.telephone === "string"
        ? row.telephone
        : typeof pro?.telephone === "string"
          ? (pro.telephone as string)
          : typeof particulier?.telephone === "string"
            ? (particulier.telephone as string)
            : undefined,
    ville: publicProfileVille(data),
  };
}

/** Extrait dates occupées du calendrier réservation (défensif). */
export function extractCalendarBusyDates(data: unknown): string[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          return String(
            row.date ?? row.jour ?? row.startDate ?? row.dateDebut ?? ""
          );
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.dates)) return extractCalendarBusyDates(obj.dates);
    if (Array.isArray(obj.occupied)) {
      return extractCalendarBusyDates(obj.occupied);
    }
    if (Array.isArray(obj.content)) {
      return extractCalendarBusyDates(obj.content);
    }
  }
  return [];
}
