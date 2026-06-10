export interface Commune {
  nom: string;
  code: string;
  codesPostaux?: string[];
  centre?: { type: string; coordinates: number[] };
  codeDepartement?: string;
  codeRegion?: string;
  population?: number;
}
