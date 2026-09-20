"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import {
  CHECKPOINTS,
  DESIRES,
  DESIRE_LABELS,
  DESIRE_LEVELS,
  TRIGGERS,
  type AdInput,
  type DecodeResult,
} from "@/lib/psychology";
import { PALETTES, type BrandCard, type Candidate, type PaletteId } from "@/lib/templates";

const labelCls = "font-mono text-[#b8ff29] text-sm tracking-widest uppercase";
const inputCls =
  "w-full bg-[#0a120a] border border-[#1c2a10] text-[#d9ffd9] font-mono text-sm px-3 py-2 focus:border-[#b8ff29] outline-none";
const btnCls =
  "font-mono bg-[#b8ff29] text-black px-6 py-3 font-bold hover:bg-[#d4ff5e] disabled:opacity-40 disabled:cursor-not-allowed";

const PRESETS: { name: string; ad: AdInput }[] = [
  {
    name: "DTC SKINCARE",
    ad: {
      headline: "The 3-minute ritual 50,000 women swear by",
      primary_text:
        "Dry, dull skin? Our peptide serum visibly smooths fine lines in 14 days — or your money back. Dermatologist-tested, fragrance-free, and loved by 50,000+ customers.",
      cta: "Shop Now",
      brand: "GlowLab",
    },
  },
  {
    name: "SAAS",
    ad: {
      headline: "Your team is losing 8 hours a week to status meetings",
      primary_text:
        "Async updates replace standups. Teams on PulseBoard ship 23% faster. Free for teams under 10 — set up in 60 seconds.",
      cta: "Start Free Trial",
      brand: "PulseBoard",
    },
  },
  {
    name: "FITNESS APP",
    ad: {
      headline: "Why are 10,000 runners ditching their gym memberships?",
      primary_text:
        "StrideAI builds a plan around your life — 20-minute adaptive workouts, real coach feedback, zero equipment. Join before Sunday and get your first month free.",
      cta: "Claim Free Month",
      brand: "StrideAI",
    },
  },
];

