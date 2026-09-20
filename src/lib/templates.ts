import type { Awareness, HookType, TriggerId, DecodeResult } from "./psychology";

export type BrandCard = {
  url: string;
  product: string;
  description: string;
  voice: "playful" | "authoritative" | "minimal" | "urgent" | "warm";
  positioning: "premium" | "value" | "innovative" | "trusted" | "rebellious";
  audience:
    | "consumers"
    | "small_business"
    | "enterprise"
    | "creators"
    | "fitness_health"
    | "other";
  benefits: string[];
  palette: string; // palette id
};

// Hook templates keyed by hook type. Placeholders: {product} {benefit} {audience} {brand} {number}
export const HOOK_TEMPLATES: Record<HookType, string[]> = {
  question: [
    "Still paying for {benefit} the hard way?",
    "What if {product} could give you {benefit} in days, not months?",
    "Why are {audience} switching to {product}?",
    "Tired of {audience} problems that never end?",
    "What would {benefit} be worth to you?",
    "Is your current routine costing you {benefit}?",
  ],
  bold_claim: [
    "{product}: {benefit}, guaranteed.",
    "The fastest way to {benefit}. Period.",
    "{benefit} — without the usual nonsense.",
    "We built {product} so you never worry about this again.",
    "{benefit}. That's the whole pitch.",
    "Stop settling. {product} delivers {benefit}.",
  ],
  statistic: [
    "{number}% of {audience} saw {benefit} in week one.",
    "{number} {audience} already made the switch to {product}.",
    "Rated {number}/5 for one reason: {benefit}.",
    "{number}x faster to {benefit} — here's the proof.",
    "In {number} days, {benefit}. We measured it.",
    "{number}% fewer regrets. {number}% more {benefit}.",
  ],
  story: [
    "I tried everything before {product}. Then {benefit} happened.",
    "Day {number} with {product}: {benefit}. I'm not going back.",
    "She almost quit. Then {product} delivered {benefit}.",
    "6 months ago I laughed at {product}. Today I tell everyone.",
    "The morning {benefit} finally clicked — thanks to {product}.",
    "From skeptic to evangelist in {number} days. {product} works.",
  ],
  callout: [
    "{audience}: this is your sign to try {product}.",
    "Hey {audience} — {benefit} is finally here.",
    "If you're {audience}, stop scrolling. {product} was built for you.",
    "{audience} only: {benefit} starts today.",
    "Attention {audience}: {product} just changed the game.",
    "This one's for the {audience} who want {benefit}.",
  ],
  contrarian: [
    "Everyone's wrong about {benefit}. Here's why.",
    "Unpopular opinion: {product} beats the big names.",
    "The {benefit} 'experts' won't tell you this.",
    "Forget everything you know about {benefit}.",
    "{product} shouldn't work this well. But it does.",
    "Hot take: you don't need more effort. You need {product}.",
  ],
  how_to: [
    "How to get {benefit} without burning out.",
    "The {number}-step path to {benefit} (steal this).",
    "How {audience} get {benefit} with {product}.",
    "How to {benefit} in {number} minutes a day.",
    "The simple system behind {benefit}: {product}.",
    "How {product} turned {benefit} into a checklist.",
  ],
};

// Body templates keyed by awareness level.
export const BODY_TEMPLATES: Record<Awareness, string[]> = {
  unaware: [
    "Most {audience} don't realize there's a better way. {product} quietly delivers {benefit} — no hype, just results. {brand} is changing the rules.",
    "You might not even know you're missing {benefit}. Once you see what {product} does, there's no unseeing it.",
    "Something is quietly eating your results. {product} fixes it — and gives you {benefit} on top.",
  ],
  problem_aware: [
    "You already know the problem. {product} is the fix: {benefit}, built for {audience} who are done messing around.",
    "That frustration you keep hitting? {product} removes it and hands you {benefit} instead.",
    "The pain is real. So is the solution — {product} by {brand}, engineered for {benefit}.",
  ],
  solution_aware: [
    "There are plenty of options. {product} is the one {audience} keep coming back to — because {benefit} actually shows up.",
    "You've compared the alternatives. {product} wins on {benefit}, and it's not close.",
    "Solutions aren't scarce. Working ones are. {product}: {benefit}, proven for {audience}.",
  ],
  product_aware: [
    "You've seen {product}. Here's the nudge: {benefit}, trusted by {audience}, ready when you are.",
    "Still thinking about {product}? {benefit} is waiting — join {number}+ {audience} who already did.",
    "{product} isn't going anywhere — but {benefit} could be yours today.",
  ],
  most_aware: [
    "You know what {product} does. Now's the time: {benefit} plus our best offer for {audience}.",
    "Last call energy: {benefit} with {product}. {audience} who wait, regret it.",
    "{product} — {benefit}. You already know. Hit the button.",
  ],
};

