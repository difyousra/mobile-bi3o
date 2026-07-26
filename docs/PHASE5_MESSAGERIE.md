# Phase 5 — Messagerie REST (+ réservations service)

**Date :** 23 juillet 2026  
**Contrats :** `mobile_api.md` §4.5 · §4.4 réservations · Postman « Engagement, réservation et messagerie »  
**Auth :** JWT Bearer  
**STOMP :** **off** (`WS_URL` préparé, non branché) — polling REST ~12 s

## Flux messagerie

1. Fiche produit → **Contacter le vendeur**  
2. `POST /messagerie/annonces/{annonceId}/conversations`  
   Body Postman : `{ "message": "Bonjour, est-ce disponible ?" }`  
3. Navigation Chat avec `conversationId`  
4. `GET /messagerie/conversations/{id}/messages`  
5. Envoi : `POST .../messages` Body `{ "body": "..." }`  
6. Image : `POST .../images` (multipart `files`)  
7. Archive : `POST .../archive`  
8. Liste : `GET /messagerie/conversations`

## Routes branchées

| Méthode | Route | Usage |
|---------|-------|-------|
| GET | `/messagerie/conversations` | Liste Messages |
| POST | `/messagerie/annonces/{id}/conversations` | Contacter vendeur |
| GET | `/messagerie/conversations/{id}/messages` | Fil chat |
| POST | `/messagerie/conversations/{id}/messages` | Envoi texte |
| POST | `/messagerie/conversations/{id}/images` | Pièce jointe |
| POST | `/messagerie/conversations/{id}/archive` | Menu chat |
| GET | `/reservations/public/annonces/{id}/calendar` | Hook prêt |
| GET | `/reservations/me` | Hook prêt |
| POST | `/reservations/annonces/{id}` | Hook prêt (corps appelant) |
| PATCH | `/reservations/{id}/status` | Service prêt |

## Fichiers

- `src/types/messaging.ts`
- `src/services/messagerieService.ts`
- `src/services/reservationService.ts`
- `src/models/messagingMapper.ts`
- `src/hooks/useMessaging.ts`
- `src/context/MessagesContext.js` (API, plus AsyncStorage)
- `MessagesListScreen` · `ChatScreen` · `ChatContent`
- `ProductDetailScreen` — bouton Contacter

## Limites (pas d’invention)

| Sujet | Statut |
|-------|--------|
| STOMP / WebSocket | **Off** jusqu’à validation REST |
| Shape exacte ConversationDto / MessageDto | Parsing défensif (champs optionnels) |
| Corps `POST /reservations/annonces/{id}` | Non détaillé Postman → service générique, **pas d’UI calendrier** |
| Champ multipart images chat | `files` (aligné publication) — ajuster si QA 400 |

## Checklist Postman

- [ ] Démarrer conversation  
- [ ] Envoyer message  
- [ ] Liste conversations (manuelle / app)  
- [ ] Calendrier réservation (public)

## Test app

1. Ouvrir une annonce → Contacter → confirmer message  
2. Onglet / icône Messages → liste API  
3. Envoyer un message → recharger (polling)  
4. Joindre une image · Archiver via menu  
