# Rapport d'intégration backend — Bi3oo Mobile

**Date :** 23 juillet 2026  
**Projet :** `bi3oo_mobile` (React Native / Expo 54)  
**API prod (défaut) :** `https://bi3oo.com/api`  
**API preprod :** `https://api-private.bi3oo.com/api`

---

## 1. Synthèse exécutive — audit final frontend (23/07/2026)

| Domaine | UI Figma | Données | API branchée | Persistance locale |
|---------|----------|---------|--------------|-------------------|
| Auth (login/register/OTP) | ✅ ~95 % | ✅ | ✅ **Phase 1** | JWT SecureStore |
| Favoris | ✅ ~85 % | Mock | ❌ | ✅ AsyncStorage |
| Chat / Messages | ✅ ~80 % | Mock | ❌ | ✅ AsyncStorage |
| Home / Recherche | ✅ ~90 % | Mock | ❌ | Favoris partagés |
| Achat (checkout) | ✅ ~85 % | Mock | ❌ | Contexte session |
| Profil / Wallet | ✅ ~86 % | Mock | ❌ partiel GET me | — |
| Publication annonce | ✅ ~82 % | Mock | ❌ | — |

**Verdict global UI :** ~**84 %** des écrans Figma mappés (~40) sont implémentés et navigables.  
**Verdict API :** ~**12 %** (auth seule).  
**Décision :** **feu orange** — frontend **prêt pour intégration backend par phases** (pas big-bang). MapSearch partiel ; OAuth Google / notifications / profil vendeur absents ou stubs.

---

## 2. Authentification (implémenté)

### Configuration

| Fichier | Rôle |
|---------|------|
| `src/config/api.js` | `API_BASE_URL` (preprod par défaut, surcharge `EXPO_PUBLIC_API_URL`) |
| `src/services/api.js` | Client Axios + interceptor `Authorization: Bearer` |
| `src/services/tokenStorage.js` | JWT dans `expo-secure-store` (clé `authToken`) |
| `src/services/authService.js` | Appels REST auth |
| `src/context/AuthContext.js` | État session, bootstrap, login/register/OTP |

### Endpoints branchés

| Méthode | Chemin | Écran / usage |
|---------|--------|---------------|
| POST | `/auth/login` | `SignInForm` |
| POST | `/auth/register` | `SignUpForm` |
| POST | `/auth/verify-email` | `VerifyEmailScreen` |
| POST | `/auth/resend-otp` | `VerifyEmailScreen` |
| POST | `/auth/password/forgot` | `ForgotPasswordScreen` |
| GET | `/users/me` | Bootstrap session + post-login |

### Flux

```
Onboarding → Sign In ──POST /auth/login──► JWT → App principale
                │
                └── Sign Up ──POST /auth/register──► VerifyEmail ──POST /auth/verify-email──► Sign In

Mot de passe oublié ──POST /auth/password/forgot──► retour Sign In
```

### Points d'attention API

- Le login renvoie souvent **HTTP 200** avec `statusCode` dans le corps (401/403 gérés côté client).
- `refreshToken` retourné mais **aucune route `/auth/refresh`** — non utilisé.
- OAuth Google : redirection web (`/oauth2/authorization/google`) — **non intégré mobile** (stub + message dev).
- Inscription : `typeCompte: PARTICULIER`, `role: USER` ; champ `birthDate` UI **absent de l'API**.
- Téléphone normalisé vers `+213...` via `src/utils/phone.js`.

### Mapping formulaires → API register

| UI (SignUpForm) | API |
|-----------------|-----|
| `firstName` | `prenom` |
| `lastName` | `nom` |
| `email` | `email` |
| `password` | `password` |
| `phone` | `telephone` (optionnel, format `+?\d{10,15}`) |

---

## 3. Favoris (vérifié + persistance locale)

### État

- **UI :** alignée Figma `52:15694` (~85 %).
- **Données :** `mockFavoritesData.js` (produits + vendeurs sauvegardés).
- **Avant :** `useState` local, perdu au rechargement, non partagé entre écrans.
- **Après :** `FavoritesContext` + `AsyncStorage`
  - Clé produits : `@bi3oo/favorite_products`
  - Clé vendeurs : `@bi3oo/saved_sellers`

### Fichiers impactés

- `src/context/FavoritesContext.js` (nouveau)
- `src/components/favorites/FavoritesContent.js`
- `src/components/home/HomeContent.js`
- `src/components/search/SearchContent.js`
- `src/screens/product/ProductDetailScreen.js`

