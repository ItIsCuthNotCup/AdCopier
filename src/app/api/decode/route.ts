import { NextRequest, NextResponse } from "next/server";
import { judge, JevError } from "@/lib/jev";
import {
  CHECKPOINTS,
  DESIRES,
  DESIRE_LEVELS,
  TRIGGERS,
  adState,
  computeStealScore,
  type AdInput,
  type DecodeResult,
} from "@/lib/psychology";

export async function POST(req: NextRequest) {
  const ad = (await req.json()) as AdInput;
  if (!ad?.headline && !ad?.primary_text) {
    return NextResponse.json({ error: "Provide ad headline or primary text" }, { status: 400 });
  }

  const questions: Record<string, unknown> = {
    awareness: {
      type: "choice",
      instructions:
        "Which customer-awareness stage does this ad target? (Eugene Schwartz awareness levels.)",
      criteria: {
        unaware: "Reader doesn't know they have the problem",
        problem_aware: "Reader knows the pain, not the solution",
        solution_aware: "Reader knows solutions exist, not this product",
        product_aware: "Reader knows the product, isn't convinced",
        most_aware: "Reader knows the product and just needs the offer",
      },
    },
    hookType: {
      type: "choice",
      instructions: "What type of hook does this ad's headline/opening use?",
      criteria: {
        question: "Opens with or is framed as a question",
        bold_claim: "A big confident promise or claim",
        statistic: "Leads with a number, stat, or data point",
        story: "Narrative, personal anecdote, or testimonial framing",
        callout: "Directly names/calls out the target audience",
        contrarian: "Challenges a common belief or takes a contrarian stance",
        how_to: "Promises to teach how to achieve something",
      },
    },
  };

  for (const d of DESIRES) {
    questions[`desire_${d}`] = {
      type: "score",
      instructions: `How strongly does this ad appeal to the core desire for ${d}?`,
      criteria: [...DESIRE_LEVELS],
    };
  }
  for (const c of CHECKPOINTS) {
    questions[`checkpoint_${c.id}`] = {
      type: "noul",
      instructions: `Does this ad satisfy the checkpoint "${c.label}" (${c.desc})?`,
      criteria: { true: "The ad clearly does this", false: "Missing or weak" },
    };
  }
  for (const t of TRIGGERS) {
    questions[`trigger_${t.id}`] = {
      type: "noul",
      instructions: `Does this ad use the psychological trigger "${t.label}"?`,
      criteria: { true: "Trigger is clearly present", false: "Absent" },
    };
  }

  try {
    const res = await judge(adState(ad), questions as never);
    const a = res.answers as Record<string, never> & {
      awareness: { choice: string; probabilities: Record<string, number>; confidence: number };
      hookType: { choice: string; probabilities: Record<string, number>; confidence: number };
    } & Record<string, { noul?: number; score?: number; probabilities?: Record<string, number> }>;

    const desires = Object.fromEntries(
      DESIRES.map((d) => [
        d,
        {
          score: (a[`desire_${d}`] as { score: number }).score,
          probabilities: (a[`desire_${d}`] as { probabilities: Record<string, number> }).probabilities,
        },
      ])
    ) as DecodeResult["desires"];
    const checkpoints = Object.fromEntries(
      CHECKPOINTS.map((c) => [c.id, (a[`checkpoint_${c.id}`] as { noul: number }).noul])
    ) as DecodeResult["checkpoints"];
    const triggers = Object.fromEntries(
      TRIGGERS.map((t) => [t.id, (a[`trigger_${t.id}`] as { noul: number }).noul])
    ) as DecodeResult["triggers"];

    const topTriggers = (Object.entries(triggers) as [keyof typeof triggers, number][])
      .sort((x, y) => y[1] - x[1])
      .slice(0, 5)
      .map(([k]) => k);
    const topDesire = DESIRES.reduce((best, d) =>
      desires[d].score > desires[best].score ? d : best
    );

    const result: DecodeResult = {
      awareness: a.awareness as DecodeResult["awareness"],
      desires,
      checkpoints,
      triggers,
      hookType: a.hookType as DecodeResult["hookType"],
      stealScore: computeStealScore(checkpoints, desires),
      topTriggers,
      topDesire,
    };
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof JevError ? err.message : "Decode failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
