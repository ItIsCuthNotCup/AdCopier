import { NextRequest, NextResponse } from "next/server";
import { judge, JevError } from "@/lib/jev";
import { buildCandidates, type BrandCard } from "@/lib/templates";
import type { DecodeResult } from "@/lib/psychology";

export async function POST(req: NextRequest) {
  const { decode, brand, creativity = 2, count = 5 } = (await req.json()) as {
    decode: DecodeResult;
    brand: BrandCard;
    creativity?: 1 | 2 | 3 | 4;
    count?: number;
  };
  if (!decode || !brand) {
    return NextResponse.json({ error: "decode result and brand card required" }, { status: 400 });
  }

  const candidates = buildCandidates(decode, brand, creativity);
  const questions: Record<string, unknown> = {};
  candidates.forEach((c, i) => {
    questions[`conv_${c.id}`] = {
      type: "score",
      instructions: `How likely is ad candidate candidates[${i}] to stop the scroll and convert for this brand?`,
      criteria: ["weak", "okay", "strong", "exceptional"],
    };
    questions[`onbrand_${c.id}`] = {
      type: "noul",
      instructions: `Does candidate candidates[${i}] stay on-brand for the given voice ("${brand.voice}") and positioning ("${brand.positioning}")?`,
      criteria: { true: "On-brand", false: "Off-brand" },
    };
  });

  try {
    const res = await judge(
      {
        brand: {
          product: brand.product,
          description: brand.description,
          voice: brand.voice,
          positioning: brand.positioning,
          audience: brand.audience,
          benefits: brand.benefits,
        },
        source_ad_psychology: {
          awareness: decode.awareness.choice,
          hook_type: decode.hookType.choice,
          top_desire: decode.topDesire,
          top_triggers: decode.topTriggers,
          steal_score: decode.stealScore,
        },
        candidates,
      },
      questions as never
    );
    const a = res.answers as Record<string, { score?: number; noul?: number }>;
    const seen = new Set<string>();
    const ranked = candidates
      .map((c) => {
        const s = a[`conv_${c.id}`]?.score ?? 0; // 0..3
        const ob = a[`onbrand_${c.id}`]?.noul ?? 0.5;
        return { ...c, score: s / 3, onBrand: ob, rankScore: (s / 3) * ob };
      })
      .sort((x, y) => y.rankScore - x.rankScore)
      .filter((c) => {
        // top-N must be distinct: skip dupes of already-selected headline/body
        if (seen.has(c.body) || seen.has(c.headline)) return false;
        seen.add(c.body);
        seen.add(c.headline);
        return true;
      })
      .slice(0, Math.max(1, Math.min(20, count)));
    return NextResponse.json({ ads: ranked });
  } catch (err) {
    const msg = err instanceof JevError ? err.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