### API future (non documentée dans auth)

- Endpoints favoris / vendeurs suivis à définir côté backend.
- En attendant : sync locale uniquement.

---

## 4. Chat / Messages (vérifié + correctifs)

### Bug corrigé

`MessagesListScreen` n'affichait la liste que si la recherche était **non vide** :

```js
// Avant (incorrect)
showList = searchQuery.trim().length > 0 && conversations.length > 0

// Après (conforme Figma « chats not empty »)
showList = conversations.length > 0
```

### Persistance locale

- `MessagesContext` + `AsyncStorage` clé `@bi3oo/chat_messages`
- Messages envoyés dans `ChatContent` sauvegardés par `conversationId`
- Conversations de base : `mockMessagesData.js` (3 threads)

### Limites actuelles

| Fonctionnalité | Statut |
|----------------|--------|
| Liste conversations | Mock + filtre recherche |
| Envoi message texte | Local + persistance |
| Read receipt simulé | Timeout 800 ms |
| WebSocket / API temps réel | ❌ |
| Pièces jointes | Stub `showDevMessage` |
| `MessagesScreen.js` (racine) | Fichier mort, non routé |

---

## 5. Autres écrans — APIs attendues (Phase 2+)

| Écran | Endpoints probables | Priorité |
|-------|---------------------|----------|
| Home / Catalogue | `GET /products`, catégories, promos | P1 |
| Recherche / Filtres | `GET /products/search` + filtres | P1 |
| Détail produit | `GET /products/{id}`, avis | P1 |
| Panier / Checkout | commandes, adresses, paiement | P2 |
| Profil | `GET/PATCH /users/me`, avatar | P1 (partiel : GET me fait) |
| Wallet | transactions, top-up | P3 |
| Publication | `POST /listings` multipart | P2 |
| Notifications | push + `GET /notifications` | P3 |

---

## 6. Structure technique

```
src/
├── config/api.js              ← URL API
├── context/
│   ├── AuthContext.js         ← NEW
│   ├── FavoritesContext.js    ← NEW
│   ├── MessagesContext.js     ← NEW
│   ├── CartContext.js
│   ├── CheckoutContext.js
│   └── WalletContext.js
├── services/
│   ├── api.js                 ← Axios + Bearer
│   ├── authService.js         ← NEW
│   └── tokenStorage.js        ← NEW
├── screens/auth/
│   ├── SignInScreen.js
│   ├── SignUpScreen.js
│   ├── VerifyEmailScreen.js   ← NEW
│   └── ForgotPasswordScreen.js← NEW
└── utils/phone.js             ← NEW
```

---

## 7. Variables d'environnement

```bash
# .env ou app.config — optionnel
EXPO_PUBLIC_API_URL=https://api-private.bi3oo.com/api
```

---

## 8. Plan de test manuel — Auth

1. **Inscription** : prénom, nom, e-mail, mot de passe → écran OTP.
2. **Vérification** : code reçu par e-mail → message succès → retour connexion.
3. **Connexion** : e-mail + mot de passe valides → accès app principale.
4. **Erreurs** : mauvais mot de passe → message « E-mail ou mot de passe incorrect ».
5. **Compte pro en attente** : `statusCode 403` / `ACCOUNT_DISABLED_PENDING_PRO`.
6. **Mot de passe oublié** : e-mail → message anti-énumération.
7. **Relance app** : JWT valide → session restaurée via `GET /users/me`.

---

## 9. Plan de test — Favoris & Chat

### Favoris

1. Ajouter un favori depuis Home → visible dans onglet Favoris.
2. Retirer un favori → disparaît de la liste.
3. Fermer / rouvrir l'app → favoris conservés.

### Chat

1. Onglet Messages → liste des 3 conversations **sans taper de recherche**.
2. Recherche « Via » → filtre la liste.
3. Ouvrir une conversation → envoyer un message → fermer → rouvrir → message toujours présent.

---

## 10. Dépendances ajoutées

- `expo-secure-store` — stockage JWT
- `@react-native-async-storage/async-storage` — favoris + messages

---

## 11. Prochaines étapes recommandées

1. Intégrer catalogue produits (remplacer mocks Home/Recherche).
2. OAuth Google mobile (`expo-auth-session` + WebView).
3. API favoris serveur (sync bidirectionnelle).
4. API messagerie + WebSocket.
5. Écran reset password deep link (`reset-password?token=`).
6. Déconnexion depuis Paramètres compte (`logout()`).

---

*Rapport généré et sauvegardé localement — juin 2026.*
