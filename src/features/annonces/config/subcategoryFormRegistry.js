import { getVehicleSubcategoryConfig } from "./vehicleSubcategories";
import { getEmploiSubcategoryConfig } from "./emploiSubcategories";
import { getElectroniqueSubcategoryConfig } from "./electroniqueSubcategories";
import { getAnimauxSubcategoryConfig } from "./animauxSubcategories";
import { getMaisonJardinSubcategoryConfig } from "./maisonJardinSubcategories";
import { getLoisirsSubcategoryConfig } from "./loisirsSubcategories";
import { getLocationsVacancesSubcategoryConfig } from "./locationsVacancesSubcategories";
import { getMaterielProfessionnelSubcategoryConfig } from "./materielProfessionnelSubcategories";
import { getModeSubcategoryConfig } from "./modeSubcategories";
import { getServiceSubcategoryConfig } from "./serviceSubcategories";
import { getFamilleSubcategoryConfig } from "./familleSubcategories";
import { getImmobilierSubcategoryConfig } from "./immobilierSubcategories";

/**
 * Résout la config formulaire fils pour une sous-catégorie.
 * Pour l’instant : Immobilier (41–44). D’autres catégories pourront s’ajouter ici.
 */
export function getSubcategoryFormConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return (
    getVehicleSubcategoryConfig(sousCategorieId) ||
    getEmploiSubcategoryConfig(sousCategorieId) ||
    getElectroniqueSubcategoryConfig(sousCategorieId) ||
    getAnimauxSubcategoryConfig(sousCategorieId) ||
    getMaisonJardinSubcategoryConfig(sousCategorieId) ||
    getLoisirsSubcategoryConfig(sousCategorieId) ||
    getLocationsVacancesSubcategoryConfig(sousCategorieId) ||
    getMaterielProfessionnelSubcategoryConfig(sousCategorieId) ||
    getModeSubcategoryConfig(sousCategorieId) ||
    getServiceSubcategoryConfig(sousCategorieId) ||
    getFamilleSubcategoryConfig(sousCategorieId) ||
    getImmobilierSubcategoryConfig(sousCategorieId) ||
    null
  );
}