// CTA templates keyed by positioning.
export const CTA_TEMPLATES: Record<BrandCard["positioning"], string[]> = {
  premium: ["Experience the difference", "Elevate now", "Claim your access"],
  value: ["Start saving today", "Try it free", "Get the deal"],
  innovative: ["See it in action", "Try the future", "Get early access"],
  trusted: ["Join thousands today", "Start risk-free", "Get started now"],
  rebellious: ["Break the rules", "Join the movement", "Ditch the old way"],
};

// Fill placeholders.
export function fill(
  template: string,
  vars: { product: string; benefit: string; audience: string; brand: string; number: string }
) {
  return template
    .replaceAll("{product}", vars.product)
    .replaceAll("{benefit}", vars.benefit)
    .replaceAll("{audience}", vars.audience)
    .replaceAll("{brand}", vars.brand)
    .replaceAll("{number}", vars.number);
}

const NUMBERS = ["3", "5", "7", "10", "14", "21", "30", "87", "92", "97", "10,000", "500"];

export type Candidate = { id: string; headline: string; body: string; cta: string };

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Build ~24 candidate ads deterministically. creativity 1-4 controls how far
// we drift from the stolen ad's psychology.
export function buildCandidates(
  decode: DecodeResult,
  brand: BrandCard,
  creativity: 1 | 2 | 3 | 4
): Candidate[] {
  const short = (s?: string) => {
    const t = (s || "real results").split(/[.!?,;:—]/)[0].trim();
    return t.length > 60 ? t.slice(0, 57).trimEnd() + "…" : t;
  };
  const benefit = short(brand.benefits[0]);
  const benefit2 = short(brand.benefits[1]) || benefit;
  const vars = (n: string, b: string) => ({
    product: brand.product || "this product",
    benefit: b,
    audience: brand.audience.replaceAll("_", " "),
    brand: brand.product || "the brand",
    number: n,
  });

  const sourceHook = decode.hookType.choice;
  const sourceAwareness = decode.awareness.choice;
  const allHooks = Object.keys(HOOK_TEMPLATES) as HookType[];
  const allAware = Object.keys(BODY_TEMPLATES) as Awareness[];
  const seed = hash(brand.product + decode.stealScore);

  let hooks: HookType[];
  let awares: Awareness[];
  if (creativity === 1) {
    hooks = [sourceHook];
    awares = [sourceAwareness];
  } else if (creativity === 2) {
    hooks = allHooks;
    awares = [sourceAwareness];
  } else if (creativity === 3) {
    hooks = allHooks;
    awares = allAware;
  } else {
    hooks = allHooks;
    awares = allAware;
  }

  // Triggers to lean on: source's top triggers at low creativity, mixed at high.
  const triggerPool: TriggerId[] =
    creativity <= 2
      ? decode.topTriggers.slice(0, 4)
      : (["urgency", "social_proof", "curiosity", "specificity", "storytelling", "guarantee"] as TriggerId[]);

  const candidates: Candidate[] = [];
  let i = 0;
  outer: for (const hook of hooks) {
    for (const aw of awares) {
      const hTpls = HOOK_TEMPLATES[hook];
      const bTpls = BODY_TEMPLATES[aw];
      const cTpls = CTA_TEMPLATES[brand.positioning];
      const trig = triggerPool[i % triggerPool.length];
      const num = NUMBERS[(seed + i) % NUMBERS.length];
      const b = i % 3 === 2 ? benefit2 : benefit;
      const v = vars(num, b);
      let headline = fill(pick(hTpls, seed + i), v);
      // Trigger-flavor the headline for a subset of candidates.
      if (trig === "urgency" && !/today|now/i.test(headline)) headline += " — today only";
      if (trig === "specificity" && !/\d/.test(headline))
        headline = `${num} reasons: ` + headline.charAt(0).toLowerCase() + headline.slice(1);
      if (trig === "fomo" && !/miss|left|gone/i.test(headline)) headline += " (before it's gone)";
      if (trig === "guarantee" && !/guarantee|risk/i.test(headline)) headline += " — risk-free";
      const body = fill(pick(bTpls, seed + i * 3), v);
      const cta = pick(cTpls, seed + i * 5);
      candidates.push({ id: `c${i}`, headline, body, cta });
      i++;
      if (i >= 24) break outer;
    }
  }
  return candidates;
}

