# Mapping Écran ↔ API — Bi3oo Mobile (Phase 0)

**Date :** 23 juillet 2026  
**Sources de vérité (ordre) :** `MOBILE_BACKEND_AUDIT.md` · `mobile_api.md` · `bi3oo-mobile.postman_collection.json` · `preprod.postman_environment.json` · OpenAPI `GET /v3/api-docs`  
**Règle :** backend gelé — aucune URL / DTO inventée.

---

## 0. STOP — incohérences & bloquants

| # | Constat | Impact | Décision |
|---|---------|--------|----------|
| S1 | `GET https://new.bi3oo.com/api/v3/api-docs` → **HTTP 302** Nginx (cookie/auth edge ?) | Impossible de valider les **111 paths** live avant chaque intégration | **STOP partiel** — intégrer uniquement les routes présentes dans `mobile_api.md` **et** Postman ; OpenAPI à importer dès accès |
| S2 | `.env` mobile actuel : `https://bi3oo.com/api` | ≠ Postman / guide : **`https://new.bi3oo.com/api`** | Corriger `EXPO_PUBLIC_API_URL` vers préprod documentée |
| S3 | Auth mobile actuelle : pas de `POST /auth/refresh`, pas de `POST /auth/logout`, OAuth bypass | Contrat audit 23/07 **obsolète** côté app | Réécrire module Auth (Phase 1) |
| S4 | Tokens : SecureStore OK Expo ; AsyncStorage utilisé pour tokens web | Spec : **Keychain uniquement** pour tokens | TokenManager Keychain/`expo-secure-store` ; **jamais** AsyncStorage pour JWT |
| S5 | UI **Panier / Checkout / Paiement / Avis / Wallet top-up** | Backend : **absents** (audit § modules + mobile_api §7 ❌) | **Ne pas brancher** — garder mock UI ou masquer jusqu’à produit |
| S6 | Stack actuelle : JS + Axios partiel | Spec cible : TS + TanStack Query + Zod + RHF + Keychain | Introduire couches `api/` `types/` `hooks/` progressivement |

---

## 1. Environnement (Postman)

| Variable | Valeur source de vérité |
|----------|-------------------------|
| `apiBaseUrl` | `https://new.bi3oo.com/api` |
| `WS_URL` (guide) | `wss://new.bi3oo.com/ws` (STOMP jalon 2 — **désactivé**) |
| Headers | `Authorization: Bearer <token>` · `Accept: application/json` |

---

## 2. Matrice globale Écran → API → DTO → Cache → Erreurs

### Légende statut

- **READY** — contrat documenté + Postman + UI présente  
- **PARTIAL** — UI ok, API partielle / gaps  
- **BLOCKED** — pas d’API backend (ne pas inventer)  
- **DEFER** — API existe, hors phase courante  

### 2.1 Authentification & profil (Phase 1–2) — PRIORITÉ

