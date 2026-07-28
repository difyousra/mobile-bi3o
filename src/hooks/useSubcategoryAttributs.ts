import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import {
  fetchAttributs,
  fetchReferentielMarquesModeles,
} from "../services/taxoService";
import { normalizeTaxoAttributsResponse } from "../features/annonces/utils/taxoHelpers";

/** GET /taxo/sous-categories/{id}/attributs */
export function useSubcategoryAttributs(
  sousCategorieId: number | string | null | undefined
) {
  const id = Number(sousCategorieId);
  const enabled = Number.isFinite(id) && id > 0;

  return useQuery({
    queryKey: queryKeys.attributs(enabled ? id : 0),
    queryFn: async () => {
      const data = await fetchAttributs(id);
      return normalizeTaxoAttributsResponse(data);
    },
    enabled,
    staleTime: 30 * 60 * 1000,
  });
}

/** GET /taxo/referentiel/marques-modeles */
export function useReferentielMarquesModeles(enabled = true) {
  return useQuery({
    queryKey: queryKeys.referentielMarquesModeles,
    queryFn: fetchReferentielMarquesModeles,
    enabled,
    staleTime: 30 * 60 * 1000,
  });
}
