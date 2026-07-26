import { apiClient } from "../api/client";
import type { Page } from "../types/auth";
import type { ReservationDto } from "../types/messaging";

function asPage<T>(data: unknown): Page<T> {
  if (data && typeof data === "object" && Array.isArray((data as Page<T>).content)) {
    return data as Page<T>;
  }
  if (Array.isArray(data)) {
    return {
      content: data as T[],
      number: 0,
      size: data.length,
      totalElements: data.length,
      totalPages: 1,
      first: true,
      last: true,
    };
  }
  return {
    content: [],
    number: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  };
}

/** GET /reservations/public/annonces/{annonceId}/calendar */
export async function fetchReservationCalendar(
  annonceId: number | string
): Promise<unknown> {
  const { data } = await apiClient.get(
    `/reservations/public/annonces/${annonceId}/calendar`
  );
  return data;
}

/**
 * POST /reservations/annonces/{annonceId}
 * Corps non détaillé dans Postman — passer uniquement les champs fournis par l’appelant.
 */
export async function createReservation(
  annonceId: number | string,
  body: Record<string, unknown>
): Promise<ReservationDto> {
  const { data } = await apiClient.post(
    `/reservations/annonces/${annonceId}`,
    body
  );
  return data as ReservationDto;
}

/** GET /reservations/me */
export async function fetchMyReservations(params?: {
  page?: number;
  size?: number;
}): Promise<Page<ReservationDto>> {
  const { data } = await apiClient.get("/reservations/me", {
    params: { page: params?.page ?? 0, size: params?.size ?? 20 },
  });
  return asPage<ReservationDto>(data);
}

/** GET /reservations/annonces/{annonceId} — propriétaire */
export async function fetchAnnonceReservations(
  annonceId: number | string,
  params?: { page?: number; size?: number }
): Promise<Page<ReservationDto>> {
  const { data } = await apiClient.get(`/reservations/annonces/${annonceId}`, {
    params: { page: params?.page ?? 0, size: params?.size ?? 20 },
  });
  return asPage<ReservationDto>(data);
}

/** PATCH /reservations/{reservationId}/status */
export async function updateReservationStatus(
  reservationId: number | string,
  status: string
): Promise<ReservationDto> {
  const { data } = await apiClient.patch(
    `/reservations/${reservationId}/status`,
    { status }
  );
  return data as ReservationDto;
}