| Écran RN | Navigation | Méthode + Route | Auth | Request / Response (contrat) | Query key / cache | Erreurs |
|----------|------------|-----------------|------|------------------------------|-------------------|---------|
| SignInScreen | App flow | `POST /auth/login` | P | `{email,password}` → `ReqRes` (`token`,`refreshToken`,`statusCode`,…) | session invalidation | body `statusCode` 401/403 **ou** HTTP ; puis refresh |
| SignUpScreen | App flow | `POST /auth/register` | P | `RegisterRequest` → UserResponse | — | 400 email/SIRET/validation |
| VerifyEmailScreen | App flow | `POST /auth/verify-email` | P | `{email,code}` | — | 400 OTP |
| VerifyEmailScreen | — | `POST /auth/resend-otp` | P | `{email}` | — | 400 |
| ForgotPasswordScreen | App flow | `POST /auth/password/forgot` | P | `{email}` message neutre | — | 200 toujours |
| *(Reset deep link)* | linking | `POST /auth/password/reset` | P | `{token,newPassword}` | — | 400 token |
| OAuth Google | Browser / Custom Tab | `GET {ORIGIN}/oauth2/authorization/google` puis `POST /auth/oauth/exchange` | P | `{code}` → session | — | redirect `?code=` |
| *(interceptor)* | — | `POST /auth/refresh` | P | `{refreshToken}` → nouveaux tokens (rotation) | — | 403 reuse |
| AccountSettings logout | AccountSettings | `POST /auth/logout` | Bearer + body refresh | `{refreshToken?}` | clear Keychain | 401 |
| Account / bootstrap | App | `GET /users/me` | U | UserResponse | `['users','me']` | 401 → refresh |
| AccountSettings MDP | AccountSettings | `PATCH /users/me/password` | U | `{currentPassword?,newPassword}` | invalidate me | 400 |
| Account avatar | AccountSettings | `POST /users/me/avatar` | U | multipart `file` | invalidate me | 413 |
| AccountContent profil | Account | `GET /profiles/users/me` | U | profil étendu | `['profiles','me']` | 401 |
| Account edit | — | `PATCH /profiles/account/{userId}` | U | account DTO | invalidate | 403 ownership |
| — | — | `PATCH /profiles/particulier/{userId}` | U | | | |
| — | — | `PATCH /profiles/pro/{userId}` | U | | | |

**Types TS (guide §5) :** `AuthSession`, `User`, `ApiError`.

### 2.2 Catalogue / recherche / détail (Phase 3–5)

| Écran RN | Route | Notes |
|----------|-------|-------|
| HomeContent (chips) | `GET /taxo/categories-tree` | recommandé accueil · cache TTL 5–30 min · key `['taxo','tree']` |
| Home / Publish | `GET /taxo/categories` | DTO catégories |
| Publish / filters | `GET /taxo/sous-categories` | **DTO plat** `{id,nom,categorieId}` |
| Publish EAV | `GET /taxo/sous-categories/{id}/attributs` | avant formulaire |
| Publish | `GET /taxo/sous-categories/{id}/info` | métadonnées |
| SearchFilters | `GET /taxo/sous-categories/{id}/ameublement-filtre` | filtres |
| SearchFilters | `GET /taxo/filter-ui/config` | P · **ne pas exposer PUT** (admin) |
| Publish | `GET /taxo/referentiel/marques-modeles` | marques |
| HomeContent feed | `GET /annonces/public?page&size&sort` | Pageable · size 24 · key `['annonces','public',page]` |
| SearchContent | `POST /annonces/search/all-attributes` | EAV + page |
| SearchContent | `GET /annonces/search_params` | filtres query |
| Search suggestions | `GET /annonces/suggestions?q&limit` | |
| ProductDetailScreen | `GET /annonces/public/{id}` | détail + vue |
| ProductDetailScreen | `GET /annonces/{id}` | alternatif P |
| Home by cat | `GET /annonces/by-categorie/{id}` | Pageable |
| Home by sous-cat | `GET /annonces/sous-categorie/{id}` | Pageable |
| Seller profile *(à créer)* | `GET /users/public/{id}` | vendeur |
| Seller ads | `GET /annonces/public/users/{userId}` | |
| Home prix EUR/DZD | `GET /exchange/current` | P · `POST /exchange/convert` |
| ProductReviewsScreen | — | **BLOCKED** — avis absents backend |
| MapSearchScreen | — | **PARTIAL** — pas d’endpoint carte dédié documenté |

### 2.3 Favoris / follow / signalements / notifications (Phase 6)

| Écran | Route |
|-------|-------|
| FavoritesContent | `GET /me/favoris` · `POST|DELETE /me/favoris/{annonceId}` |
| Saved sellers | `POST|DELETE /users/{sellerId}/follow` · `GET .../follow/status` |
| ProductDetail signaler | `POST /annonces/{id}/signalements` |
| Notifications *(écran à ajouter)* | `GET /me/notifications` · unread-count · read · read-all |
| Saved searches | `POST|GET /me/recherches` · `PUT|DELETE /me/recherches/{id}` |

