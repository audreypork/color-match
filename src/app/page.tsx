"use client";

import { useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import SeasonResult from "@/components/SeasonResult";
import StarSparkle from "@/components/StarSparkle";
import BlobBg from "@/components/BlobBg";
import type { AnalysisResult, SeasonKey, Season } from "@/types/season";
import seasonsData from "@/data/seasons_color_palettes.json";

type AppState = "intro" | "upload" | "results";

const FAMILY_PREVIEWS: { family: string; color: string; swatches: string[] }[] = [
  {
    family: "Spring",
    color: "#f0a500",
    swatches: ["#f7e7ce", "#f9c784", "#f28c38", "#e8b87a", "#fde68a", "#d4a574"],
  },
  {
    family: "Summer",
    color: "#7eb8d4",
    swatches: ["#d4e8f0", "#a8c8e0", "#7eb8d4", "#c9a8c5", "#b8d4e8", "#8fb8d0"],
  },
  {
    family: "Autumn",
    color: "#c0631b",
    swatches: ["#c0631b", "#8b4513", "#d2691e", "#cd853f", "#a0522d", "#daa520"],
  },
  {
    family: "Winter",
    color: "#5b6fa8",
    swatches: ["#1a1a2e", "#5b6fa8", "#c9a8c5", "#ffffff", "#2c3e6b", "#8b9dc3"],
  },
];

export default function Home() {
  const [appState, setAppState] = useState<AppState>("intro");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  function handleAnalysisComplete(result: AnalysisResult) {
    setAnalysis(result);
    setAppState("results");
  }

  const seasons = seasonsData.seasons as Record<string, Season>;

  // Top match + two neighbours from same family as runner-ups
  const topKey = analysis?.season;
  const topSeason = topKey ? seasons[topKey] : null;
  const runnerUpKeys = topKey
    ? Object.keys(seasons)
        .filter((k) => k !== topKey && seasons[k].family === topSeason?.family)
        .slice(0, 2) as SeasonKey[]
    : [];

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg)" }}>
      <BlobBg />

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <p className="mono text-xs mb-1" style={{ color: "#888" }}>
            Personal colour analysis
          </p>
          <h1
            className="mono text-4xl sm:text-5xl font-bold leading-tight"
            style={{ color: "var(--text)" }}
          >
            Colour
            <br />
            Season
            <br />
            Match
          </h1>
          <div className="flex gap-3 mt-3">
            <StarSparkle size={18} color="#b8e04a" animate />
            <StarSparkle size={12} color="#f0a500" />
            <StarSparkle size={20} color="#b8e04a" animate />
          </div>
        </div>

        {/* Intro */}
        {appState === "intro" && (
          <div>
            <p className="text-base mb-8 max-w-sm leading-relaxed" style={{ color: "#444" }}>
              Upload three photos of yourself and Claude will analyse your skin
              undertone, value, and chroma to find your colour season.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-10">
              {FAMILY_PREVIEWS.map((fp) => (
                <div
                  key={fp.family}
                  className="rounded-sm p-3"
                  style={{ border: "2px solid var(--border)" }}
                >
                  <p className="mono text-xs mb-2" style={{ color: fp.color }}>
                    {fp.family}
                  </p>
                  <div className="flex gap-1">
                    {fp.swatches.map((hex) => (
                      <span
                        key={hex}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: hex, border: "1px solid rgba(0,0,0,0.1)" }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAppState("upload")}
              className="flex items-center gap-3 px-6 py-3 font-semibold transition-transform hover:-translate-y-0.5"
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
                →
              </span>
              Find my season
            </button>
          </div>
        )}

        {/* Photo upload */}
        {appState === "upload" && (
          <PhotoUpload onComplete={handleAnalysisComplete} />
        )}

        {/* Results */}
        {appState === "results" && analysis && topKey && topSeason && (
          <div>
            {/* Claude's reasoning */}
            {analysis.reasoning && (
              <div
                className="mb-5 px-4 py-3 rounded-sm text-sm leading-relaxed"
                style={{ background: "#f9f9f9", border: "1px solid #eee", color: "#555" }}
              >
                <span className="mono text-xs block mb-1" style={{ color: "#aaa" }}>
                  Analysis
                </span>
                {analysis.reasoning}
              </div>
            )}

            <div className="space-y-5">
              <SeasonResult
                seasonKey={topKey}
                season={topSeason}
                rank={1}
                isTop={true}
                confidence={analysis.confidence}
              />
              {runnerUpKeys.map((key, i) => {
                const s = seasons[key];
                if (!s) return null;
                return (
                  <SeasonResult
                    key={key}
                    seasonKey={key}
                    season={s}
                    rank={i + 2}
                    isTop={false}
                  />
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  setAppState("intro");
                  setAnalysis(null);
                }}
                className="flex items-center gap-3 px-6 py-3 font-semibold transition-transform hover:-translate-y-0.5"
                style={{
                  background: "white",
                  color: "var(--text)",
                  borderRadius: 9999,
                  border: "2px solid var(--border)",
                }}
              >
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full text-sm"
                  style={{ background: "var(--text)", color: "white" }}
                >
                  ↺
                </span>
                Try again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
