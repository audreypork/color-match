"use client";

import type { Season, SeasonKey } from "@/types/season";
import { getFamilyColor } from "@/lib/matcher";

interface SeasonResultProps {
  seasonKey: SeasonKey;
  season: Season;
  rank: number;
  isTop: boolean;
}

export default function SeasonResult({
  seasonKey,
  season,
  rank,
  isTop,
}: SeasonResultProps) {
  const familyColor = getFamilyColor(season.family);
  const displayColors = season.colors.slice(0, 20);

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden ${
        isTop ? "border-slate-700" : "border-slate-200"
      }`}
    >
      {/* Header */}
      <div
        className="px-6 py-5"
        style={{ backgroundColor: familyColor + "22" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {isTop && (
              <span className="inline-block text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-700 text-white mb-2">
                Your Season
              </span>
            )}
            {!isTop && (
              <span className="text-xs text-slate-400 mb-2 block">
                #{rank} match
              </span>
            )}
            <h3 className="text-2xl font-bold text-slate-800">{season.name}</h3>
            <span
              className="text-sm font-medium"
              style={{ color: familyColor }}
            >
              {season.family} Family
            </span>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-500 mb-1">Metals</div>
            <div className="text-sm text-slate-700">{season.metals}</div>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          {season.description.split(".").slice(0, 2).join(".") + "."}
        </p>
      </div>

      {/* Characteristics */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 grid grid-cols-3 gap-3">
        {[
          { label: "Undertone", value: season.characteristics.undertone },
          { label: "Value", value: season.characteristics.value },
          { label: "Chroma", value: season.characteristics.chroma },
        ].map((c) => (
          <div key={c.label}>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">
              {c.label}
            </div>
            <div className="text-sm text-slate-700 font-medium capitalize">
              {c.value.split(" ")[0]}
            </div>
          </div>
        ))}
      </div>

      {/* Color palette */}
      <div className="px-6 py-5 bg-white">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">
          Your Palette
        </div>
        <div className="flex flex-wrap gap-2">
          {displayColors.map((color) => (
            <div key={color.hex} className="group relative">
              <div
                className="w-8 h-8 rounded-full border border-black/10 cursor-default transition-transform group-hover:scale-110"
                style={{ backgroundColor: color.hex }}
                title={`${color.name} ${color.hex}`}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                {color.name}
                <br />
                <span className="font-mono">{color.hex}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avoid section (top match only) */}
      {isTop && season.avoid.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
            Colors to Avoid
          </div>
          <ul className="space-y-1">
            {season.avoid.slice(0, 4).map((a, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2">
                <span className="text-slate-400">–</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