Optimistic updates TanStack sur favoris/follow.

### 2.4 Publication / mes annonces (Phase 7)

| Écran | Route |
|-------|-------|
| PublishScreen steps | `POST /annonces/json` ou multipart `POST /annonces` (`dto` + `files[]`) |
| Pré-modération | `POST /moderation/check` → `{allowed,score,reason}` · **422** refus |
| DeepSeek desc | `POST /taxo/annonces/generate-description` | U |
| MyListingsScreen | `GET /annonces/me/manage` |
| Pause / reactivate | `POST /annonces/{id}/pause` · `/reactivate` |
| Edit | `PATCH /annonces/{id}` |
| Delete | `DELETE /annonces/{id}` |
| Photos | `POST .../photos` · cover · reorder · DELETE photo |
| Perf | `GET /annonces/{id}/performance` |

**Ne plus envoyer `X-User-Id` / `X-Admin`.**

### 2.5 Messagerie REST (Phase 10 — STOMP off)

| Écran | Route |
|-------|-------|
| MessagesListScreen | `GET /messagerie/conversations` |
| ChatScreen open | `POST /messagerie/annonces/{annonceId}/conversations` |
| ChatContent | `GET|POST /messagerie/conversations/{id}/messages` |
| Attach | `POST .../images` |
| Archive | `POST .../archive` |

Architecture STOMP préparée (`WS_URL`) **sans activation**.

### 2.6 Réservations (Phase 9)

| Écran *(à créer / brancher)* | Route |
|------------------------------|-------|
| Calendrier détail | `GET /reservations/public/annonces/{id}/calendar` |
| Créer | `POST /reservations/annonces/{annonceId}` |
| Mes réservations | `GET /reservations/me` |
| Owner list | `GET /reservations/annonces/{annonceId}` |
| Statut | `PATCH /reservations/{id}/status` |

### 2.7 Écrans UI **sans API** (BLOCKED — ne pas inventer)

| Écran UI | Raison (audit / mobile_api) |
|----------|------------------------------|
| CheckoutScreen / Cart | Pas de panier / commande |
| BuyAddress / BuyPayment / BuyFinish | Pas de paiement / livraison |
| ProductReviewsScreen | Pas d’avis |
| MyWalletScreen top-up / transfer | Pas de wallet paiement |
| Google Auth bypass actuel | Remplacer par OAuth exchange |

---

## 3. Couverture Postman (32 requêtes) vs guide

Postman = **smoke tests** prioritaires, pas les 111 paths.

| Présent Postman | Dans mobile_api | Action mobile |
|-----------------|-----------------|---------------|
| Auth login/refresh/oauth/logout/register/forgot/me | ✅ | Phase 1 |
| taxo tree / sous-cat / attributs | ✅ | Phase 3 |
| annonces public / search / détail / suggestions | ✅ | Phase 3–5 |
| create json / manage / pause / reactivate | ✅ | Phase 7 |
| favoris / follow / notifications | ✅ | Phase 6 |
| messagerie start + send | ✅ | Phase 10 |
| calendar réservation | ✅ | Phase 9 |
| exchange / moderation | ✅ | Phase 3/7 |
| OpenAPI / Swagger | ✅ | Doc |

