/**
 * Convertit un numéro saisi (ex. "(213) 726-0592") vers le format API (+2137260592).
 */
export function normalizePhoneForApi(phone) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("213")) return `+${digits}`;
  if (digits.length >= 10) return `+213${digits.replace(/^0+/, "")}`;
  return `+${digits}`;
}
