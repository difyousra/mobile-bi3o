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

export function userAvatarUrl(user?: User | null): string {
  if (!user) return FALLBACK_AVATAR;
  const raw =
    user.avatarUrl ?? user.photoUrl ?? user.avatar ?? undefined;
  return resolveMediaUrl(raw) ?? FALLBACK_AVATAR;
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
    avatar:
      resolveMediaUrl(
        (row.avatarUrl as string) ??
          (row.photoUrl as string) ??
          (row.avatar as string)
      ) ?? undefined,
    typeCompte:
      typeof row.typeCompte === "string" ? row.typeCompte : undefined,
    telephone:
      typeof row.telephone === "string" ? row.telephone : undefined,
    ville: typeof row.ville === "string" ? row.ville : undefined,
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
