/** Contrats DTO — mobile_api.md §5 · ne pas inventer de champs. */

export type AccountType = "PARTICULIER" | "PROFESSIONNEL";

export type ApiError = {
  status: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
};

export type Page<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  biographie?: string | null;
  whatsapp?: string | null;
  siteWeb?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  typeCompte: AccountType;
  role: string;
  emailValide: boolean;
  compteActive: boolean;
  emailConfirmationEnvoye?: boolean;
  /** Champs optionnels selon réponse avatar / me (parsing défensif). */
  avatarUrl?: string | null;
  photoUrl?: string | null;
  avatar?: string | null;
};

/** Réponse login / refresh / oauth exchange (ReqRes). */
export type AuthTokensResponse = {
  statusCode?: number;
  token?: string;
  refreshToken?: string;
  expirationTime?: string;
  role?: string;
  name?: string;
  email?: string;
  message?: string;
  error?: string;
};

export type AuthSession = {
  token: string;
  refreshToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  typeCompte: AccountType;
  biographie?: string;
  role?: string;
  siret?: string;
  nomSociete?: string;
  justificatifStatut?: string;
  categorieActivite?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
};

export type VerifyEmailRequest = {
  email: string;
  code: string;
};

export type ResendOtpRequest = {
  email: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type OAuthExchangeRequest = {
  code: string;
};

export type LogoutRequest = {
  refreshToken?: string;
};

export type MessageResponse = {
  message: string;
};
