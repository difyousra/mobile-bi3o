# Bi3oo — Guide d’intégration API mobile

> Mise à jour : 23 juillet 2026 · Source de vérité : code Spring Boot + `GET /v3/api-docs` (**OpenAPI 3.1.0 · 111 chemins**).  
> Les chemins Spring n’ont pas de préfixe `/api`. En préprod, Nginx expose souvent `https://new.bi3oo.com/api` ou `https://api-private.bi3oo.com/api`. Centraliser l’URL dans une variable d’environnement.

Audit associé : `docs/MOBILE_BACKEND_AUDIT.md` · Collection : `docs/postman/bi3oo-mobile.postman_collection.json` · Swagger : `/swagger-ui.html`

## 1. Résumé et prérequis

| Élément | Valeur constatée |
|---|---|
| API | Java 17 · Spring Boot 3.5.3 · REST JSON/multipart |
| Transport | HTTPS ; JSON UTF-8 ; pagination Spring (`page` dès 0) |
| Authentification | JWT Bearer + **refresh opaque rotatif** + OAuth2 Google (**code** → exchange) |
| Erreurs auth | **401 / 403 JSON** (pas de redirect OAuth sur les appels API) |
| Temps réel | STOMP `/ws` ; chat REST disponible |
| Base | PostgreSQL 16 · Flyway · monolithe Docker Compose |
| Images | URL relative `/uploads/...` à résoudre contre l’origine API |
| Documentation live | `GET /v3/api-docs`, Swagger UI `/swagger-ui.html` |

### Variables mobiles

```text
API_BASE_URL=https://new.bi3oo.com/api
WS_URL=wss://new.bi3oo.com/ws
CONNECT_TIMEOUT_MS=15000
UPLOAD_TIMEOUT_MS=240000
```

## 2. Authentification

### Cycle recommandé

