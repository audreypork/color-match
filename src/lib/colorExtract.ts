import type { DominantColor } from "./colorDistance";

/**
 * Extract the N most dominant colours from an image data URL using canvas.
 * Colours are quantised to 16 levels per channel to group near-identical hues.
 * Returns colours sorted by coverage (highest first).
 */
export function extractDominantColors(
  imageDataUrl: string,
  count = 6
): Promise<DominantColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const SIZE = 160;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not available"));

      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

      // Build frequency map — quantise each channel to 16 values
      const freq: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue; // skip transparent
        const r = (data[i] >> 4) << 4;
        const g = (data[i + 1] >> 4) << 4;
        const b = (data[i + 2] >> 4) << 4;
        const key = `${r},${g},${b}`;
        freq[key] = (freq[key] ?? 0) + 1;
      }

      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, count);
      const totalPixels = top.reduce((s, [, n]) => s + n, 0);

      const result: DominantColor[] = top.map(([key, n]) => {
        const [r, g, b] = key.split(",").map(Number);
        const hex =
          "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
        return { hex, coverage: n / totalPixels };
      });

      resolve(result);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageDataUrl;
  });
}
