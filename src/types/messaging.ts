import type { Page } from "./auth";

/**
 * Contrats messagerie — mobile_api.md §4.5 · Postman « Engagement, réservation et messagerie ».
 * Champs réponse optionnels : OpenAPI live non fiable → parsing défensif côté mapper.
 */

/** POST /messagerie/annonces/{annonceId}/conversations — Postman */
export type StartConversationRequest = {
  message: string;
};

/** POST /messagerie/conversations/{id}/messages — Postman */
export type SendMessageRequest = {
  body: string;
};

export type ConversationDto = {
  id: number;
  annonceId?: number;
  titreAnnonce?: string;
  annonceTitre?: string;
  coverUrl?: string;
  prix?: number;
  interlocuteurId?: number;
  interlocuteurNom?: string;
  interlocuteurPrenom?: string;
  interlocuteurAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  updatedAt?: string;
  createdAt?: string;
  archived?: boolean;
  [key: string]: unknown;
};

export type MessageDto = {
  id: number;
  body?: string;
  contenu?: string;
  message?: string;
  text?: string;
  imageUrl?: string;
  url?: string;
  type?: string;
  senderId?: number;
  expediteurId?: number;
  auteurId?: number;
  fromMe?: boolean;
  moi?: boolean;
  createdAt?: string;
  sentAt?: string;
  read?: boolean;
  lu?: boolean;
  [key: string]: unknown;
};

export type ConversationsPage = Page<ConversationDto> | ConversationDto[];
export type MessagesPage = Page<MessageDto> | MessageDto[];

/** Forme UI consommée par ChatContent / MessagesList */
export type UiConversation = {
  id: number | string;
  sellerName: string;
  sellerAvatar: string;
  lastSeen: string;
  product: {
    id: number | string;
    title: string;
    status: string;
    price: string;
    image: string;
  };
  headerVariant: "seller" | "logo";
  annonceId?: number;
  preview?: string;
  messages: UiMessage[];
};

export type UiMessage = {
  id: string;
  type: "text" | "image";
  text?: string;
  image?: string;
  sender: "me" | "them";
  time: string;
  read?: boolean;
};

/** Réservations — mobile_api.md §4.4 (service prêt ; UI calendrier minimale) */
export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REJECTED"
  | string;

export type ReservationDto = {
  id: number;
  annonceId?: number;
  status?: ReservationStatus;
  statut?: ReservationStatus;
  startDate?: string;
  endDate?: string;
  dateDebut?: string;
  dateFin?: string;
  [key: string]: unknown;
};
