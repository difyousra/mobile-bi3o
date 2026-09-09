import { resolveMediaUrl } from "../utils/mediaUrl";
import { formatMemberSinceDate } from "../utils/blockedUsers";
import type {
  ConversationDto,
  MessageDto,
  UiConversation,
  UiMessage,
} from "../types/messaging";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80";
const FALLBACK_PRODUCT =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80";

function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatPriceLabel(prix?: number): string {
  if (typeof prix !== "number" || !Number.isFinite(prix)) return "";
  return `${prix.toLocaleString("fr-FR")} €`;
}

function pickText(msg: MessageDto): string {
  return String(
    msg.body ?? msg.contenu ?? msg.message ?? msg.text ?? ""
  ).trim();
}

function isImageUrl(value: string): boolean {
  const v = value.toLowerCase();
  if (!(v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/"))) {
    return false;
  }
  return /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(v);
}

function isAudioUrl(value: string): boolean {
  const v = value.toLowerCase();
  if (!(v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/"))) {
    return false;
  }
  return /\.(webm|ogg|oga|mp3|m4a|aac|wav|opus)(\?.*)?$/i.test(v);
}

function pickImage(msg: MessageDto): string | undefined {
  const fromField =
    msg.imageUrl ??
    msg.url ??
    (typeof msg.image === "string" ? msg.image : undefined);
  if (fromField) return resolveMediaUrl(fromField as string);

  const body = pickText(msg);
  if (body && isImageUrl(body)) return resolveMediaUrl(body);
  return undefined;
}

function pickAudio(msg: MessageDto): string | undefined {
  const body = pickText(msg);
  if (body && isAudioUrl(body)) return resolveMediaUrl(body);
  return undefined;
}

function pickSenderId(msg: MessageDto): number | undefined {
  const raw = msg.senderId ?? msg.expediteurId ?? msg.auteurId;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Mappe un message API → bulle UI. */
export function mapMessageToUi(
  msg: MessageDto,
  currentUserId?: number | null
): UiMessage {
  const image = pickImage(msg);
  const audio = pickAudio(msg);
  const rawText = pickText(msg);
  const text =
    image || audio
      ? undefined
      : rawText || undefined;
  const senderId = pickSenderId(msg);

  let sender: "me" | "them" = "them";
  if (msg.fromMe === true || msg.moi === true) {
    sender = "me";
  } else if (
    currentUserId != null &&
    senderId != null &&
    senderId === currentUserId
  ) {
    sender = "me";
  }

  const type: UiMessage["type"] = audio
    ? "audio"
    : image
      ? "image"
      : "text";

  return {
    id: String(msg.id ?? `${Date.now()}-${Math.random()}`),
    type,
    text,
    image,
    audio,
    sender,
    time: formatTime(
      (msg.createdAt as string) ??
        (msg.sentAt as string) ??
        undefined
    ),
    read: Boolean(msg.read ?? msg.lu),
  };
}

function interlocutorName(c: ConversationDto): string {
  const otherUserNom = String(c.otherUserNom ?? "").trim();
  if (otherUserNom) return otherUserNom;

  const prenom = String(c.interlocuteurPrenom ?? "").trim();
  const nom = String(c.interlocuteurNom ?? "").trim();
  const full = `${prenom} ${nom}`.trim();
  if (full) return full;
  if (typeof c.sellerName === "string" && c.sellerName) return c.sellerName;
  if (typeof c.nom === "string" && c.nom) return c.nom;
  return "Conversation";
}

function productTitle(c: ConversationDto): string {
  return String(
    c.titreAnnonce ?? c.annonceTitre ?? c.titre ?? "Annonce"
  );
}

function annonceIdOf(c: ConversationDto): number | undefined {
  const n = Number(c.annonceId ?? c.annonce_id);
  return Number.isFinite(n) ? n : undefined;
}

/** Mappe une conversation API → ligne liste / header chat. */
export function mapConversationToUi(
  c: ConversationDto,
  messages: UiMessage[] = []
): UiConversation {
  const sellerIdRaw = c.otherUserId ?? c.interlocuteurId;
  const sellerId = Number.isFinite(Number(sellerIdRaw))
    ? Number(sellerIdRaw)
    : undefined;

  const unreadCount =
    typeof c.unreadCount === "number" && Number.isFinite(c.unreadCount)
      ? c.unreadCount
      : undefined;

  const avatar =
    resolveMediaUrl(
      (c.otherUserPhotoUrl as string) ??
        (c.interlocuteurAvatar as string) ??
        (typeof c.avatar === "string" ? c.avatar : undefined)
    ) ?? FALLBACK_AVATAR;

  const cover =
    resolveMediaUrl(c.coverUrl as string | undefined) ?? FALLBACK_PRODUCT;

  const lastAt = (c.otherUserLastActivityAt ??
    c.lastMessageAt ??
    c.updatedAt ??
    c.createdAt) as
    | string
    | undefined;

  const sellerVille = String(c.otherUserVille ?? "").trim() || undefined;
  const memberSinceRaw =
    (c.otherUserCreatedAt as string | undefined) ?? undefined;
  const sellerMemberSince = formatMemberSinceDate(memberSinceRaw) ?? undefined;
  const otherUserIsSeller =
    typeof c.otherUserIsSeller === "boolean" ? c.otherUserIsSeller : true;

  return {
    id: c.id,
    sellerId,
    sellerName: interlocutorName(c),
    sellerAvatar: avatar,
    sellerVille,
    sellerMemberSince,
    otherUserIsSeller,
    lastSeen: lastAt
      ? `Dernière activité ${formatTime(lastAt)}`
      : "Messagerie Bi3oo",
    unreadCount,
    product: {
      id: annonceIdOf(c) ?? c.id,
      title: productTitle(c),
      status: c.archived ? "Archivée" : "Annonce",
      price: formatPriceLabel(
        typeof c.prix === "number" ? c.prix : undefined
      ),
      image: cover,
    },
    headerVariant: "seller",
    annonceId: annonceIdOf(c),
    preview: typeof c.lastMessage === "string" ? c.lastMessage : undefined,
    messages,
  };
}
