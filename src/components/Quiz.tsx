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
    hint: "Look at the veins on your wrist. Blue/purple = cool; green = warm; blue-green = neutral.",
    options: [
      {
        value: "warm" as Undertone,
        label: "Warm",
        description: "Golden, peachy, or olive skin. Veins look green.",
        swatch: "#e8b87a",
      },
      {
        value: "cool" as Undertone,
        label: "Cool",
        description: "Pink, rosy, or bluish skin. Veins look blue or purple.",
        swatch: "#c9a8c5",
      },
      {
        value: "neutral-warm" as Undertone,
        label: "Neutral-Warm",
        description: "Mostly neutral with a warm lean. Veins look blue-green.",
        swatch: "#d4b896",
      },
      {
        value: "neutral-cool" as Undertone,
        label: "Neutral-Cool",
        description: "Mostly neutral with a cool lean. Veins look blue-green.",
        swatch: "#b8c4d4",
      },
    ],
  },
  {
    id: "value",
    question: "What is your overall coloring value?",
    hint: "Consider your hair, eyes, and skin together. Are they light, medium, or dark?",
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
        description: "Medium skin tone, medium hair, medium to dark eyes.",
        swatch: "#c49a6c",
      },
      {
        value: "dark" as Value,
        label: "Dark",
        description: "Deep skin, dark hair, dark eyes — high overall contrast.",
        swatch: "#6b3a2a",
      },
    ],
  },
  {
    id: "chroma",
    question: "How would you describe your coloring's intensity?",
    hint: "Bright means vivid and clear; muted means soft and dusty; medium is in between.",
    options: [
      {
        value: "bright" as Chroma,
        label: "Bright / Clear",
        description:
          "Features are vivid and high-contrast — bright eyes, defined lips.",
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
        description:
          "Features are soft, blended, dusty — no high contrast or vivid colors.",
        swatch: "#a09080",
      },
    ],
  },
];

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
      setTimeout(() => setStep((step + 1) as Step), 300);
    } else {
      setTimeout(() => onComplete(newAnswers), 300);
    }
  }

  const currentAnswer = answers[currentStep.id as keyof QuizAnswers];

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? "bg-slate-700" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
        Step {step + 1} of 3
      </p>
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">
        {currentStep.question}
      </h2>
      <p className="text-sm text-slate-500 mb-8">{currentStep.hint}</p>

      <div className="grid gap-3">
        {currentStep.options.map((opt) => {
          const isSelected = currentAnswer === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                isSelected
                  ? "border-slate-700 bg-slate-50"
                  : "border-slate-200 hover:border-slate-400 bg-white"
              }`}
            >
              <span
                className="w-8 h-8 rounded-full shrink-0 border border-black/10"
                style={{ backgroundColor: opt.swatch }}
              />
              <div>
                <div className="font-medium text-slate-800">{opt.label}</div>
                <div className="text-sm text-slate-500">{opt.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
