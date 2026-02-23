"use client";

import { useState } from "react";
import Quiz from "@/components/Quiz";
import SeasonResult from "@/components/SeasonResult";
import { matchSeason } from "@/lib/matcher";
import type { QuizAnswers, SeasonKey, Season } from "@/types/season";
import seasonsData from "@/data/seasons_color_palettes.json";

type AppState = "intro" | "quiz" | "results";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("intro");
  const [matches, setMatches] = useState<SeasonKey[]>([]);

  function handleQuizComplete(answers: QuizAnswers) {
    const result = matchSeason(answers);
    setMatches(result);
    setAppState("results");
  }

  const seasons = seasonsData.seasons as Record<string, Season>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-2">
            Color Season Match
          </h1>
          <p className="text-slate-500">
            Discover your 12-season color palette in 3 questions.
          </p>
        </div>

        {/* Intro */}
        {appState === "intro" && (
          <div className="text-center">
            <div className="flex justify-center gap-3 mb-8 flex-wrap">
              {["#f7e7ce", "#c9a8c5", "#e8b87a", "#5b6fa8", "#c0631b", "#7eb8d4"].map(
                (hex) => (
                  <span
                    key={hex}
                    className="w-10 h-10 rounded-full border border-black/10"
                    style={{ backgroundColor: hex }}
                  />
                )
              )}
            </div>
            <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
              The 12-season system categorizes your natural coloring into one of
              twelve seasonal palettes — each with its own set of harmonious
              colors that make you look your best.
            </p>
            <button
              onClick={() => setAppState("quiz")}
              className="bg-slate-800 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors"
            >
              Find My Season →
            </button>
          </div>
        )}

        {/* Quiz */}
        {appState === "quiz" && <Quiz onComplete={handleQuizComplete} />}

        {/* Results */}
        {appState === "results" && matches.length > 0 && (
          <div>
            <div className="space-y-6">
              {matches.map((key, i) => {
                const season = seasons[key];
                if (!season) return null;
                return (
                  <SeasonResult
                    key={key}
                    seasonKey={key as SeasonKey}
                    season={season}
                    rank={i + 1}
                    isTop={i === 0}
                  />
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setAppState("intro");
                  setMatches([]);
                }}
                className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
