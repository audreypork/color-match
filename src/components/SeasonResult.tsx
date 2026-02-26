"use client";

import { useState } from "react";
import type { Season, SeasonKey } from "@/types/season";
import { getFamilyColor } from "@/lib/matcher";
import StarSparkle from "@/components/StarSparkle";

interface SeasonResultProps {
  seasonKey: SeasonKey;
  season: Season;
  rank: number;
  isTop: boolean;
  confidence?: number;
  onViewPalette?: () => void;
  onCheckItem?: () => void;
}

// Group colors by category
function groupByCategory(colors: Season["colors"]) {
  const groups: Record<string, Season["colors"]> = {};
  for (const c of colors) {
    if (!groups[c.category]) groups[c.category] = [];
    groups[c.category].push(c);
  }
  return groups;
}

export default function SeasonResult({
  season,
  rank,
  isTop,
  confidence,
  onViewPalette,
  onCheckItem,
}: SeasonResultProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const familyColor = getFamilyColor(season.family);
  const groups = groupByCategory(season.colors);

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  }

  if (isTop) {
    return (
      <div
        className="rounded-sm overflow-hidden"
        style={{ border: "2px solid var(--border)" }}
      >
        {/* Top match header — accent background */}
        <div style={{ background: "var(--accent)", padding: "20px 24px" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="mono text-xs mb-1" style={{ color: "#555" }}>
                You are —
              </p>
              <h3
                className="mono text-3xl font-bold leading-tight"
                style={{ color: "var(--text)" }}
              >
                {season.name}
              </h3>
              <p className="mono text-sm mt-1" style={{ color: familyColor }}>
                {season.family} Season
              </p>
            </div>
            <StarSparkle size={32} color="var(--text)" animate />
          </div>

          {/* Segmented match indicator */}
          {(() => {
            const filled = Math.round(((confidence ?? 80) / 100) * 8);
            const label = (confidence ?? 80) >= 80 ? "Strong match" : (confidence ?? 80) >= 60 ? "Good match" : "Possible match";
            return (
              <>
                <div className="flex gap-1.5 mt-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-2 flex-1 rounded-full"
                      style={{ background: i < filled ? "var(--text)" : "rgba(0,0,0,0.2)" }}
                    />
                  ))}
                </div>
                <p className="mono text-xs mt-1" style={{ color: "#555" }}>
                  {confidence != null ? `${confidence}% — ${label}` : label}
                </p>
              </>
            );
          })()}
        </div>

        {/* Characteristics */}
        <div
          className="grid grid-cols-3 gap-px"
          style={{ background: "var(--border)" }}
        >
          {[
            { label: "Undertone", value: season.characteristics.undertone.split(" ")[0] },
            { label: "Value", value: season.characteristics.value.split(" ")[0] },
            { label: "Chroma", value: season.characteristics.chroma.split(" ")[0] },
          ].map((c) => (
            <div key={c.label} className="px-4 py-3 bg-white">
              <p className="mono text-xs mb-0.5" style={{ color: "#888" }}>
                {c.label}
              </p>
              <p className="text-sm font-semibold capitalize" style={{ color: "var(--text)" }}>
                {c.value}
              </p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="px-6 py-4 bg-white" style={{ borderBottom: "1px solid #eee" }}>
          <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
            {season.description.split(".").slice(0, 2).join(".") + "."}
          </p>
        </div>

        {/* Colour palette grouped by category */}
        <div className="px-6 py-5 bg-white">
          <p className="mono text-xs mb-4" style={{ color: "#888" }}>
            Your palette
          </p>
          <div className="space-y-4">
            {Object.entries(groups).map(([cat, colors]) => (
              <div key={cat}>
                <p className="mono text-xs mb-2" style={{ color: "#aaa" }}>
                  {cat}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const isCopied = copiedHex === color.hex;
                    return (
                      <button
                        key={color.hex}
                        onClick={() => copyHex(color.hex)}
                        className="relative group"
                        title={`${color.name} · ${color.hex}`}
                        aria-label={`Copy ${color.hex}`}
                      >
                        <span
                          className="flex items-center justify-center w-7 h-7 rounded-full transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: color.hex,
                            border: "1.5px solid rgba(0,0,0,0.12)",
                          }}
                        >
                          {isCopied && (
                            <span
                              className="text-xs font-bold"
                              style={{
                                color: isLight(color.hex) ? "#1a1a1a" : "#fff",
                                fontSize: 10,
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </span>
                        {/* Tooltip */}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 bg-[#1a1a1a] text-white rounded px-2 py-1 pointer-events-none whitespace-nowrap"
                          style={{ fontSize: 11, fontFamily: "DM Mono, monospace" }}>
                          {isCopied ? "Copied!" : color.hex}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metals + Avoid */}
        <div
          className="grid gap-px"
          style={{ background: "var(--border)", gridTemplateColumns: season.avoid.length ? "1fr 1fr" : "1fr" }}
        >
          <div className="px-4 py-4 bg-white">
            <p className="mono text-xs mb-1" style={{ color: "#888" }}>
              Best metals
            </p>
            <p className="text-sm" style={{ color: "var(--text)" }}>
              {season.metals}
            </p>
          </div>
          {season.avoid.length > 0 && (
            <div className="px-4 py-4 bg-white">
              <p className="mono text-xs mb-1" style={{ color: "#888" }}>
                Avoid
              </p>
              <ul className="space-y-0.5">
                {season.avoid.slice(0, 3).map((a, i) => (
                  <li key={i} className="text-sm" style={{ color: "#555" }}>
                    — {a.split("(")[0].trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Palette + Matcher CTAs */}
        {(onViewPalette || onCheckItem) && (
          <div
            className="px-5 py-4 bg-white flex gap-3 flex-wrap"
            style={{ borderTop: "1px solid #eee" }}
          >
            {onViewPalette && (
              <button
                onClick={onViewPalette}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{
                  background: "var(--accent)",
                  color: "var(--text)",
                  borderRadius: 9999,
                  border: "1.5px solid var(--border)",
                }}
              >
                View full palette →
              </button>
            )}
            {onCheckItem && (
              <button
                onClick={onCheckItem}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{
                  background: "white",
                  color: "var(--text)",
                  borderRadius: 9999,
                  border: "1.5px solid var(--border)",
                }}
              >
                Check an item →
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Runner-up card — simpler
  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{ border: "2px solid #ccc" }}
    >
      <div className="px-5 py-4 bg-white flex items-center justify-between gap-4">
        <div>
          <p className="mono text-xs mb-0.5" style={{ color: "#aaa" }}>
            #{rank} match
          </p>
          <h4 className="mono text-xl font-bold" style={{ color: "var(--text)" }}>
            {season.name}
          </h4>
          <p className="mono text-xs mt-0.5" style={{ color: familyColor }}>
            {season.family}
          </p>
        </div>
        {/* Mini palette */}
        <div className="flex flex-wrap gap-1.5 max-w-[160px] justify-end">
          {season.colors.slice(0, 10).map((color) => {
            const isCopied = copiedHex === color.hex;
            return (
              <button
                key={color.hex}
                onClick={() => copyHex(color.hex)}
                className="relative group"
                title={color.hex}
                aria-label={`Copy ${color.hex}`}
              >
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: color.hex,
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  {isCopied && (
                    <span
                      style={{
                        fontSize: 8,
                        color: isLight(color.hex) ? "#1a1a1a" : "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Returns true if a hex color is perceptually light */
function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}
