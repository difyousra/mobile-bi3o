# Phase 4 — Publication (dépôt / modération / manage)

**Date :** 23 juillet 2026  
**Contrats :** `mobile_api.md` §4.3 · Postman « Publication d'annonce »  
**Auth :** JWT — **pas de `X-User-Id`**

## Flux publication

1. Formulaire UI (9 étapes + boost UI)  
2. `POST /moderation/check` `{ titre, description }`  
3. Si `allowed === false` / HTTP 422 → stop + message `reason`  
4. Photos locales → `POST /annonces` multipart (`dto` + `files`)  
   Sinon → `POST /annonces/json`  
5. Succès → `id` → navigation détail optionnelle  

## Routes branchées

| Méthode | Route | Usage |
|---------|-------|-------|
| POST | `/moderation/check` | Pré-check |
| POST | `/annonces/json` | Création sans fichier local |
| POST | `/annonces` | Multipart (expo-image-picker) |
| GET | `/annonces/me/manage` | Mes annonces |
| POST | `/annonces/{id}/pause` | Pause |
| POST | `/annonces/{id}/reactivate` | Réactivation |
| DELETE | `/annonces/{id}` | Suppression |
| GET | `/taxo/sous-categories` | Picker `sousCategorieId` |
| POST | `/annonces/{id}/photos` | Service prêt (post-création) |

## Fichiers

- `src/types/publish.ts`
- `src/services/publishService.ts`
- `src/models/publishMapper.ts`
- `src/hooks/usePublish.ts`
- `CategoryPicker.js` (sous-catégories API)
- `PublishPhotoGrid.js` (expo-image-picker)
- `PublishScreen.js` (submit réel)
- `MyListingsScreen.js` (manage API)

## Limites

| Sujet | Statut |
|-------|--------|
| Boost payant | UI seule — **pas d’API boost** documentée |
| Attributs EAV `valeurs[]` | Envoyés vides pour l’instant (attributs chargés possibles via taxo) |
| `PATCH /annonces/{id}` édition | Non branché UI (Phase 4b) |
| Paiement sécurisé switch | UI décorative (pas d’API paiement) |
| Écran « success » Figma (step 9) | Remplacé par Alert post-API (évite faux « publiée ») |

## Checklist Postman

- [ ] Pré-vérification modération  
- [ ] Créer annonce JSON  
- [ ] Mes annonces  
- [ ] Suspendre / Réactiver  

## Test app

1. Publier → choisir sous-catégorie API → photos galerie → prix → ville → booster/sans boost  
2. Vérifier ID créé + apparition dans Mes annonces  
3. Pause / Réactiver / Supprimer  
