# Phase 3 — Engagement (favoris / follow / notifications)

**Date :** 23 juillet 2026  
**Contrats :** `mobile_api.md` §4.1 follow · §4.4 · Postman « Engagement… »  
**Auth :** JWT Bearer obligatoire

## Routes branchées

| Méthode | Route | Usage |
|---------|-------|-------|
| GET | `/me/favoris` | Onglet Favoris · cœur Home/Search/Detail |
| POST | `/me/favoris/{annonceId}` | Ajout favori (optimistic) |
| DELETE | `/me/favoris/{annonceId}` | Retrait favori |
| POST | `/users/{sellerId}/follow` | Bouton Suivre (fiche annonce) |
| DELETE | `/users/{sellerId}/follow` | Ne plus suivre |
| GET | `/users/{sellerId}/follow/status` | État bouton |
| GET | `/me/notifications` | Écran Notifications |
| GET | `/me/notifications/unread-count` | Badge cloche |
| PATCH | `/me/notifications/{id}/read` | Marquer lue |
| POST | `/me/notifications/read-all` | Tout lire |
| GET | `/me/recherches` | Favoris → Mes recherches |
| POST | `/me/recherches` | Save Search (`{ query, label? }`) |
| DELETE | `/me/recherches/{id}` | Supprimer alerte |

## Fichiers

- `src/types/engagement.ts`
- `src/services/engagementService.ts`
- `src/hooks/useEngagement.ts`
- `src/context/FavoritesContext.js` (API, plus AsyncStorage JWT-favoris)
- `src/screens/notifications/NotificationsScreen.js`
- Route stack `Notifications`

## Limites documentées (pas d’invention)

| Sujet | Statut |
|-------|--------|
| Liste globale des vendeurs suivis | **Absente** de l’API → onglet Vendeurs = message explicatif |
| Corps exact `POST /me/recherches` | Minimal `{ query, label? }` — si 400, message API |
| `POST /annonces/{id}/signalements` | Corps non documenté → **non branché** |
| Push FCM/APNs | Hors scope (audit Phase 6) |

## Checklist Postman

- [ ] Ajouter favori  
- [ ] Mes favoris  
- [ ] Suivre vendeur  
- [ ] Notifications  

## Test app

1. Connecté → cœur sur une annonce → apparaît dans Favoris  
2. Fiche annonce avec `sellerId` → Suivre / Suivi  
3. Cloche → Notifications → lire / tout lire  
4. Search → Save Search → Favoris → Mes recherches  
