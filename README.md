# AdCopier

A clone of [StealAds.AI](https://stealads.com): paste a competitor's winning ad,
decode the psychology that makes it work, and generate ready-to-run creative for
your own brand. Dark terminal aesthetic included.

## Setup

```sh
npm i
cp .env.example .env   # set TYPESAFE_API_KEY=<your key>
npm run dev            # http://localhost:3000
```

## Architecture: Jev is a judgment model, not a generator

The AI backend is **TypeSafe Jev** (`@typesafe-ai/sdk` v0.6.0,
`POST https://api.typesafe.ai/v1/systemone`, model `jev-latest`). Jev returns
typed judgments — `noul` (P(yes)), `choice` (option + probabilities +
confidence), `score` (weighted position on ordered levels). It does **not**
generate text or images. So all "generation" is code:

- **Decode** (`/api/decode`): one fan-out Jev request judges awareness level
  (choice), 4 core desires (score), 6 checkpoints (noul), 16 triggers (noul),
  and hook type (choice). The "steal score" is computed in code
  (`STEAL_SCORE_WEIGHTS` in `src/lib/psychology.ts`).
- **Brand agent** (`/api/brand`): the server fetches your URL, strips HTML, and
  splits it into candidate sentences. Jev then *selects instead of generates* —
  a noul per candidate picks the top 3 real benefits — plus choices for voice,
  positioning, audience, and palette.
- **Generate** (`/api/generate`): ~24 candidate ads are built deterministically
  from hook/body/CTA templates (`src/lib/templates.ts`), then ONE Jev request
  scores each candidate for conversion and on-brand-ness; code ranks by
  `score × onBrand`.
- **Refine** (`/api/refine`): deterministic transforms produce ~8 variants and
  Jev picks the one that best satisfies your edit request.

The API key stays server-side in `src/lib/jev.ts`; the client only talks to
`src/app/api/*` routes.

## Stack

Next.js 15+ (App Router, TypeScript, Tailwind v4), React 19, `html-to-image`
for PNG downloads.
