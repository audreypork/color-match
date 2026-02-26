/** Hex → [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** sRGB channel linearisation */
function linearise(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** RGB → CIE Lab (D65) */
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const R = linearise(r);
  const G = linearise(g);
  const B = linearise(b);

  const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  const Y = (R * 0.2126729 + G * 0.7151522 + B * 0.072175) / 1.0;
  const Z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883;

  function f(t: number) {
    return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  }

  const fx = f(X);
  const fy = f(Y);
  const fz = f(Z);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIE76 Delta E between two hex colours */
export function deltaE(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const [L1, a1, b1_] = rgbToLab(r1, g1, b1);
  const [L2, a2, b2_] = rgbToLab(r2, g2, b2);
  return Math.sqrt((L1 - L2) ** 2 + (a1 - a2) ** 2 + (b1_ - b2_) ** 2);
}

export interface DominantColor {
  hex: string;
  coverage: number; // 0–1
}

export interface PaletteColor {
  hex: string;
  name: string;
}

export interface ColorMatchDetail {
  extracted: DominantColor;
  nearest: PaletteColor & { deltaE: number };
  score: number; // 0–100
}

/**
 * Analyse how well a set of dominant colours match a season palette.
 * Returns an overall score (0–100) and per-colour breakdown.
 */
export function analyseMatch(
  dominantColors: DominantColor[],
  paletteColors: PaletteColor[]
): { score: number; details: ColorMatchDetail[] } {
  if (dominantColors.length === 0 || paletteColors.length === 0) {
    return { score: 0, details: [] };
  }

  const details: ColorMatchDetail[] = dominantColors.map((dc) => {
    let best = paletteColors[0];
    let bestDe = deltaE(dc.hex, best.hex);

    for (const pc of paletteColors.slice(1)) {
      const de = deltaE(dc.hex, pc.hex);
      if (de < bestDe) {
        bestDe = de;
        best = pc;
      }
    }

    // ΔE < 6 → excellent (100), ΔE 35+ → 0, linear in between
    const score = Math.max(0, Math.round(100 - (bestDe / 35) * 100));

    return {
      extracted: dc,
      nearest: { ...best, deltaE: Math.round(bestDe * 10) / 10 },
      score,
    };
  });

  const totalWeight = details.reduce((s, d) => s + d.extracted.coverage, 0);
  const weightedScore =
    details.reduce((s, d) => s + d.score * d.extracted.coverage, 0) /
    (totalWeight || 1);

  return { score: Math.round(weightedScore), details };
}

/** Human-readable match label */
export function matchLabel(score: number): string {
  if (score >= 85) return "Great match";
  if (score >= 70) return "Good match";
  if (score >= 55) return "Decent match";
  if (score >= 40) return "Partial match";
  return "Not your season";
}
