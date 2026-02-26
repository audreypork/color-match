"use client";

import { useState } from "react";
import type { Season } from "@/types/season";
import { getFamilyColor } from "@/lib/matcher";

interface PaletteGridProps {
  season: Season;
  onBack: () => void;
  onCheckItem: () => void;
}

function groupByCategory(colors: Season["colors"]) {
  const groups: Record<string, Season["colors"]> = {};
  for (const c of colors) {
    if (!groups[c.category]) groups[c.category] = [];
    groups[c.category].push(c);
  }
  return groups;
}

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}

export default function PaletteGrid({ season, onBack, onCheckItem }: PaletteGridProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const familyColor = getFamilyColor(season.family);
  const groups = groupByCategory(season.colors);

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  }

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
          Full palette
        </p>
        <h2
          className="mono text-3xl font-bold leading-tight"
          style={{ color: "var(--text)" }}
        >
          {season.name}
        </h2>
        <p className="mono text-sm mt-1" style={{ color: familyColor }}>
          {season.family} Season
        </p>

        {/* Metals pill */}
        <div
          className="inline-flex items-center gap-2 mt-4 px-3 py-1.5"
          style={{
            border: "1.5px solid var(--border)",
            borderRadius: 9999,
            background: "white",
          }}
        >
          <span className="mono text-xs" style={{ color: "#888" }}>
            Best metals:
          </span>
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {season.metals}
          </span>
        </div>
      </div>

      {/* Colour categories */}
      <div className="space-y-8">
        {Object.entries(groups).map(([cat, colors]) => (
          <div key={cat}>
            <p
              className="mono text-xs mb-4 pb-2"
              style={{ color: "#aaa", borderBottom: "1px solid #eee" }}
            >
              {cat}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {colors.map((color) => {
                const isCopied = copiedHex === color.hex;
                return (
                  <button
                    key={color.hex}
                    onClick={() => copyHex(color.hex)}
                    className="flex flex-col items-center gap-1.5 group"
                    title={`${color.name} · ${color.hex}`}
                    aria-label={`Copy ${color.hex}`}
                  >
                    <span
                      className="flex items-center justify-center w-12 h-12 rounded-full transition-transform group-hover:scale-110 group-active:scale-95"
                      style={{
                        backgroundColor: color.hex,
                        border: "1.5px solid rgba(0,0,0,0.1)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      }}
                    >
                      {isCopied && (
                        <span
                          className="font-bold"
                          style={{
                            fontSize: 16,
                            color: isLight(color.hex) ? "#1a1a1a" : "#fff",
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </span>
                    <span
                      className="text-center leading-tight"
                      style={{ fontSize: 10, color: "#666", maxWidth: 52 }}
                    >
                      {isCopied ? (
                        <span className="mono" style={{ color: "#888" }}>
                          {color.hex}
                        </span>
                      ) : (
                        color.name
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Avoid section */}
      {season.avoid.length > 0 && (
        <div
          className="mt-10 p-4 rounded-sm"
          style={{ border: "1.5px solid #eee", background: "#fafafa" }}
        >
          <p className="mono text-xs mb-3" style={{ color: "#aaa" }}>
            Avoid
          </p>
          <ul className="space-y-1">
            {season.avoid.map((a, i) => (
              <li key={i} className="text-sm" style={{ color: "#666" }}>
                — {a.split("(")[0].trim()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10">
        <button
          onClick={onCheckItem}
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
          Check an item
        </button>
      </div>
    </div>
  );
}