1. `POST /auth/login` → recevoir `token` (access JWT) + `refreshToken` (opaque).
2. Stocker **les deux** dans Keychain (iOS) / Keystore chiffré (Android).
3. `GET /users/me` avec `Authorization: Bearer <token>`.
4. Sur chaque requête protégée : header Bearer.
5. Sur **401** access : appeler une fois `POST /auth/refresh` avec le refresh ; si échec → logout local.
6. Logout : `POST /auth/logout` avec Bearer + body `{ "refreshToken": "..." }`, puis effacer le stockage local.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Accept: application/json
Content-Type: application/json
```

### Login

`POST /auth/login` — public

```json
{ "email": "user@example.com", "password": "mot-de-passe" }
```

Réponse :

```json
{
  "statusCode": 200,
  "token": "jwt-access",
  "refreshToken": "opaque-refresh",
  "expirationTime": "24Hrs",
  "role": "USER"
}
```

> Le libellé `expirationTime` peut ne pas refléter la durée réelle de l’access JWT (~1 h). Se fonder sur le 401 + refresh, pas sur ce champ.

### Refresh

`POST /auth/refresh` — public

```json
{ "refreshToken": "opaque-refresh" }
```

Réponse : même forme que le login (nouveau `token` + nouveau `refreshToken`).  
**Rotation :** l’ancien refresh est invalidé ; le réutiliser provoque une révocation / **403**.

### OAuth Google

1. Ouvrir le navigateur système / Custom Tab : `{API_ORIGIN}/oauth2/authorization/google`
2. Après succès, le frontend reçoit une URL avec **`?code=`** (plus de JWT dans l’URL).
3. Échanger immédiatement :

`POST /auth/oauth/exchange`

```json
{ "code": "one-time-code" }
```

Réponse : session (`token` + `refreshToken`) comme le login.

### Inscription et récupération

| Méthode | URL | Auth | Corps / résultat |
|---|---|---|---|
| POST | `/auth/register` | publique | `RegisterRequest` ; OTP e-mail |
| POST | `/auth/verify-email` | publique | OTP |
| POST | `/auth/resend-otp` | publique | renvoi OTP |
| POST | `/auth/password/forgot` | publique | e-mail ; réponse neutre |
| POST | `/auth/password/reset` | publique | token + nouveau MDP |
| POST | `/auth/refresh` | publique | rotation refresh |
| POST | `/auth/oauth/exchange` | publique | code OAuth → session |
| POST | `/auth/logout` | Bearer + body refresh optionnel | révoque access + refresh |
| GET | `/users/me` | Bearer | profil |
| PATCH | `/users/me/password` | Bearer | ancien/nouveau MDP |
| POST | `/users/me/avatar` | Bearer | multipart `file` |

`RegisterRequest` :

```json
{
  "nom": "Amine",
  "prenom": "Benali",
  "email": "amine@example.com",
  "password": "au-moins-8-caracteres",
  "telephone": "+213555000000",
  "typeCompte": "PARTICULIER",
  "biographie": "Optionnel",
  "siret": "Optionnel si PROFESSIONNEL",
  "nomSociete": "Optionnel si PROFESSIONNEL"
}
```

## 3. Conventions de réponse, erreurs et pagination

### Page Spring

```json
{
  "content": [],
  "totalElements": 0,
  "totalPages": 0,
  "size": 24,
  "number": 0,
  "first": true,
  "last": true
}
```

`?page=0&size=24&sort=id,desc` — limiter côté mobile (24 catalogue, 20–50 chat).

### Erreur standard

```json
{
  "status": 401,
  "error": "UNAUTHORIZED",
  "message": "Authentification requise.",
  "path": "/me/favoris",
  "timestamp": "2026-07-23T13:55:55Z"
}
```

| Code | Sens mobile |
|---|---|
| 400 | validation / règle métier |
| 401 | access absent/invalide/expiré/blacklisté → refresh puis éventuel logout |
| 403 | rôle, propriété, refresh révoqué / reuse |
| 404 | introuvable |
| 413 | fichier trop volumineux |
| 422 | modération refusée |
| 500 / 502 | serveur / dépendance : réessai |

Refus de modération :

```json
{
  "allowed": false,
  "score": 85,
  "reason": "Cette annonce contient un contenu interdit (...)."
}
```

## 4. Catalogue des routes REST

Légende : **P** publique · **U** `USER`/`USER_PAR`/`USER_PRO`/`ADMIN` · **A** `ADMIN`.

### 4.1 Comptes et profils

| Méthode | Route | Accès | Usage mobile |
|---|---|---|---|
| POST | `/auth/register` | P | inscription/OTP |
| POST | `/auth/login` | P | connexion |
| POST | `/auth/refresh` | P | renouveler session |
| POST | `/auth/oauth/exchange` | P | finir OAuth |
| POST | `/auth/logout` | P* | révocation |
| POST | `/auth/resend-otp` | P | OTP |
| POST | `/auth/verify-email` | P | activer |
| POST | `/auth/password/forgot` | P | reset |
| POST | `/auth/password/reset` | P | reset |
| GET | `/users/me` | U | session |
| PATCH | `/users/me/password` | U | MDP |
| POST | `/users/me/avatar` | U | avatar |
| GET | `/users/public/{id}` | P | vendeur |
| PATCH | `/profiles/account/{userId}` | U | profil |
| PATCH | `/profiles/particulier/{userId}` | U | particulier |
| PATCH | `/profiles/pro/{userId}` | U | pro |
| GET | `/profiles/users/me` | U | moi |
| POST / DELETE | `/users/{sellerId}/follow` | U | follow |
| GET | `/users/{sellerId}/follow/status` | U | statut |

### 4.2 Taxonomie et recherche

| Méthode | Route | Accès | Entrées |
|---|---|---|---|
| GET | `/taxo/categories` | P | DTO catégories |
| GET | `/taxo/sous-categories` | P | **DTO plat** `{ id, nom, categorieId }` |
| GET | `/taxo/sous-categories/{id}/attributs` | P | attributs EAV |
| GET | `/taxo/sous-categories/{id}/info` | P | métadonnées |
| GET | `/taxo/sous-categories/{id}/ameublement-filtre` | P | filtres |
| GET | `/taxo/categories-tree` | P | arbre (recommandé accueil) |
| GET | `/taxo/referentiel/marques-modeles` | P | marques |
| GET | `/taxo/filter-ui/config` | P | config UI |
| PUT | `/taxo/filter-ui/**` | U** | **ne pas exposer hors admin** |
| POST | `/taxo/annonces/generate-description` | U | DeepSeek |
| GET | `/annonces/suggestions` | P | `q`, `limit` |
| POST | `/annonces/search/all-attributes` | P | recherche EAV |
| GET | `/annonces/search_params` | P | filtres query |

### 4.3 Annonces et images

**Ne plus envoyer `X-User-Id` ni `X-Admin`.** L’identité vient exclusivement du JWT.

| Méthode | Route | Accès | Notes |
|---|---|---|---|
| POST | `/annonces` | U | multipart `dto` + `files[]` |
| POST | `/annonces/json` | U | JSON ; owner = JWT |
| PATCH | `/annonces/{id}` | U | propriétaire ou admin |
| GET | `/annonces/{id}` | P | détail |
| DELETE | `/annonces/{id}` | U | propriétaire ou admin |
| GET | `/annonces/me/manage` | U | mes cartes |
| GET | `/annonces/{id}/performance` | U | stats propriétaire |
| POST | `/annonces/{id}/pause` | U | pause |
| POST | `/annonces/{id}/reactivate` | U | reprise |
| POST | `/annonces/{id}/photos` | U | multipart |
| POST | `/annonces/{id}/photos/{photoId}/cover` | U | cover |
| POST | `/annonces/{id}/photos/reorder` | U | ordre |
| DELETE | `/annonces/{id}/photos/{photoId}` | U | delete photo |
| GET | `/annonces/public` | P | cartes |
| GET | `/annonces/public/{id}` | P | détail + vue |
| GET | `/annonces/by-categorie/{id}` | P | Pageable |
| GET | `/annonces/sous-categorie/{id}` | P | Pageable |
| GET | `/annonces/public/users/{userId}` | P | vendeur |
| POST | `/annonces/{id}/signalements` | U | signalement |
| POST | `/moderation/check` | U | pré-check |

Création JSON :

```json
{
  "titre": "Vélo de ville",
  "description": "Très bon état.",
  "type": "OFFRE",
  "prix": 25000,
  "ville": "Alger",
  "codePostal": "16000",
  "sousCategorieId": 30,
  "valeurs": [
    { "attributDefiniId": 100, "valueText": "Noir" }
  ]
}
```

Multipart React Native :

```ts
const form = new FormData();
form.append('dto', {
  string: JSON.stringify(dto),
  type: 'application/json',
  name: 'dto.json',
} as any);
images.forEach((image, index) => form.append('files', {
  uri: image.uri,
  type: image.mimeType ?? 'image/jpeg',
  name: image.fileName ?? `photo-${index}.jpg`,
} as any));

await fetch(`${API_BASE_URL}/annonces`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}` },
  body: form,
});
```

### 4.4 Favoris, recherches, notifications, réservation

| Méthode | Route | Accès |
|---|---|---|
| POST / DELETE | `/me/favoris/{annonceId}` | U |
| GET | `/me/favoris` | U |
| POST / GET | `/me/recherches` | U |
| PUT / DELETE | `/me/recherches/{id}` | U |
| GET | `/me/notifications` | U |
| GET | `/me/notifications/unread-count` | U |
| PATCH | `/me/notifications/{id}/read` | U |
| POST | `/me/notifications/read-all` | U |
| POST | `/reservations/annonces/{annonceId}` | U |
| GET | `/reservations/me` | U |
| GET | `/reservations/annonces/{annonceId}` | U propriétaire |
| PATCH | `/reservations/{reservationId}/status` | U propriétaire |
| GET | `/reservations/public/annonces/{annonceId}/calendar` | P |

### 4.5 Messagerie

| Méthode | Route | Accès |
|---|---|---|
| POST | `/messagerie/annonces/{annonceId}/conversations` | U |
| GET | `/messagerie/conversations` | U |
| GET | `/messagerie/conversations/{id}/messages` | U |
| POST | `/messagerie/conversations/{id}/messages` | U |
| POST | `/messagerie/conversations/{id}/images` | U |
| POST | `/messagerie/conversations/{id}/archive` | U |

STOMP (jalon 2) :

```text
CONNECT /ws
Authorization: Bearer <jwt>
SEND /app/chat.send
SUBSCRIBE /topic/conversations.{id}
SUBSCRIBE /user/queue/inbox
```

### 4.6 Change et admin

| Méthode | Route | Accès |
|---|---|---|
| GET | `/exchange/current` | P |
| POST | `/exchange/convert` | P |
| * | `/admin/**` | A — hors app client grand public |

## 5. DTO mobile recommandés

```ts
export type AuthSession = {
  token: string;
  refreshToken: string;
  user?: User;
};
export type User = {
  id: number; nom: string; prenom: string; email: string;
  telephone?: string; typeCompte: 'PARTICULIER' | 'PROFESSIONNEL';
  role: string; emailValide: boolean; compteActive: boolean;
};
export type Page<T> = {
  content: T[]; number: number; size: number;
  totalElements: number; totalPages: number; first: boolean; last: boolean;
};
export type AdCard = {
  id: number; titre: string; prix?: number; ville?: string;
  coverUrl?: string; photosCount?: number; createdAt?: string;
};
export type ApiError = {
  status: number; error: string; message: string; path?: string;
};
```

Charger `/taxo/sous-categories/{id}/attributs` avant le formulaire EAV.

## 6. Exemple client React Native

```ts
import * as Keychain from 'react-native-keychain';

type Tokens = { token: string; refreshToken: string };

const readTokens = async (): Promise<Tokens | null> => {
  const cred = await Keychain.getGenericPassword({ service: 'bi3oo.auth' });
  return cred ? JSON.parse(cred.password) as Tokens : null;
};

const saveTokens = (t: Tokens) =>
  Keychain.setGenericPassword('session', JSON.stringify(t), { service: 'bi3oo.auth' });

let refreshPromise: Promise<Tokens | null> | null = null;

const refreshSession = async (): Promise<Tokens | null> => {
  const current = await readTokens();
  if (!current?.refreshToken) return null;
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  if (!res.ok) {
    await Keychain.resetGenericPassword({ service: 'bi3oo.auth' });
    return null;
  }
  const body = await res.json();
  const next = { token: body.token, refreshToken: body.refreshToken };
  await saveTokens(next);
  return next;
};

const api = async <T>(path: string, init: RequestInit = {}, retried = false): Promise<T> => {
  const tokens = await readTokens();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (tokens?.token) headers.set('Authorization', `Bearer ${tokens.token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (response.status === 401 && !retried) {
    refreshPromise ??= refreshSession().finally(() => { refreshPromise = null; });
    const next = await refreshPromise;
    if (next) return api<T>(path, init, true);
    throw new Error('SESSION_EXPIRED');
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw data as ApiError;
  return data as T;
};

export const listAds = (page = 0) =>
  api<Page<AdCard>>(`/annonces/public?page=${page}&size=24&sort=id,desc`);
```

## 7. Checklist de préparation mobile

| Statut | Élément | Décision |
|---|---|---|
| ✅ | Catalogue, recherche, détail, taxonomie DTO, profils | intégrables |
| ✅ | JWT Bearer + refresh rotatif + logout | intégrables |
| ✅ | OAuth code → `/auth/oauth/exchange` | intégrable (deep link) |
| ✅ | Publication sans `X-User-Id` | intégrable |
| ✅ | Favoris, follow, réservation, messagerie REST | intégrables |
| ✅ | Images multipart `/uploads` | après tests appareil |
| ✅ | 401/403 JSON | client unique |
| ⚠ | WebSocket STOMP | tester reconnect |
| ⚠ | Blacklist JWT mémoire | multi-instance : à durcir |
| ❌ | Paiement, panier, avis, push FCM/APNs | absents |

## 8. Ordre d’intégration

1. Infra : env, TLS, Keychain, erreurs, images, **interceptor refresh**.
2. Auth : login, register/OTP, reset, OAuth exchange, logout.
3. Découverte : tree, catalogue, recherche, fiche, vendeur.
4. Engagement : favoris, follow, signalements, notifications.
5. Publication : EAV, modération, upload, manage/pause.
6. Messagerie + réservation REST ; STOMP ensuite.
7. Plus tard : push natif, paiement si produit.

### Offline / cache

- Cache court : catégories, sous-catégories, référentiels, fiches publiques (TTL 5–30 min).
- Brouillon formulaire local (JSON + URI) sans binaires lourds.
- Pas de retry auto sur publication refusée par modération.

## 9. Actions backend restantes (hors P0 déjà livrés)

| Priorité | Action | Impact |
|---|---|---|
| P1 | Blacklist / révocation access partagée (Redis ou table) | logout multi-pods |
| P1 | Restreindre `PUT /taxo/filter-ui/**` à `ADMIN` | config globale |
| P1 | `ddl-auto=validate` + Swagger/`show-sql` off en prod | exploitation |
| P2 | Annotations OpenAPI enrichies sur DTO | SDK plus propre |
| P2 | Push FCM/APNs | engagement mobile |
| P2 | Mesures p95 / traces SQL | perf continue |
