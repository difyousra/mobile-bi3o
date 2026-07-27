# Audit design Figma ↔ frontend mobile Bi3oo

**Date :** 26 juillet 2026  
**Figma :** [Bi3oo](https://www.figma.com/design/5i65G54WNWJyo51M0c9mXy/Bi3oo?node-id=0-1) (`5i65G54WNWJyo51M0c9mXy`)  
**Code :** `/var/www/mobile-bi3o`  
**Source d’inventaire écrans Figma :** `src/constants/figma.js` (40 frames mappés) — le fichier Figma distant n’a pas pu être lu sans token (timeout / auth).

## Synthèse

| Indicateur | Valeur |
|---|---:|
| Frames Figma recensés | 40 |
| UI navigable (écran ou état) | ~36 (90 %) |
| Manquants / non branchés UI | ~4 |
| Écrans app hors mapping Figma | 7+ |
| Alignement fidélité visuelle | partiel (beaucoup de mocks / Alert au lieu de frames) |

**Verdict :** la plupart des pages Figma ont un équivalent navigable. Les **trous UI** sont surtout la variante **Home Clothes**, l’écran Figma **« Annonce publiée » (step 9)** (remplacé par `Alert`), et des **états** détail/checkout. Plusieurs écrans Figma « Buy / Wallet / Reviews » existent en UI mais **sans backend** (volontairement mock).

---

## 1. Matrice Figma → code

### Welcome !

| Frame Figma | Node | Frontend | Statut |
|---|---|---|---|
| On boarding 1 | `13:25377` | `OnboardingScreen` | **OK** |
| Sign in | `20:13868` | `SignInScreen` | **OK** |
| Sign Up | `7:24776` | `SignUpScreen` | **OK** |

### Home varieties

| Frame Figma | Node | Frontend | Statut |
|---|---|---|---|
| Skelton Loading | `4:16089` | `HomeSkeletonContent` | **OK** |
| home (clothes) | `20:14633` | `ClothesProductCard` **jamais importé** | **NON DÉVELOPPÉ** (composant orphelin) |
| Home | `29:14034` | `HomeScreen` / `HomeContent` | **OK** (API catalogue) |
| home sections | `29:22330` | sections dans `HomeContent` | **OK partiel** |
| Search Filters | `103:8060` | `SearchFiltersScreen` | **OK** |
| Home & Search Results | `103:7911` | `SearchScreen` | **OK** |
| search result not found | `34:14265` | `SearchEmptyState` | **OK** |
| Map search view | `103:7742` | `MapSearchScreen` | **PARTIEL** (mock listings, pas d’API carte) |

### Favorites / Chat

| Frame Figma | Node | Frontend | Statut |
|---|---|---|---|
| Favorites | `52:15694` | `FavoritesScreen` | **OK** |
| Chat | `52:15695` | `ChatScreen` (+ `MessagesListScreen`) | **OK** |
| — | — | `MessagesScreen.js` | **STUB** (placeholder, non utilisé) |

### Product detail

| Frame Figma | Node | Frontend | Statut |
|---|---|---|---|
| Product detail | `2:8988` | `ProductDetailScreen` | **OK** |
| Product detail (gallery) | `37:14811` | `ProductImageGallery` | **PARTIEL** (pas d’écran dédié plein écran Figma) |
| product details after siping | `37:14961` | états swipe / expand | **PARTIEL** |
| Review & Ratings | `37:15427` | `ProductReviewsScreen` | **UI OK / API absente** |

### Buy product

| Frame Figma | Node | Frontend | Statut |
|---|---|---|---|
| checkout | `47:12381` | `CheckoutScreen` | **UI OK / API absente** |
| checkout (filled) | `47:12624` | même écran états | **PARTIEL** |
| checkout remove product | `47:11939` | `RemoveProductModal` | **OK** |
| Adress | `47:12888` | `AddressScreen` | **UI OK / API absente** |
| Add Adress | `47:13440` | `AddAddressScreen` | **UI OK / API absente** |
| Payement method | `47:13599` | `PaymentMethodScreen` | **UI OK / API absente** |
| finish payment | `52:13940` | `FinishPaymentScreen` | **UI OK / API absente** |
| finish payment (compact) | `52:14212` | — | **NON DÉVELOPPÉ** (variante) |
| — | — | `CartScreen` (tab) | **Extra** hors frames Buy listés |

### Sell product

| Frame Figma | Node | Frontend | Statut |
|---|---|---|---|
| Add product step 1–8 | `1:26140` … `103:7087` | `PublishScreen` + steps | **OK** |
| Add product step 9 « Annonce publiée » | `103:7228` | UI `type: success` existe mais **jamais affichée** (flow 8 → Boost → `Alert`) | **NON BRANCHÉ** |
| Boost product | `103:7621` | `PublishBoostScreen` | **OK** (boost UI seule, pas d’API) |

### Profile

| Frame Figma | Node | Frontend | Statut |
|---|---|---|---|
| profile | `4:19538` | `AccountScreen` | **OK** |
| My wallet | `52:14680` | `MyWalletScreen` | **UI OK / API absente** |
| My wallet (Top Up) | `52:14823` | `TopUpModal` | **UI OK / mock** |
| Account & Settings | `52:15002` | `AccountSettingsScreen` | **OK** |
| Manage My Listings | `103:7473` | `MyListingsScreen` | **OK** (API manage) |

---

## 2. Pages **non encore développées** (priorité UI Figma)

1. **Home Clothes** (`20:14633`) — layout mode « vêtements » ; composant `ClothesProductCard` présent mais **non branché**.
2. **Finish payment (compact)** (`52:14212`) — variante visuelle absente.
3. **Publish step 9 — Annonce publiée** (`103:7228`) — écran Figma non montré ; remplacé par `Alert.alert`.
4. **Product detail gallery / after swipe** — pas d’écrans/états Figma complets, seulement galerie partielle.
5. **MessagesScreen** stub — à supprimer ou remplacer (le vrai flux est `MessagesNavigator`).

---

## 3. Écrans app **hors** inventaire Figma `figma.js`

Développés côté RN mais absents du mapping Figma actuel (à vérifier dans le fichier Figma s’ils existent sous d’autres noms) :

| Écran | Fichier |
|---|---|
| Forgot password | `ForgotPasswordScreen` |
| Verify email / OTP | `VerifyEmailScreen` |
| Reset password (deep link) | **absent** (seul forgot) |
| Notifications | `NotificationsScreen` |
| Mes réservations | `MyReservationsScreen` |
| Change password | `ChangePasswordScreen` |
| Profil vendeur | `SellerProfileScreen` |
| Liste conversations | `MessagesListScreen` |
| Panier (tab) | `CartScreen` |

---

## 4. Écart design vs produit backend

Ces frames Figma sont **implémentés en UI** mais **ne doivent pas être considérés « terminés produit »** tant que le backend n’existe pas :

- Panier / Checkout / Adresse / Paiement / Finish payment  
- Review & Ratings  
- Wallet Top Up / Transfer  
- Boost payant  

---

## 5. Recommandations d’ordre

1. Brancher **Home Clothes** (ou retirer le frame / le composant orphelin).  
2. Remplacer l’`Alert` post-publish par l’écran Figma **step 9**, puis Boost.  
3. Finaliser états **galerie produit** + variante **finish payment compact**.  
4. Aligner la tab bar Figma (Messages vs Panier) — aujourd’hui tab **Cart**, Messages via icônes header.  
5. Compléter `figma.js` avec OTP / Forgot / Notifications / Réservations si ces frames existent dans Figma.  
6. Pour revue visuelle pixel : fournir un **token Figma** ou exports PNG des frames manquants.

---

*Rapport généré par comparaison code ↔ `src/constants/figma.js` + navigation Expo.*
