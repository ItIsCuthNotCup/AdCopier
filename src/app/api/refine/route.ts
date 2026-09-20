import { NextRequest, NextResponse } from "next/server";
import { judge, JevError } from "@/lib/jev";
import { refineVariants, type BrandCard, type Candidate } from "@/lib/templates";

export async function POST(req: NextRequest) {
  const { ad, request, brand } = (await req.json()) as {
    ad: Candidate;
    request: string;
    brand?: BrandCard;
  };
  if (!ad || !request?.trim()) {
    return NextResponse.json({ error: "ad and request required" }, { status: 400 });
  }

  const variants = refineVariants(ad, brand || ({} as BrandCard));
  const questions: Record<string, unknown> = {};
  variants.forEach((v, i) => {
    questions[`sat_${i}`] = {
      type: "noul",
      instructions: `The user asked: "${request}". Does variant variants[${i}].ad satisfy this edit request while remaining a coherent ad?`,
      criteria: { true: "Satisfies the request", false: "Does not satisfy it" },
    };
  });

  try {
    const res = await judge(
      { original: ad, request, variants: variants.map((v) => ({ label: v.label, ad: v.ad })) },
      questions as never
    );
    const a = res.answers as Record<string, { noul: number }>;
    const best = variants
      .map((v, i) => ({ v, p: a[`sat_${i}`]?.noul ?? 0 }))
      .sort((x, y) => y.p - x.p)[0];
    return NextResponse.json({
      ad: best.v.ad,
      applied: best.v.label,
      confidence: best.p,
    });
  } catch (err) {
    const msg = err instanceof JevError ? err.message : "Refine failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
