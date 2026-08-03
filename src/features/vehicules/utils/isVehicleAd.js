import {
  VEHICULES_CATEGORIE_ID,
  isVehiculeSousCategorie,
} from "../../filters/vehiculeFilterAttributes";

export function isVehicleAd(ad) {
  if (!ad) return false;
  if (Number(ad.categorieId) === VEHICULES_CATEGORIE_ID) return true;
  return isVehiculeSousCategorie(ad.sousCategorieId);
}
