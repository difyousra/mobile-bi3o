# Phase 2 (roadmap) — Profil + compléments 4 / 5 / 8

**Date :** 23 juillet 2026  
**Contrats :** `mobile_api.md` §2–4 · Mapping §2.1 / §2.3 / §2.6  
**Auth :** JWT Bearer

## Profil (votre Phase 2)

| Méthode | Route | UI |
|---------|-------|-----|
| GET | `/users/me` | Account header (AuthContext + refresh) |
| POST | `/users/me/avatar` | Tap avatar → galerie (`file` multipart) |
| PATCH | `/users/me/password` | `ChangePasswordScreen` (`currentPassword?`, `newPassword`) |
| GET | `/profiles/users/me` | Hook `useProfileMe` prêt |
| POST | `/auth/logout` | Logout Account |

Fichiers : `profileService.ts`, `useProfile.ts`, `AccountContent.js`, `ChangePasswordScreen.js`

## Suggestions (votre Phase 4)

| Méthode | Route | UI |
|---------|-------|-----|
| GET | `/annonces/suggestions?q&limit` | Chips sous SearchBar |

Normalisation défensive (`titre` / `suggestion` / string).

## Fiche vendeur (votre Phase 5)

| Méthode | Route | UI |
|---------|-------|-----|
| GET | `/users/public/{id}` | `SellerProfileScreen` |
| POST/DELETE | `/users/{id}/follow` | Bouton Suivre |

Entrée : fiche produit → nom vendeur.

## Réservations (votre Phase 8)

| Méthode | Route | UI |
|---------|-------|-----|
| GET | `/reservations/public/annonces/{id}/calendar` | Bloc détail annonce |
| GET | `/reservations/me` | `MyReservationsScreen` |
| POST | `/reservations/annonces/{id}` | Formulaire `dateDebut` / `dateFin` (*) |
| PATCH | `/reservations/{id}/status` | Chips statut (owner) |

(*) Corps **non détaillé Postman** — hypothèse minimale ; ajuster si QA 400.

## Limites

- Édition complète `PATCH /profiles/account|particulier|pro` : service partiel, pas d’écran formulaire riche  
- Wallet / promotions : toujours mock (pas d’API)  
- Shape exacte suggestions / calendrier / vendeur : parsing défensif  

## Test

1. Account → avatar + Change Password + Logout  
2. Search → 2+ caractères → chips suggestions  
3. Détail → tap vendeur → profil public  
4. Détail → calendrier + Mes réservations → créer  
