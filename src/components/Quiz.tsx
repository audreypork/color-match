"use client";

import { useState } from "react";
import type { QuizAnswers, Undertone, Value, Chroma } from "@/types/season";

interface QuizProps {
  onComplete: (answers: QuizAnswers) => void;
}

type Step = 0 | 1 | 2;

const STEPS = [
  {
    id: "undertone",
    question: "What is your skin undertone?",
    hint: "Check the veins on your wrist — blue/purple = cool, green = warm, blue-green = neutral.",
    options: [
      {
        value: "warm" as Undertone,
        label: "Warm",
        description: "Golden, peachy, or olive. Veins look green.",
        swatch: "#e8b87a",
      },
      {
        value: "cool" as Undertone,
        label: "Cool",
        description: "Pink, rosy, or bluish. Veins look blue or purple.",
        swatch: "#c9a8c5",
      },
      {
        value: "neutral-warm" as Undertone,
        label: "Neutral-Warm",
        description: "Neutral with a warm lean. Veins look blue-green.",
        swatch: "#d4b896",
      },
      {
        value: "neutral-cool" as Undertone,
        label: "Neutral-Cool",
        description: "Neutral with a cool lean. Veins look blue-green.",
        swatch: "#b8c4d4",
      },
    ],
  },
  {
    id: "value",
    question: "How light or dark is your overall colouring?",
    hint: "Consider hair, eyes, and skin together.",
    options: [
      {
        value: "light" as Value,
        label: "Light",
        description: "Light skin, light or medium hair, light eyes.",
        swatch: "#f5e6d0",
      },
      {
        value: "medium" as Value,
        label: "Medium",
        description: "Medium skin, medium hair, medium to dark eyes.",
        swatch: "#c49a6c",
      },
      {
        value: "dark" as Value,
        label: "Dark",
        description: "Deep skin, dark hair, dark eyes.",
        swatch: "#6b3a2a",
      },
    ],
  },
  {
    id: "chroma",
    question: "How vivid or soft is your colouring?",
    hint: "Bright = vivid and clear; muted = soft and dusty; medium = in between.",
    options: [
      {
        value: "bright" as Chroma,
        label: "Bright / Clear",
        description: "Vivid, high-contrast features — bright eyes, defined lips.",
        swatch: "#ff4f4f",
      },
      {
        value: "medium" as Chroma,
        label: "Medium",
        description: "Neither especially vivid nor especially soft.",
        swatch: "#8a8a8a",
      },
      {
        value: "muted" as Chroma,
        label: "Muted / Soft",
        description: "Soft, blended, dusty — no vivid contrast.",
        swatch: "#a09080",
      },
    ],
  },
];

// Segmented progress bar: 6 segments total, fill proportionally
function SegmentedBar({ step }: { step: Step }) {
  const filled = [2, 4, 6][step];
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-2 flex-1 rounded-full transition-colors duration-300"
          style={{
            background: i < filled ? "var(--accent)" : "transparent",
            border: i < filled ? "none" : "2px solid #ccc",
          }}
        />
      ))}
    </div>
  );
}

export default function Quiz({ onComplete }: QuizProps) {
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    undertone: null,
    value: null,
    chroma: null,
  });

  const currentStep = STEPS[step];

  function handleSelect(value: Undertone | Value | Chroma) {
    const key = currentStep.id as keyof QuizAnswers;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (step < 2) {
      setTimeout(() => setStep((step + 1) as Step), 250);
    } else {
      setTimeout(() => onComplete(newAnswers), 250);
    }
  }

  const currentAnswer = answers[currentStep.id as keyof QuizAnswers];

  return (
    <div className="max-w-xl mx-auto">
      <SegmentedBar step={step} />

      <p className="mono text-xs mb-3" style={{ color: "#888" }}>
        Step 0{step + 1} / 03
      </p>
      <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--text)" }}>
        {currentStep.question}
      </h2>
      <p className="text-sm mb-8" style={{ color: "#666" }}>
        {currentStep.hint}
      </p>

      <div className="grid gap-3">
        {currentStep.options.map((opt) => {
          const isSelected = currentAnswer === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="flex items-center gap-4 p-4 text-left transition-all duration-150"
              style={{
                border: "2px solid var(--border)",
                borderRadius: 4,
                background: isSelected ? "var(--accent)" : "white",
                boxShadow: isSelected ? "3px 3px 0 var(--border)" : "none",
                transform: isSelected ? "translate(-1px, -1px)" : "none",
              }}
            >
              <span
                className="w-8 h-8 rounded-full shrink-0"
                style={{
                  backgroundColor: opt.swatch,
                  border: "1.5px solid rgba(0,0,0,0.15)",
                }}
              />
              <div>
                <div className="font-semibold" style={{ color: "var(--text)" }}>
                  {opt.label}
                </div>
                <div className="text-sm" style={{ color: isSelected ? "#444" : "#666" }}>
                  {opt.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