// Deterministic refinement transforms — Jev picks which satisfies the request.
export function refineVariants(
  ad: Candidate,
  brand: BrandCard
): { label: string; ad: Candidate }[] {
  const h = ad.headline;
  const benefit = brand.benefits[0] || "real results";
  const benefit2 = brand.benefits[1] || benefit;
  return [
    {
      label: "shorter",
      ad: { ...ad, id: ad.id + "_r1", headline: h.split(/[—,.]/)[0].trim(), body: ad.body.split(".")[0] + "." },
    },
    {
      label: "add number",
      ad: { ...ad, id: ad.id + "_r2", headline: /\d/.test(h) ? h : `${h} (${Math.floor(Math.random() * 60) + 30}% faster)` },
    },
    {
      label: "add urgency",
      ad: { ...ad, id: ad.id + "_r3", headline: `${h} — ends soon`, cta: "Act now" },
    },
    {
      label: "question form",
      ad: { ...ad, id: ad.id + "_r4", headline: h.endsWith("?") ? h : `What if ${h.charAt(0).toLowerCase() + h.slice(1)}?` },
    },
    {
      label: "swap benefit",
      ad: { ...ad, id: ad.id + "_r5", headline: h.replaceAll(benefit, benefit2), body: ad.body.replaceAll(benefit, benefit2) },
    },
    {
      label: "more casual",
      ad: { ...ad, id: ad.id + "_r6", headline: `Real talk: ${h.charAt(0).toLowerCase() + h.slice(1)}`, body: `No fluff. ${ad.body}` },
    },
    {
      label: "more formal",
      ad: { ...ad, id: ad.id + "_r7", headline: h.replaceAll("!", "."), cta: "Learn more" },
    },
    {
      label: "add guarantee",
      ad: { ...ad, id: ad.id + "_r8", headline: `${h} — guaranteed`, body: `${ad.body} 30-day money-back guarantee.` },
    },
  ];
}

// Palettes for the creative card, selected by Jev choice keyed on positioning.
export const PALETTES = {
  lime_terminal: { bg: "#0a0f0a", accent: "#b8ff29", text: "#e8ffe8", label: "Terminal Lime" },
  magenta_neon: { bg: "#12060f", accent: "#ff2fb9", text: "#ffe4f5", label: "Neon Magenta" },
  ice_blue: { bg: "#050b14", accent: "#38c8ff", text: "#e2f6ff", label: "Ice Blue" },
  gold_luxe: { bg: "#0d0a05", accent: "#f5c542", text: "#fff4d6", label: "Gold Luxe" },
  crimson_edge: { bg: "#120505", accent: "#ff3b3b", text: "#ffe2e2", label: "Crimson Edge" },
  violet_deep: { bg: "#0a0614", accent: "#9d6bff", text: "#efe8ff", label: "Deep Violet" },
} as const;
export type PaletteId = keyof typeof PALETTES;
export const PALETTE_IDS = Object.keys(PALETTES) as PaletteId[];
