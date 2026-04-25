/**
 * Devpost "Opt-In Prizes" is a comma-separated list where each entry looks like:
 *   "Best Use of AI - Mac Mini with Apple M4 chip"
 *   "[MLH] Best Use of Gemma 4 - Google Swag Kits"
 *   "Listen Labs x HackTech: Simulate Humanity"   (no reward)
 * Strategy: split on ", ", then split each entry on the FIRST " - "
 * (with surrounding spaces) and keep the prefix.
 */

export function splitOptInPrizes(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(/,\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function prizeName(fullEntry: string): string {
  const idx = fullEntry.indexOf(" - ");
  if (idx === -1) return fullEntry.trim();
  return fullEntry.slice(0, idx).trim();
}

export function prizeNamesFromOptIn(raw: string | undefined | null): string[] {
  return splitOptInPrizes(raw).map(prizeName);
}

export function buildPrizeCatalog(allPrizeNames: string[][]): string[] {
  const set = new Set<string>();
  for (const arr of allPrizeNames) for (const p of arr) set.add(p);
  return [...set].sort((a, b) => a.localeCompare(b));
}
