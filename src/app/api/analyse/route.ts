import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult } from "@/types/season";

const client = new Anthropic();

const SEASON_KEYS = [
  "light_spring", "true_spring", "bright_spring",
  "light_summer", "true_summer", "soft_summer",
  "soft_autumn", "true_autumn", "dark_autumn",
  "dark_winter", "true_winter", "bright_winter",
];

const PROMPT = `You are an expert in the 12-season colour analysis system used in personal colour analysis.

Analyse the ${3} photos of the same person and determine their colour season.

The 12 season keys are:
- Spring (warm undertone, clear): light_spring, true_spring, bright_spring
- Summer (cool undertone, muted): light_summer, true_summer, soft_summer
- Autumn (warm undertone, muted): soft_autumn, true_autumn, dark_autumn
- Winter (cool undertone, clear): dark_winter, true_winter, bright_winter

Assess the person's:
1. Skin undertone — warm (golden/peachy/olive), cool (pink/rosy/bluish), neutral-warm, or neutral-cool
2. Value — overall lightness: light, medium, or dark
3. Chroma — colour intensity: bright (vivid/clear), medium, or muted (soft/dusty)
4. Hair and eye colour as supporting context

Respond with ONLY valid JSON, no markdown, no explanation outside the JSON:
{
  "season": "<one of the 12 season keys above>",
  "confidence": <integer 0-100>,
  "undertone": "<warm|cool|neutral-warm|neutral-cool>",
  "value": "<light|medium|dark>",
  "chroma": "<bright|medium|muted>",
  "reasoning": "<2-3 sentences explaining your analysis>"
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set" },
      { status: 500 }
    );
  }

  let images: string[];
  try {
    const body = await req.json();
    images = body.images;
    if (!Array.isArray(images) || images.length !== 3) {
      return NextResponse.json(
        { error: "Expected exactly 3 images" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Build image content blocks from base64 data URLs
  const imageBlocks = images.map((dataUrl) => {
    const [header, data] = dataUrl.split(",");
    const mediaType = header.match(/data:(image\/\w+);base64/)?.[1] as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/gif"
      | undefined;

    return {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: mediaType ?? "image/jpeg",
        data,
      },
    };
  });

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response (Claude sometimes wraps in backticks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse Claude response" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as AnalysisResult;

    // Validate season key
    if (!SEASON_KEYS.includes(parsed.season)) {
      return NextResponse.json({ error: "Invalid season returned" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
