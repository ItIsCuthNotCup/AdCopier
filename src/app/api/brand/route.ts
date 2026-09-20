import { NextRequest, NextResponse } from "next/server";
import { judge, JevError } from "@/lib/jev";
import { fetchBrandPage } from "@/lib/brandFetch";
import { PALETTES, PALETTE_IDS, type BrandCard, type PaletteId } from "@/lib/templates";

export async function POST(req: NextRequest) {
  const { url, product, description } = (await req.json()) as {
    url?: string;
    product?: string;
    description?: string;
  };
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  let page;
  try {
    page = await fetchBrandPage(url);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch URL" },
      { status: 502 }
    );
  }

  const questions: Record<string, unknown> = {
    voice: {
      type: "choice",
      instructions: "What is the brand's tone of voice?",
      criteria: {
        playful: "Fun, casual, jokey",
        authoritative: "Expert, confident, formal",
        minimal: "Sparse, understated",
        urgent: "Hype, FOMO, high-energy",
        warm: "Friendly, caring, human",
      },
    },
    positioning: {
      type: "choice",
      instructions: "How does this brand position itself in the market?",
      criteria: {
        premium: "Luxury, high-end, quality-first",
        value: "Affordable, best bang for buck",
        innovative: "New tech, category-defining",
        trusted: "Reliable, proven, safe choice",
        rebellious: "Challenger, anti-establishment",
      },
    },
    audience: {
      type: "choice",
      instructions: "Who is this brand's primary target audience?",
      criteria: {
        consumers: "General consumers / DTC shoppers",
        small_business: "SMBs and founders",
        enterprise: "Large companies, IT buyers",
        creators: "Content creators, influencers",
        fitness_health: "Fitness & health audience",
        other: "None of the above fit",
      },
    },
  };
  page.sentences.forEach((s, i) => {
    questions[`benefit_${i}`] = {
      type: "noul",
      instructions: `Is candidate sentence sentences[${i}] a concrete customer benefit or value proposition (not nav text, legal, or filler)?`,
      criteria: { true: "Concrete benefit/value prop", false: "Not a benefit" },
    };
  });

  try {
    const res = await judge(
      {
        url: page.url,
        product: product || page.title,
        description: description || null,
        title: page.title,
        meta_description: page.metaDescription,
        headings: page.headings,
        text_excerpt: page.text,
        sentences: page.sentences,
      },
      questions as never
    );
    const a = res.answers as Record<
      string,
      { choice?: string; noul?: number; confidence?: number }
    >;

    const benefits = page.sentences
      .map((s, i) => ({ s, p: a[`benefit_${i}`]?.noul ?? 0 }))
      .sort((x, y) => y.p - x.p)
      .slice(0, 3)
      .map((x) => x.s);

    const positioning = (a.positioning.choice || "trusted") as BrandCard["positioning"];
    // Palette is a deterministic-by-positioning pick with a Jev choice among palettes.
    const paletteRes = await judge(
      { positioning, voice: a.voice.choice },
      {
        palette: {
          type: "choice",
          instructions: `Pick the ad creative color palette that best fits this ${positioning}, ${a.voice.choice} brand.`,
          criteria: Object.fromEntries(
            PALETTE_IDS.map((id) => [id, PALETTES[id].label])
          ),
        },
      } as never
    );
    const palette = (paletteRes.answers as { palette: { choice: string } }).palette
      .choice as PaletteId;

    const card: BrandCard = {
      url: page.url,
      product: product || page.title || "the product",
      description: description || page.metaDescription || "",
      voice: (a.voice.choice || "authoritative") as BrandCard["voice"],
      positioning,
      audience: (a.audience.choice || "consumers") as BrandCard["audience"],
      benefits,
      palette,
    };
    return NextResponse.json({ card, extracted: { title: page.title, sentences: page.sentences } });
  } catch (err) {
    const msg = err instanceof JevError ? err.message : "Brand analysis failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
