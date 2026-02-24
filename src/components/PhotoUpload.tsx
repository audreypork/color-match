"use client";

import { useState, useRef } from "react";
import type { AnalysisResult } from "@/types/season";

interface PhotoUploadProps {
  onComplete: (result: AnalysisResult) => void;
}

const SLOTS = ["Image 1", "Image 2", "Image 3"];

/** Resize an image file to max 900px on longest side, returns base64 data URL */
async function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 900;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
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
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function PhotoUpload({ onComplete }: PhotoUploadProps) {
  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  async function handleFile(index: number, file: File) {
    if (!file.type.startsWith("image/")) return;
    const resized = await resizeImage(file);
    setImages((prev) => {
      const next = [...prev];
      next[index] = resized;
      return next;
    });
  }

  function handleDrop(index: number, e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(index, file);
  }

  async function handleAnalyse() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Analysis failed");
      }
      const result: AnalysisResult = await res.json();
      onComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const allUploaded = images.every(Boolean);

  return (
    <div className="max-w-xl mx-auto">
      <p className="mono text-xs mb-2" style={{ color: "#888" }}>
        Step 01 / 01
      </p>
      <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--text)" }}>
        Upload three photos of yourself
      </h2>
      <p className="text-sm mb-8" style={{ color: "#666" }}>
        Best results: good natural lighting, no heavy filters. Include your face,
        hair, and ideally your neck/chest area in at least one photo.
      </p>

      {/* Upload slots */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {SLOTS.map((label, i) => (
          <div key={i}>
            <input
              ref={inputRefs[i]}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(i, file);
              }}
            />
            <button
              onClick={() => inputRefs[i].current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(i, e)}
              className="w-full aspect-square flex flex-col items-center justify-center transition-all"
              style={{
                border: "2px dashed",
                borderColor: images[i] ? "var(--border)" : "#ccc",
                borderRadius: 4,
                background: images[i] ? "transparent" : "#fafafa",
                overflow: "hidden",
                position: "relative",
                padding: 0,
              }}
              aria-label={`Upload ${label}`}
            >
              {images[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[i]!}
                  alt={label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 p-3">
                  <span style={{ fontSize: 24 }}>+</span>
                  <span className="mono text-xs text-center" style={{ color: "#aaa" }}>
                    {label}
                  </span>
                </div>
              )}
            </button>
            {images[i] && (
              <button
                onClick={() =>
                  setImages((prev) => {
                    const next = [...prev];
                    next[i] = null;
                    return next;
                  })
                }
                className="mono text-xs mt-1 w-full text-center"
                style={{ color: "#aaa" }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm mb-4 px-3 py-2 rounded" style={{ background: "#fff0f0", color: "#c00", border: "1px solid #fcc" }}>
          {error}
        </p>
      )}

      {/* Analyse button */}
      <button
        onClick={handleAnalyse}
        disabled={!allUploaded || loading}
        className="flex items-center gap-3 px-6 py-3 font-semibold transition-all"
        style={{
          background: allUploaded && !loading ? "var(--accent)" : "#e5e5e5",
          color: allUploaded && !loading ? "var(--text)" : "#aaa",
          borderRadius: 9999,
          border: "2px solid",
          borderColor: allUploaded && !loading ? "var(--border)" : "#ccc",
          cursor: allUploaded && !loading ? "pointer" : "not-allowed",
        }}
      >
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full text-sm"
          style={{
            background: allUploaded && !loading ? "var(--text)" : "#ccc",
            color: allUploaded && !loading ? "var(--accent)" : "#fff",
          }}
        >
          {loading ? "…" : "→"}
        </span>
        {loading ? "Analysing your photos…" : "Analyse my colours"}
      </button>

      {/* Loading segmented bar */}
      {loading && (
        <div className="mt-5">
          <div className="flex gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-2 flex-1 rounded-full"
                style={{
                  background: "var(--accent)",
                  opacity: 0.3 + i * 0.12,
                  animation: `pulse ${0.8 + i * 0.15}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
          <p className="mono text-xs mt-2" style={{ color: "#888" }}>
            Claude is analysing your colouring…
          </p>
        </div>
      )}
    </div>
  );
}
