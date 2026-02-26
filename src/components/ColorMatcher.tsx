"use client";

import { useState, useRef } from "react";
import type { Season } from "@/types/season";
import { extractDominantColors } from "@/lib/colorExtract";
import { analyseMatch, matchLabel, type ColorMatchDetail } from "@/lib/colorDistance";

interface ColorMatcherProps {
  season: Season;
  onBack: () => void;
}

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}

/** Resize an uploaded image to max 800px before extracting colours */
function resizeForExtraction(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) {
          height = Math.round((height / width) * MAX);
          width = MAX;
        } else {
          width = Math.round((width / height) * MAX);
          height = MAX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

type MatchState = "idle" | "loading" | "done";

interface MatchResult {
  score: number;
  details: ColorMatchDetail[];
  previewUrl: string;
}

export default function ColorMatcher({ season, onBack }: ColorMatcherProps) {
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const paletteColors = season.colors.map((c) => ({ hex: c.hex, name: c.name }));

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setError(null);
    setMatchState("loading");

    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((res, rej) => {
        reader.onload = (e) => res(e.target?.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

      const resized = await resizeForExtraction(dataUrl);
      const dominant = await extractDominantColors(resized, 6);
      const { score, details } = analyseMatch(dominant, paletteColors);

      setResult({ score, details, previewUrl: resized });
      setMatchState("done");
    } catch {
      setError("Could not read the image. Please try another.");
      setMatchState("idle");
    }
  }

  function reset() {
    setResult(null);
    setMatchState("idle");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const scoreColor =
    (result?.score ?? 0) >= 70
      ? "#4caf50"
      : (result?.score ?? 0) >= 40
      ? "#f0a500"
      : "#e05555";

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-8 mono text-xs transition-opacity hover:opacity-60"
        style={{ color: "#888" }}
      >
        ← Back to results
      </button>

      {/* Header */}
      <div className="mb-8">
        <p className="mono text-xs mb-1" style={{ color: "#888" }}>
          Colour matcher
        </p>
        <h2
          className="mono text-3xl font-bold leading-tight"
          style={{ color: "var(--text)" }}
        >
          Check an item
        </h2>
        <p className="text-sm mt-2" style={{ color: "#666" }}>
          Photo a piece of clothing, accessory, or makeup and see how well it
          matches your {season.name} palette.
        </p>
      </div>

      {/* Upload zone — shown when idle or after reset */}
      {matchState === "idle" && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-4 py-14 transition-all hover:opacity-80 active:scale-[0.98]"
            style={{
              border: "2px dashed #ccc",
              borderRadius: 8,
              background: "#fafafa",
            }}
          >
            <span style={{ fontSize: 40 }}>📷</span>
            <div className="text-center">
              <p className="font-semibold" style={{ color: "var(--text)" }}>
                Upload a photo
              </p>
              <p className="text-sm mt-1" style={{ color: "#aaa" }}>
                Use camera or choose from library
              </p>
            </div>
          </button>

          {error && (
            <p
              className="mt-4 text-sm px-3 py-2 rounded"
              style={{
                background: "#fff0f0",
                color: "#c00",
                border: "1px solid #fcc",
              }}
            >
              {error}
            </p>
          )}
        </>
      )}

      {/* Loading state */}
      {matchState === "loading" && (
        <div className="py-14 flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{
                  background: "var(--accent)",
                  opacity: 0.3 + i * 0.12,
                  animation: `pulse ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
          <p className="mono text-xs" style={{ color: "#888" }}>
            Extracting colours…
          </p>
        </div>
      )}

      {/* Result */}
      {matchState === "done" && result && (
        <div>
          {/* Preview + score */}
          <div
            className="rounded-sm overflow-hidden mb-5"
            style={{ border: "2px solid var(--border)" }}
          >
            {/* Image preview strip */}
            <div
              className="w-full"
              style={{ height: 180, background: "#f0f0f0", overflow: "hidden" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.previewUrl}
                alt="Item photo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Score */}
            <div style={{ background: "var(--accent)", padding: "20px 24px" }}>
              <div className="flex items-end gap-3">
                <span
                  className="mono font-bold"
                  style={{ fontSize: 56, lineHeight: 1, color: "var(--text)" }}
                >
                  {result.score}%
                </span>
                <div className="pb-1">
                  <p
                    className="mono text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {matchLabel(result.score)}
                  </p>
                  <p className="mono text-xs" style={{ color: "#666" }}>
                    vs. your {season.name} palette
                  </p>
                </div>
              </div>

              {/* Score bar */}
              <div
                className="mt-4 h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(0,0,0,0.15)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${result.score}%`,
                    background: scoreColor,
                  }}
                />
              </div>
            </div>

            {/* Per-colour breakdown */}
            <div className="bg-white px-5 py-4">
              <p className="mono text-xs mb-4" style={{ color: "#888" }}>
                Colour breakdown
              </p>
              <div className="space-y-3">
                {result.details.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {/* Extracted colour */}
                    <span
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: d.extracted.hex,
                        border: "1.5px solid rgba(0,0,0,0.1)",
                      }}
                    />
                    {/* Arrow + score */}
                    <div className="flex flex-col items-center flex-shrink-0 w-10">
                      <span
                        className="mono text-xs"
                        style={{
                          color:
                            d.score >= 70
                              ? "#4caf50"
                              : d.score >= 40
                              ? "#f0a500"
                              : "#e05555",
                        }}
                      >
                        {d.score}%
                      </span>
                      <span style={{ color: "#ccc", fontSize: 12 }}>→</span>
                    </div>
                    {/* Nearest palette colour */}
                    <span
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: d.nearest.hex,
                        border: "1.5px solid rgba(0,0,0,0.1)",
                      }}
                    />
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--text)" }}
                      >
                        {d.nearest.name}
                      </p>
                      <p className="mono text-xs" style={{ color: "#aaa" }}>
                        ΔE {d.nearest.deltaE}
                      </p>
                    </div>
                    {/* Coverage bar */}
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden ml-auto"
                      style={{ background: "#f0f0f0", minWidth: 40 }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(d.extracted.coverage * 100)}%`,
                          background: d.extracted.hex,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mono text-xs mt-3" style={{ color: "#ccc" }}>
                ΔE = colour distance · coverage bar shows how much of the photo each colour occupies
              </p>
            </div>
          </div>

          {/* Try another */}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            id="matcher-retry"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                reset();
                // slight delay so reset completes before re-entering loading
                setTimeout(() => handleFile(f), 50);
              }
            }}
          />
          <div className="flex gap-3 flex-wrap">
            <label
              htmlFor="matcher-retry"
              className="flex items-center gap-3 px-6 py-3 font-semibold cursor-pointer transition-transform hover:-translate-y-0.5"
              style={{
                background: "var(--accent)",
                color: "var(--text)",
                borderRadius: 9999,
                border: "2px solid var(--border)",
              }}
            >
              <span
                className="flex items-center justify-center w-7 h-7 rounded-full text-sm"
                style={{ background: "var(--text)", color: "var(--accent)" }}
              >
                +
              </span>
              Try another photo
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
