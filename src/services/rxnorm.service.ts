// RxNorm — free public medicine search API from the US National Library of Medicine.
// Docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/RxNormAPIs.html
// No API key required.

const BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

export interface MedicineSuggestion {
  name: string;
  rxcui?: string;
  synonym?: string;
}

// Approximate match — good for typo-tolerant autocomplete.
export const searchMedicines = async (
  query: string,
  maxResults = 10,
): Promise<MedicineSuggestion[]> => {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = `${BASE_URL}/approximateTerm.json?term=${encodeURIComponent(q)}&maxEntries=${maxResults}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();

  const candidates: { rxcui: string; score: number }[] =
    json?.approximateGroup?.candidate ?? [];

  const seen = new Set<string>();
  const results: MedicineSuggestion[] = [];
  for (const c of candidates) {
    if (seen.has(c.rxcui)) continue;
    seen.add(c.rxcui);
    const name = await getRxcuiName(c.rxcui);
    if (name) results.push({ name, rxcui: c.rxcui });
    if (results.length >= maxResults) break;
  }
  return results;
};

const nameCache = new Map<string, string>();

const getRxcuiName = async (rxcui: string): Promise<string | null> => {
  if (nameCache.has(rxcui)) return nameCache.get(rxcui)!;
  try {
    const res = await fetch(`${BASE_URL}/rxcui/${rxcui}/property.json?propName=RxNorm%20Name`);
    if (!res.ok) return null;
    const json = await res.json();
    const name = json?.propConceptGroup?.propConcept?.[0]?.propValue ?? null;
    if (name) nameCache.set(rxcui, name);
    return name;
  } catch {
    return null;
  }
};
