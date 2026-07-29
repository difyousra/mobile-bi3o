import { apiClient } from "../api/client";
import { API_BASE_URL, UPLOAD_TIMEOUT_MS } from "../config/api";
import { getAccessToken } from "../api/tokenManager";
import type { Page } from "../types/auth";
import type {
  ConversationDto,
  ConversationsPage,
  MessageDto,
  MessagesPage,
  SendMessageRequest,
  StartConversationRequest,
} from "../types/messaging";
import type { LocalPhoto } from "../types/publish";

function asPage<T>(data: unknown): Page<T> {
  if (data && typeof data === "object" && Array.isArray((data as Page<T>).content)) {
    return data as Page<T>;
  }
  if (Array.isArray(data)) {
    return {
      content: data as T[],
      number: 0,
      size: data.length,
      totalElements: data.length,
      totalPages: 1,
      first: true,
      last: true,
    };
  }
  return {
    content: [],
    number: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  };
}

function extractId(data: unknown): number | undefined {
  if (!data || typeof data !== "object") return undefined;
  const row = data as Record<string, unknown>;
  const raw =
    row.id ?? row.conversationId ?? row.conversation_id ?? row.messageId;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** GET /messagerie/conversations */
export async function fetchConversations(params?: {
  page?: number;
  size?: number;
}): Promise<Page<ConversationDto>> {
  const { data } = await apiClient.get<ConversationsPage>(
    "/messagerie/conversations",
    {
      params: { page: params?.page ?? 0, size: params?.size ?? 50 },
    }
  );
  return asPage<ConversationDto>(data);
}

/**
 * POST /messagerie/annonces/{annonceId}/conversations
 * Body Postman : `{ "message": "..." }`
 */
export async function startConversation(
  annonceId: number | string,
  body: StartConversationRequest
): Promise<ConversationDto & { id: number }> {
  const { data } = await apiClient.post(
    `/messagerie/annonces/${annonceId}/conversations`,
    body
  );
  const id = extractId(data);
  if (!id) {
    throw new Error("Conversation créée mais id manquant dans la réponse.");
  }
  return { ...(data as ConversationDto), id };
}

/** GET /messagerie/conversations/{id}/messages */
export async function fetchMessages(
  conversationId: number | string,
  params?: { page?: number; size?: number }
): Promise<Page<MessageDto>> {
  const { data } = await apiClient.get<MessagesPage>(
    `/messagerie/conversations/${conversationId}/messages`,
    {
      params: { page: params?.page ?? 0, size: params?.size ?? 100 },
    }
  );
  return asPage<MessageDto>(data);
}

/**
 * POST /messagerie/conversations/{id}/messages
 * Body Postman : `{ "body": "..." }`
 */
export async function sendMessage(
  conversationId: number | string,
  body: SendMessageRequest
): Promise<MessageDto> {
  const { data } = await apiClient.post(
    `/messagerie/conversations/${conversationId}/messages`,
    body
  );
  return data as MessageDto;
}

/** POST /messagerie/conversations/{id}/archive */
export async function archiveConversation(
  conversationId: number | string
): Promise<void> {
  await apiClient.post(`/messagerie/conversations/${conversationId}/archive`);
}

/**
 * POST /messagerie/conversations/{id}/images — multipart champ `file`
 * (images + audio : webm/ogg/mp3/m4a/wav… acceptés côté backend).
 */
export async function sendConversationMedia(
  conversationId: number | string,
  media: LocalPhoto
): Promise<MessageDto> {
  const token = await getAccessToken();
  const form = new FormData();
  form.append("file", {
    uri: media.uri,
    type: media.mimeType ?? "image/jpeg",
    name: media.fileName ?? "chat.jpg",
  } as unknown as Blob);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${API_BASE_URL}/messagerie/conversations/${conversationId}/images`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: form,
        signal: controller.signal,
      }
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw Object.assign(
        new Error(data?.message ?? `Upload média chat (${response.status})`),
        { status: response.status, data }
      );
    }
    return data as MessageDto;
  } finally {
    clearTimeout(timer);
  }
}

/** @deprecated préférer sendConversationMedia */
export async function sendConversationImage(
  conversationId: number | string,
  image: LocalPhoto
): Promise<MessageDto> {
  return sendConversationMedia(conversationId, image);
}