type GenAd = Candidate & { score: number; onBrand: number; rankScore: number };

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Step 1
  const [ad, setAd] = useState<AdInput>({ headline: "", primary_text: "", cta: "", brand: "" });
  const [libUrl, setLibUrl] = useState("");

  // Step 2
  const [decode, setDecode] = useState<DecodeResult | null>(null);

  // Step 3
  const [brandUrl, setBrandUrl] = useState("");
  const [product, setProduct] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [brand, setBrand] = useState<BrandCard | null>(null);
  const [creativity, setCreativity] = useState<1 | 2 | 3 | 4>(2);
  const [bulk, setBulk] = useState(false);
  const [count, setCount] = useState(5);
  const [ads, setAds] = useState<GenAd[]>([]);

  async function post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data as T;
  }

  async function runDecode() {
    setBusy(true);
    setError("");
    try {
      const d = await post<DecodeResult>("/api/decode", { ...ad, library_url: libUrl || undefined });
      setDecode(d);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "decode failed");
    } finally {
      setBusy(false);
    }
  }

  async function runBrand() {
    setBusy(true);
    setError("");
    try {
      const r = await post<{ card: BrandCard }>("/api/brand", {
        url: brandUrl,
        product,
        description: prodDesc,
      });
      setBrand(r.card);
    } catch (e) {
      setError(e instanceof Error ? e.message : "brand fetch failed");
    } finally {
      setBusy(false);
    }
  }

  async function runGenerate() {
    if (!decode || !brand) return;
    setBusy(true);
    setError("");
    setAds([]);
    try {
      const r = await post<{ ads: GenAd[] }>("/api/generate", {
        decode,
        brand,
        creativity,
        count: bulk ? count : count || 5,
      });
      setAds(r.ads);
    } catch (e) {
      setError(e instanceof Error ? e.message : "generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-6 md:px-12 py-8 max-w-6xl mx-auto">
      <nav className="flex items-center justify-between border-b border-[#1c2a10] pb-4">
        <Link href="/" className="font-mono font-bold text-xl text-[#b8ff29]">
          ADCOPIER_
        </Link>
        <span className="font-mono text-xs text-[#5f8a1e]">STEP {step}/3</span>
      </nav>

      {error && (
        <p className="mt-4 font-mono text-sm text-red-500">
          &gt;&gt; ERROR: {error}
        </p>
      )}

      {/* ============ STEP 1 ============ */}
      {step === 1 && (
        <section className="mt-10">
          <p className={labelCls}>&gt;&gt;&gt; STEP 1 — STEAL AN AD</p>
          <h1 className="text-3xl md:text-5xl font-black uppercase mt-4 text-white">
            Paste a winning ad.
          </h1>
          <div className="mt-6 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setAd(p.ad)}
                className="font-mono text-xs border border-[#1c2a10] text-[#9fc98a] px-3 py-1 hover:border-[#b8ff29] hover:text-[#b8ff29]"
              >
                [{p.name}]
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-4 max-w-2xl">
            <input className={inputCls} placeholder="HEADLINE" value={ad.headline}
              onChange={(e) => setAd({ ...ad, headline: e.target.value })} />
            <textarea className={`${inputCls} h-32`} placeholder="PRIMARY TEXT"
              value={ad.primary_text}
              onChange={(e) => setAd({ ...ad, primary_text: e.target.value })} />
            <input className={inputCls} placeholder="CTA (e.g. Shop Now)" value={ad.cta}
              onChange={(e) => setAd({ ...ad, cta: e.target.value })} />
            <input className={inputCls} placeholder="Brand name (optional)" value={ad.brand}
              onChange={(e) => setAd({ ...ad, brand: e.target.value })} />
            <input className={inputCls} placeholder="Meta Ad Library URL (optional, stored as reference)"
              value={libUrl} onChange={(e) => setLibUrl(e.target.value)} />
          </div>
          <button className={`${btnCls} mt-6`} disabled={busy || (!ad.headline && !ad.primary_text)} onClick={runDecode}>
            {busy ? "DECODING…" : "DECODE PSYCHOLOGY →"}
          </button>
        </section>
      )}

      {/* ============ STEP 2 ============ */}
      {step === 2 && decode && (
        <section className="mt-10">
          <p className={labelCls}>&gt;&gt;&gt; STEP 2 — PSYCHOLOGY BREAKDOWN</p>
          <div className="mt-4 flex items-center gap-6">
            <h1 className="text-3xl md:text-4xl font-black uppercase text-white">
              Why it works
            </h1>
            <div className="font-mono">
              <span className="text-[#5f8a1e] text-xs">STEAL SCORE</span>
              <span className="block text-4xl font-black text-[#b8ff29]">{decode.stealScore}</span>
            </div>
          </div>

          {/* awareness */}
          <div className="mt-8 border border-[#1c2a10] p-5">
            <p className={labelCls}>AWARENESS LEVEL → {decode.awareness.choice}</p>
            {Object.entries(decode.awareness.probabilities).map(([k, v]) => (
              <div key={k} className="mt-2 flex items-center gap-3 font-mono text-xs">
                <span className="w-32 text-[#9fc98a]">{k}</span>
                <div className="flex-1 h-3 bg-[#0a120a] border border-[#1c2a10]">
                  <div className="h-full bg-[#b8ff29]" style={{ width: `${Math.round(v * 100)}%` }} />
                </div>
                <span className="w-10 text-right text-[#b8ff29]">{Math.round(v * 100)}%</span>
              </div>
            ))}
            <p className="mt-2 font-mono text-xs text-[#5f8a1e]">
              confidence: {(decode.awareness.confidence * 100).toFixed(0)}%
            </p>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {/* desires */}
            <div className="border border-[#1c2a10] p-5">
              <p className={labelCls}>4 CORE DESIRES</p>
              {DESIRES.map((d) => {
                const s = decode.desires[d];
                return (
                  <div key={d} className="mt-3 font-mono text-xs">
                    <div className="flex justify-between text-[#9fc98a]">
                      <span>{DESIRE_LABELS[d]}</span>
                      <span className="text-[#b8ff29]">{s.score.toFixed(1)}/3</span>
                    </div>
                    <div className="mt-1 h-2 bg-[#0a120a] border border-[#1c2a10]">
                      <div className="h-full bg-[#b8ff29]" style={{ width: `${(s.score / 3) * 100}%` }} />
                    </div>
                    <p className="text-[#5f8a1e] text-[10px] mt-0.5">
                      {DESIRE_LEVELS.map((l, i) => `${l} ${(s.probabilities[i] * 100).toFixed(0)}%`).join(" · ")}
                    </p>
                  </div>
                );
              })}
            </div>
            {/* checkpoints */}
            <div className="border border-[#1c2a10] p-5">
              <p className={labelCls}>6 PSYCHOLOGICAL CHECKPOINTS</p>
              {CHECKPOINTS.map((c) => {
                const p = decode.checkpoints[c.id];
                const pass = p >= 0.5;
                return (
                  <div key={c.id} className="mt-3 flex justify-between font-mono text-xs">
                    <span className="text-[#9fc98a]">
                      [{pass ? "✓" : "✗"}] {c.label}
                    </span>
                    <span className={pass ? "text-[#b8ff29]" : "text-red-500"}>
                      {Math.round(p * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* triggers */}
          <div className="mt-6 border border-[#1c2a10] p-5">
            <p className={labelCls}>16 TRIGGERS</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TRIGGERS.map((t) => {
                const p = decode.triggers[t.id];
                return (
                  <span
                    key={t.id}
                    className="font-mono border border-[#1c2a10] px-2 py-1"
                    style={{
                      fontSize: `${11 + p * 8}px`,
                      color: p > 0.5 ? "#b8ff29" : "#4a5f3a",
                      borderColor: p > 0.5 ? "#b8ff29" : "#1c2a10",
                    }}
                    title={`${Math.round(p * 100)}%`}
                  >
                    {t.label} {Math.round(p * 100)}%
                  </span>
                );
              })}
            </div>
          </div>

          {/* hook type */}
          <div className="mt-6 border border-[#1c2a10] p-5">
            <p className={labelCls}>HOOK TYPE → {decode.hookType.choice}</p>
            <div className="mt-2 flex flex-wrap gap-2 font-mono text-xs">
              {Object.entries(decode.hookType.probabilities).map(([k, v]) => (
                <span key={k} className="text-[#9fc98a]">
                  {k}:{Math.round(v * 100)}%
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button className="font-mono border border-[#1c2a10] px-6 py-3 text-[#9fc98a] hover:border-[#b8ff29]" onClick={() => setStep(1)}>
              ← BACK
            </button>
            <button className={btnCls} onClick={() => setStep(3)}>
              BRAND AGENT + GENERATE →
            </button>
          </div>
        </section>
      )}

      {/* ============ STEP 3 ============ */}
      {step === 3 && decode && (
        <section className="mt-10">
          <p className={labelCls}>&gt;&gt;&gt; STEP 3 — BRAND AGENT + GENERATE</p>

          {!brand ? (
            <div className="mt-6 max-w-2xl grid gap-4">
              <input className={inputCls} placeholder="Your website URL" value={brandUrl}
                onChange={(e) => setBrandUrl(e.target.value)} />
              <input className={inputCls} placeholder="Product name" value={product}
                onChange={(e) => setProduct(e.target.value)} />
              <input className={inputCls} placeholder="1-line product description (optional)"
                value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} />
              <button className={btnCls} disabled={busy || !brandUrl} onClick={runBrand}>
                {busy ? "EXTRACTING BRAND…" : "RUN BRAND AGENT →"}
              </button>
            </div>
          ) : (
            <>
              {/* brand card (editable) */}
              <div className="mt-6 border border-[#1c2a10] p-5 grid md:grid-cols-2 gap-4">
                <p className={`${labelCls} md:col-span-2`}>BRAND CARD (edit as needed)</p>
                {(
                  [
                    ["product", "product"],
                    ["description", "description"],
                    ["voice", "voice"],
                    ["positioning", "positioning"],
                    ["audience", "audience"],
                    ["palette", "palette"],
                  ] as const
                ).map(([field, lbl]) => (
                  <label key={field} className="font-mono text-xs text-[#5f8a1e]">
                    {lbl}
                    <input
                      className={`${inputCls} mt-1`}
                      value={String(brand[field])}
                      onChange={(e) => setBrand({ ...brand, [field]: e.target.value })}
                    />
                  </label>
                ))}
                <div className="md:col-span-2 font-mono text-xs text-[#9fc98a]">
                  benefits: {brand.benefits.map((b) => `"${b}"`).join(" · ")}
                </div>
              </div>

              {/* controls */}
              <div className="mt-6 flex flex-wrap items-center gap-6 font-mono text-sm">
                <div>
                  <span className="text-[#5f8a1e] text-xs">CREATIVITY {creativity}/4</span>
                  <input type="range" min={1} max={4} value={creativity}
                    onChange={(e) => setCreativity(Number(e.target.value) as 1 | 2 | 3 | 4)}
                    className="block accent-[#b8ff29]" />
                </div>
                <label className="flex items-center gap-2 text-[#9fc98a]">
                  <input type="checkbox" checked={bulk} onChange={(e) => setBulk(e.target.checked)} className="accent-[#b8ff29]" />
                  BULK MODE
                </label>
                <div className="flex gap-2">
                  {(bulk ? [5, 10, 20] : [3, 5, 8]).map((n) => (
                    <button key={n} onClick={() => setCount(n)}
                      className={`px-3 py-1 border ${count === n ? "border-[#b8ff29] text-[#b8ff29]" : "border-[#1c2a10] text-[#9fc98a]"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <button className={`${btnCls} mt-4`} disabled={busy} onClick={runGenerate}>
                {busy ? "GENERATING…" : "GENERATE ADS →"}
              </button>
            </>
          )}

          {/* generated ads */}
          {ads.length > 0 && brand && (
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((a, i) => (
                <AdCard key={a.id + i} ad={a} brand={brand}
                  onChange={(next) => setAds((prev) => prev.map((x, j) => (j === i ? { ...x, ...next } : x)))}
                  post={post} setError={setError} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function AdCard({
  ad,
  brand,
  onChange,
  post,
  setError,
}: {
  ad: GenAd;
  brand: BrandCard;
  onChange: (a: Partial<GenAd>) => void;
  post: <T>(url: string, body: unknown) => Promise<T>;
  setError: (s: string) => void;
}) {
  const [ratio, setRatio] = useState<"1:1" | "4:5" | "9:16">("1:1");
  const [refine, setRefine] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pal = PALETTES[(brand.palette as PaletteId)] || PALETTES.lime_terminal;
  const aspect = ratio === "1:1" ? "1/1" : ratio === "4:5" ? "4/5" : "9/16";

  async function download() {
    if (!ref.current) return;
    const url = await toPng(ref.current, { pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ad.id}.png`;
    a.click();
  }

  async function doRefine() {
    if (!refine.trim()) return;
    setBusy(true);
    try {
      const r = await post<{ ad: Candidate }>("/api/refine", { ad, request: refine, brand });
      onChange(r.ad);
      setRefine("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "refine failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-[#1c2a10]">
      {/* creative */}
      <div ref={ref} className="relative w-full flex flex-col justify-between p-5 overflow-hidden"
        style={{ aspectRatio: aspect, background: pal.bg }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at 30% 20%, ${pal.accent}33, transparent 60%)` }} />
        <h3 className="relative font-black uppercase leading-tight"
          style={{ color: pal.accent, fontSize: "clamp(14px, 4vw, 22px)" }}>
          {ad.headline}
        </h3>
        <div className="relative">
          <p className="text-xs leading-snug" style={{ color: pal.text }}>{ad.body}</p>
          <button className="mt-3 px-4 py-2 font-mono text-xs font-bold uppercase"
            style={{ background: pal.accent, color: pal.bg }}>
            {ad.cta || "Learn more"}
          </button>
          <p className="mt-2 font-mono text-[10px]" style={{ color: pal.accent }}>
            {brand.product}
          </p>
        </div>
      </div>
      {/* controls */}
      <div className="p-3 border-t border-[#1c2a10] font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(["1:1", "4:5", "9:16"] as const).map((r) => (
              <button key={r} onClick={() => setRatio(r)}
                className={`px-2 py-1 border ${ratio === r ? "border-[#b8ff29] text-[#b8ff29]" : "border-[#1c2a10] text-[#9fc98a]"}`}>
                {r}
              </button>
            ))}
          </div>
          <span className="text-[#5f8a1e]">
            conv {(ad.score * 100).toFixed(0)}% · on-brand {(ad.onBrand * 100).toFixed(0)}%
          </span>
        </div>
        <div className="mt-2 flex gap-2">
          <button className="flex-1 border border-[#1c2a10] py-1 text-[#9fc98a] hover:border-[#b8ff29]"
            onClick={() => navigator.clipboard.writeText(`${ad.headline}\n\n${ad.body}\n\n${ad.cta}`)}>
            COPY TEXT
          </button>
          <button className="flex-1 border border-[#1c2a10] py-1 text-[#9fc98a] hover:border-[#b8ff29]" onClick={download}>
            DOWNLOAD PNG
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <input className="flex-1 bg-[#0a120a] border border-[#1c2a10] px-2 py-1 text-[#d9ffd9]"
            placeholder="REFINE: e.g. make it shorter" value={refine}
            onChange={(e) => setRefine(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doRefine()} />
          <button className="border border-[#1c2a10] px-3 text-[#b8ff29] hover:border-[#b8ff29] disabled:opacity-40"
            disabled={busy} onClick={doRefine}>
            {busy ? "…" : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}
