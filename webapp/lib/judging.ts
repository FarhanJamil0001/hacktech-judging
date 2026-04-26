/** Google Maps deep link for Bechtel Center (expo / time-slot judging). */
export const BECHTEL_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=34.14021157809335,-118.12446813086468";

export const VENUE_NAME = "Bechtel Center";

/** Full opt-in line or prize-catalog name: MLH tracks are tagged with a leading [MLH]. */
export function isMlhPrizeText(s: string): boolean {
  return s.trimStart().startsWith("[MLH]");
}
