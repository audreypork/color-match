import type { SeasonKey, QuizAnswers } from "@/types/season";

/**
 * Season scoring matrix.
 * For each season, define the ideal undertone/value/chroma profile.
 * We score each season based on how well the user's answers match.
 */
const SEASON_PROFILES: Record<
  SeasonKey,
  { undertone: string[]; value: string[]; chroma: string[] }
> = {
  light_spring: {
    undertone: ["warm", "neutral-warm"],
    value: ["light"],
    chroma: ["medium", "muted"],
  },
  true_spring: {
    undertone: ["warm"],
    value: ["medium", "light"],
    chroma: ["bright", "medium"],
  },
  bright_spring: {
    undertone: ["warm", "neutral-warm"],
    value: ["medium", "light"],
    chroma: ["bright"],
  },
  light_summer: {
    undertone: ["cool", "neutral-cool"],
    value: ["light"],
    chroma: ["muted", "medium"],
  },
  true_summer: {
    undertone: ["cool"],
    value: ["medium", "light"],
    chroma: ["muted", "medium"],
  },
  soft_summer: {
    undertone: ["cool", "neutral-cool"],
    value: ["medium"],
    chroma: ["muted"],
  },
  soft_autumn: {
    undertone: ["warm", "neutral-warm"],
    value: ["medium"],
    chroma: ["muted"],
  },
  true_autumn: {
    undertone: ["warm"],
    value: ["medium", "dark"],
    chroma: ["medium", "muted"],
  },
  dark_autumn: {
    undertone: ["warm", "neutral-warm"],
    value: ["dark", "medium"],
    chroma: ["medium", "muted"],
  },
  dark_winter: {
    undertone: ["cool", "neutral-cool"],
    value: ["dark"],
    chroma: ["medium", "bright"],
  },
  true_winter: {
    undertone: ["cool"],
    value: ["dark", "medium"],
    chroma: ["bright", "medium"],
  },
  bright_winter: {
    undertone: ["cool", "neutral-cool"],
    value: ["medium", "dark"],
    chroma: ["bright"],
  },
};

export function matchSeason(answers: QuizAnswers): SeasonKey[] {
  const { undertone, value, chroma } = answers;

  const scores: Record<SeasonKey, number> = {} as Record<SeasonKey, number>;

  for (const [key, profile] of Object.entries(SEASON_PROFILES) as [
    SeasonKey,
    (typeof SEASON_PROFILES)[SeasonKey],
  ][]) {
    let score = 0;
    if (undertone && profile.undertone.includes(undertone)) {
      // Undertone is most important — weight it higher
      score += profile.undertone[0] === undertone ? 3 : 2;
    }
    if (value && profile.value.includes(value)) {
      score += profile.value[0] === value ? 2 : 1;
    }
    if (chroma && profile.chroma.includes(chroma)) {
      score += profile.chroma[0] === chroma ? 2 : 1;
    }
    scores[key] = score;
  }

  // Sort by score descending, return top 3
  return (Object.entries(scores) as [SeasonKey, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);
}

export function getFamilyColor(family: string): string {
  switch (family) {
    case "Spring":
      return "#f0a500";
    case "Summer":
      return "#7eb8d4";
    case "Autumn":
      return "#c0631b";
    case "Winter":
      return "#5b6fa8";
    default:
      return "#888";
  }
}
