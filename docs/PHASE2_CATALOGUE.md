# Phase 2 — Découverte (catalogue / recherche / détail)

**Date :** 23 juillet 2026  
**Contrats :** `mobile_api.md` §4.2–4.3 · Postman « Découverte et taxonomie »  
**Base :** `https://new.bi3oo.com/api`

## Routes branchées

| Méthode | Route | Usage mobile |
|---------|-------|--------------|
| GET | `/taxo/categories-tree` | chips Accueil |
| GET | `/taxo/sous-categories` | service prêt (Publish) |
| GET | `/taxo/sous-categories/{id}/attributs` | service prêt |
| GET | `/annonces/public` | feed Accueil |
| GET | `/annonces/by-categorie/{id}` | filtre chip catégorie |
| GET | `/annonces/public/{id}?maxPhotos=10` | ProductDetail |
| POST | `/annonces/search/all-attributes` | Search (titre) |
| GET | `/annonces/suggestions` | hook prêt |
| GET | `/users/public/{id}` | service prêt (écran vendeur Phase 2b) |
| GET | `/exchange/current` | conversion EUR approx. |

## Fichiers

- `src/types/catalog.ts`
- `src/services/taxoService.ts` · `annoncesService.ts` · `exchangeService.ts`
- `src/models/adMapper.ts` · `src/utils/mediaUrl.ts`
- `src/hooks/useCatalog.ts`
- `HomeContent.js` · `SearchContent.js` · `ProductDetailScreen.js`

## Hors scope (volontaire)

- Avis / reviews → **pas d’API** (UI mock enrichProduct conservée)
- Panier / paiement → absents backend
- MapSearch → pas d’endpoint carte
- Favoris serveur → Phase 3
- Pagination infinite scroll → page 0 size 24 (à étendre)

## Checklist Postman Découverte

- [ ] Arbre de catégories  
- [ ] Liste sous-catégories (DTO)  
- [ ] Annonces publiques  
- [ ] Recherche multi-attributs  
- [ ] Détail annonce publique  
- [ ] Suggestions  
- [ ] Taux EUR/DZD  

## Test app

1. Home → chips taxo + grille annonces réelles  
2. Tap annonce → détail via `/annonces/public/{id}`  
3. Search → saisie → debounce 400 ms → POST search  
4. Pull-to-refresh Accueil  
