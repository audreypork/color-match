export interface SeasonColor {
  name: string;
  hex: string;
  category: string;
  notes?: string;
}

export interface SeasonCharacteristics {
  undertone: string;
  value: string;
  chroma: string;
  contrast_level: string;
  primary_aspect: string;
  secondary_aspect: string;
}

export interface Season {
  name: string;
  family: "Spring" | "Summer" | "Autumn" | "Winter";
  description: string;
  characteristics: SeasonCharacteristics;
  colors: SeasonColor[];
  avoid: string[];
  metals: string;
  sources: string[];
}

export type SeasonKey =
  | "light_spring"
  | "true_spring"
  | "bright_spring"
  | "light_summer"
  | "true_summer"
  | "soft_summer"
  | "soft_autumn"
  | "true_autumn"
  | "dark_autumn"
  | "dark_winter"
  | "true_winter"
  | "bright_winter";

export interface SeasonsData {
  system: string;
  description: string;
  seasons: Record<SeasonKey, Season>;
}

export type Undertone = "warm" | "cool" | "neutral-warm" | "neutral-cool";
export type Value = "light" | "medium" | "dark";
export type Chroma = "bright" | "muted" | "medium";

export interface QuizAnswers {
  undertone: Undertone | null;
  value: Value | null;
  chroma: Chroma | null;
}

export interface AnalysisResult {
  season: SeasonKey;
  confidence: number;
  undertone: Undertone;
  value: Value;
  chroma: Chroma;
  reasoning: string;
}
