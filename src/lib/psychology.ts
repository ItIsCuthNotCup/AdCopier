// Psychological framework: 4 core desires, 6 checkpoints, 16 triggers,
// awareness levels and hook types — all judged by Jev in a single request.

export const AWARENESS_LEVELS = [
  "unaware",
  "problem_aware",
  "solution_aware",
  "product_aware",
  "most_aware",
] as const;
export type Awareness = (typeof AWARENESS_LEVELS)[number];

export const DESIRES = ["status", "security", "belonging", "pleasure"] as const;
export type Desire = (typeof DESIRES)[number];

export const DESIRE_LABELS: Record<Desire, string> = {
  status: "Status",
  security: "Security",
  belonging: "Belonging",
  pleasure: "Pleasure / Indulgence",
};

export const DESIRE_LEVELS = ["absent", "hinted", "present", "dominant"] as const;

export const CHECKPOINTS = [
  { id: "stops_scroll", label: "Stops the scroll", desc: "Pattern interrupt" },
  { id: "clear_audience", label: "Clear who it's for", desc: "Obvious target" },
  { id: "names_pain", label: "Names a specific pain/desire", desc: "Concrete" },
  { id: "proof", label: "Concrete believable proof", desc: "Evidence" },
  { id: "single_cta", label: "Single clear CTA", desc: "One action" },
  { id: "low_friction", label: "Low-friction next step", desc: "Easy yes" },
] as const;
export type CheckpointId = (typeof CHECKPOINTS)[number]["id"];

export const TRIGGERS = [
  { id: "urgency", label: "Urgency" },
  { id: "scarcity", label: "Scarcity" },
  { id: "social_proof", label: "Social proof" },
  { id: "authority", label: "Authority" },
  { id: "curiosity", label: "Curiosity" },
  { id: "fomo", label: "Fear of missing out" },
  { id: "loss_aversion", label: "Loss aversion" },
  { id: "novelty", label: "Novelty" },
  { id: "reciprocity", label: "Reciprocity" },
  { id: "specificity", label: "Specificity (numbers)" },
  { id: "contrast", label: "Contrast / before-after" },
  { id: "identity", label: "Identity / tribe" },
  { id: "simplicity", label: "Simplicity" },
  { id: "guarantee", label: "Guarantee / risk reversal" },
  { id: "anchoring", label: "Anchoring / price" },
  { id: "storytelling", label: "Storytelling" },
] as const;
export type TriggerId = (typeof TRIGGERS)[number]["id"];

export const HOOK_TYPES = [
  "question",
  "bold_claim",
  "statistic",
  "story",
  "callout",
  "contrarian",
  "how_to",
] as const;
export type HookType = (typeof HOOK_TYPES)[number];

// Steal score = 70% mean checkpoint pass-rate + 30% strongest desire (0-4 normalized).
export const STEAL_SCORE_WEIGHTS = {
  checkpoints: 0.7,
  topDesire: 0.3,
} as const;

export type AdInput = {
  headline: string;
  primary_text: string;
  cta: string;
  brand?: string;
};

export type DecodeResult = {
  awareness: { choice: Awareness; probabilities: Record<string, number>; confidence: number };
  desires: Record<Desire, { score: number; probabilities: Record<string, number> }>;
  checkpoints: Record<CheckpointId, number>;
  triggers: Record<TriggerId, number>;
  hookType: { choice: HookType; probabilities: Record<string, number>; confidence: number };
  stealScore: number; // 0-100
  topTriggers: TriggerId[];
  topDesire: Desire;
};

export function adState(ad: AdInput) {
  return {
    ad: {
      headline: ad.headline,
      primary_text: ad.primary_text,
      cta: ad.cta,
      brand: ad.brand || null,
    },
  };
}

export function computeStealScore(
  checkpoints: Record<CheckpointId, number>,
  desires: Record<Desire, { score: number }>
) {
  const cpMean =
    CHECKPOINTS.reduce((s, c) => s + checkpoints[c.id], 0) / CHECKPOINTS.length;
  const topDesireScore = Math.max(...DESIRES.map((d) => desires[d].score));
  const raw =
    STEAL_SCORE_WEIGHTS.checkpoints * cpMean +
    STEAL_SCORE_WEIGHTS.topDesire * (topDesireScore / 3);
  return Math.round(raw * 100);
}