**APIs documentées non listées dans Postman (exemples) :** verify-email, resend-otp, password/reset, avatar, profiles/*, photos CRUD, recherches sauvées, réservations CRUD, archive messagerie, etc. → intégrer depuis `mobile_api.md` après confirmation OpenAPI.

**APIs inutilisées côté app grand public :** `/admin/**`, `PUT /taxo/filter-ui/**`.

---

## 4. Architecture cible (adapter le repo existant)

```text
src/
  config/          # API_BASE_URL, timeouts (déjà partiel)
  api/             # Axios client + interceptors (nouveau)
  types/           # DTO / ApiError / Page<T> (nouveau TS)
  models/          # mappers AdCard → UI product (nouveau)
  services/        # authService, annoncesService… (évoluer)
  repositories/    # optionnel thin wrappers Query
  hooks/           # useLogin, usePublicAds, queryKeys
  store/           # session minimale si besoin
  utils/           # errorHandler, mediaUrl
  navigation/      # existant
  components/      # existant (design gelé)
  screens/         # existant (brancher hooks)
```

Stack à installer (Expo 54) :

- `typescript`, `@tanstack/react-query`, `zod`, `react-hook-form`, `@hookform/resolvers`
- Tokens : `expo-secure-store` (= Keychain/Keystore Expo) — **pas** AsyncStorage pour tokens
- Images : `expo-image-picker` (équivalent Image Picker sous Expo)
- Éviter `react-native-keychain` bare sauf ejection

---

## 5. Query keys (proposées)

```ts
export const queryKeys = {
  me: ['users', 'me'] as const,
  profileMe: ['profiles', 'me'] as const,
  taxoTree: ['taxo', 'tree'] as const,
  sousCategories: ['taxo', 'sous-categories'] as const,
  attributs: (id: number) => ['taxo', 'attributs', id] as const,
  publicAds: (page: number, size: number) => ['annonces', 'public', page, size] as const,
  adPublic: (id: number) => ['annonces', 'public', id] as const,
  favorites: (page: number) => ['me', 'favoris', page] as const,
  notifications: (page: number) => ['me', 'notifications', page] as const,
  myAds: (page: number) => ['annonces', 'me', 'manage', page] as const,
  conversations: ['messagerie', 'conversations'] as const,
  messages: (id: number) => ['messagerie', 'messages', id] as const,
  exchange: ['exchange', 'current'] as const,
};
```

---

## 6. Error handler (codes documentés)

| HTTP | Action mobile |
|------|----------------|
| 400 | message validation / métier |
| 401 | refresh une fois → sinon logout |
| 403 | rôle / ownership / refresh révoqué |
| 404 | introuvable |
| 409 | conflit (si présent OpenAPI) |
| 413 | fichier trop gros |
| 422 | modération refusée (`allowed:false`) |
| 429 | throttle (prévoir) |
| 500/502/503 | retry UI / message serveur |

---

## 7. Ordre d’exécution validé

1. Infra client (base URL préprod, ApiClient, TokenManager, refresh interceptor, errors)  
2. Auth complète + Profil (`/users/me`)  
3. Catalogue + taxonomie  
4. Recherche  
5. Détail annonce + vendeur  
6. Favoris / follow / notifications  
7. Publication  
8. Réservations  
9. Messagerie REST  
10. *(jamais)* inventer panier/paiement/avis  

À chaque module : rejouer les requêtes Postman correspondantes.

---

## 8. Checklist Android / iOS (préparation)

| Item | Android | iOS |
|------|---------|-----|
| Keychain/Keystore tokens | SecureStore | SecureStore |
| Deep link OAuth `?code=` | Intent filter / App Links | Universal Links |
| Deep link reset password | idem | idem |
| Cleartext HTTP | interdit (HTTPS only) | ATS |
| Upload multipart timeout 240s | ok | ok |
| Permissions camera/gallery | publish + chat images | Info.plist |
| STOMP | **off** jusqu’à validation REST | **off** |

---

## 9. Prochaine action

**Avant tout code métier :**

1. Confirmer accès OpenAPI (cookie Nginx / VPN) **ou** accepter intégration limitée à `mobile_api.md` ∩ Postman.  
2. Aligner `EXPO_PUBLIC_API_URL=https://new.bi3oo.com/api`.  
3. Démarrer **Phase 1 Auth** uniquement.

*Document généré Phase 0 — aucune API inventée.*
