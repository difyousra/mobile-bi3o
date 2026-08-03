import { IMMOBILIER_CATEGORIE_IDS, isImmobilierSousCategorie } from "../../filters/immobilierFilterAttributes";

export function isImmobilierAd(ad) {
  if (!ad) return false;
  if (IMMOBILIER_CATEGORIE_IDS.includes(Number(ad.categorieId))) return true;
  return isImmobilierSousCategorie(ad.sousCategorieId);
}
