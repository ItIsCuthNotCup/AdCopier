import Link from "next/link";

const h2 = "text-3xl md:text-5xl font-black uppercase tracking-tight text-white";
const label = "font-mono text-[#b8ff29] text-sm tracking-widest uppercase";

export default function Landing() {
  return (
    <main className="min-h-screen">
      {/* nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#1c2a10]">
        <span className="font-mono font-bold text-xl text-[#b8ff29]">ADCOPIER_</span>
        <Link
          href="/app"
          className="font-mono text-sm bg-[#b8ff29] text-black px-4 py-2 font-bold hover:bg-[#d4ff5e]"
        >
          STEAL AN AD →
        </Link>
      </nav>

      {/* hero */}
      <section className="px-6 md:px-12 py-20 md:py-32 border-b border-[#1c2a10]">
        <p className={label}>&gt;&gt;&gt; INIT: PSYCHOLOGICAL WARFARE</p>
        <h1 className="text-5xl md:text-8xl font-black uppercase leading-[0.95] mt-6 text-white">
          Your competitors&apos;
          <br />
          ads are <span className="text-[#b8ff29]">winning.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-[#9fc98a]">
          AdCopier decodes the psychology behind high-performing ads—then
          generates ready-to-run creative for your brand.
        </p>
        <Link
          href="/app"
          className="inline-block mt-10 font-mono bg-[#b8ff29] text-black px-8 py-4 font-bold text-lg hover:bg-[#d4ff5e]"
        >
          STEAL AN AD IN 30 SECONDS →
        </Link>
        <p className="mt-4 font-mono text-xs text-[#5f8a1e]">
          no signup required // heads of growth • creative strategists • founders
        </p>
      </section>

      {/* cost of inspiration scrolling */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1c2a10]">
        <p className={label}>&gt;&gt;&gt; DIAGNOSTIC</p>
        <h2 className={`${h2} mt-4`}>The real cost of &apos;inspiration scrolling&apos;</h2>
        <div className="mt-10 max-w-3xl border border-[#1c2a10]">
          <div className="grid grid-cols-3 font-mono text-xs uppercase text-[#5f8a1e] border-b border-[#1c2a10] px-4 py-3">
            <span>Task</span>
            <span>Process</span>
            <span className="text-right">Time</span>
          </div>
          {[
            ["Scrolling FB Ad Library", "manual hunt", "2h 00m"],
            ["Decoding 'the vibe'", "guesswork", "0h 45m"],
            ["Briefing designers", "meetings", "3h 00m"],
            ["Revisions loop", "endless", "2 rounds"],
            ["Testing based on vibes", "pray", "∞ hours"],
          ].map(([t, p, time]) => (
            <div
              key={t}
              className="grid grid-cols-3 font-mono text-sm px-4 py-3 border-b border-[#101a08] text-[#c8f0a0]"
            >
              <span>{t}</span>
              <span className="text-[#5f8a1e]">{p}</span>
              <span className="text-right text-[#b8ff29]">{time}</span>
            </div>
          ))}
          <div className="px-4 py-3 font-mono text-sm text-white bg-[#0d1607]">
            TOTAL DRAIN = <span className="text-[#b8ff29] font-bold">8+ HOURS</span>
          </div>
        </div>
        <blockquote className="mt-8 max-w-xl border-l-2 border-[#b8ff29] pl-4 text-[#9fc98a]">
          &quot;Your competitors ship 10x the volume. They test faster. They win
          faster.&quot;
        </blockquote>
        <p className="mt-6 font-mono text-[#b8ff29]">
          That question has an answer. IT&apos;S NOT VIBES. IT&apos;S PSYCHOLOGY.
        </p>
      </section>

      {/* everyone copies ads */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1c2a10]">
        <p className={label}>&gt;&gt;&gt; ERROR LOG: THE STATUS QUO</p>
        <h2 className={`${h2} mt-4`}>Everyone copies ads. That&apos;s why they fail.</h2>
        <ol className="mt-10 font-mono text-[#c8f0a0] space-y-2 max-w-md">
          <li>1. See ad that works</li>
          <li>2. Copy the format</li>
          <li>3. Swap the product</li>
          <li>4. Launch</li>
        </ol>
        <p className="mt-4 font-mono text-red-500">&gt;&gt; CRITICAL FAILURE</p>
        <p className="mt-6 text-lg text-[#9fc98a] max-w-2xl">
          &quot;Because you copied the WHAT, not the WHY.&quot; That winning ad
          didn&apos;t convert because of the color scheme or the font. It
          converted because it triggered a specific PSYCHOLOGICAL RESPONSE in a
          specific audience.
        </p>
        <h3 className="mt-10 text-2xl md:text-3xl font-bold text-white">
          &quot;The layout is the vehicle.{" "}
          <span className="text-[#b8ff29]">The psychology is the engine.&quot;</span>
        </h3>
        <p className="mt-2 text-[#5f8a1e] font-mono text-sm">
          AdCopier gives you the engine—and the vehicle.
        </p>
      </section>

      {/* 4-step flow */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1c2a10]">
        <p className={label}>&gt;&gt;&gt; PIPELINE</p>
        <h2 className={`${h2} mt-4`}>From competitor ad to ready-to-run creative</h2>
        <div className="mt-12 grid md:grid-cols-2 gap-px bg-[#1c2a10]">
          {[
            ["01", "SCRAPE THE WINNERS", "Pull the ads that are actually working. Paste any competitor ad—or link a Meta Ad Library listing—and we decode the high-performers."],
            ["02", "DECODE THE PSYCHOLOGY", "Our AI maps every ad against 4 core desires, 6 psychological checkpoints, 16 triggers, and awareness-level matching to identify exactly why it stops the scroll."],
            ["03", "BRAND AGENT PULLS YOUR CONTEXT", "Give us a URL. We do the rest. The Brand Agent extracts your voice and positioning from your website. No 47-question questionnaire."],
            ["04", "GENERATE READY-TO-RUN ADS", "Multiple concepts—different hooks, angles, approaches—ranked by Jev so you pick the winner. 1:1, 4:5, 9:16. 4 creativity levels."],
          ].map(([n, t, d]) => (
            <div key={n} className="bg-[#050805] p-8">
              <p className="font-mono text-[#5f8a1e] text-sm">[{n}]</p>
              <h3 className="mt-2 font-bold text-xl text-white uppercase">{t}</h3>
              <p className="mt-3 text-[#9fc98a]">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 font-mono text-sm text-[#5f8a1e]">
          &gt;&gt;&gt; BULK_MODE: pick 5, 10, or 20 — generate an entire arsenal in
          one shot.
        </p>
      </section>

      {/* pricing */}
      <section className="px-6 md:px-12 py-20 border-b border-[#1c2a10]">
        <p className={label}>&gt;&gt;&gt; ACCESS LEVELS — select your protocol</p>
        <div className="mt-12 grid md:grid-cols-3 gap-px bg-[#1c2a10]">
          {[
            {
              name: "Growth",
              sub: "For founders testing paid ads",
              price: "$149/mo",
              feats: ["30 generations/month", "5 competitors tracked", "1 brand", "4 creativity levels", "Full psychology analysis", "Meta size variations"],
              rec: false,
            },
            {
              name: "Scale",
              sub: "For brands scaling their paid media",
              price: "$299/mo",
              feats: ["100 generations/month", "20 competitors tracked", "5 brands", "Multi-concept generation", "Bulk export", "Priority support (48hr)"],
              rec: true,
            },
            {
              name: "Agency",
              sub: "For agencies managing multiple brands",
              price: "$599/mo",
              feats: ["400 generations/month", "Unlimited competitors", "Unlimited brands", "Multi-concept generation", "Dedicated Slack channel", "API access (coming)"],
              rec: false,
            },
          ].map((p) => (
            <div key={p.name} className="bg-[#050805] p-8 relative">
              {p.rec && (
                <span className="absolute top-0 right-0 bg-[#b8ff29] text-black font-mono text-xs px-3 py-1 font-bold">
                  RECOMMENDED
                </span>
              )}
              <h3 className="text-2xl font-bold text-white">{p.name}</h3>
              <p className="text-[#5f8a1e] font-mono text-xs mt-1">{p.sub}</p>
              <p className="mt-4 text-4xl font-black text-[#b8ff29]">{p.price}</p>
              <ul className="mt-6 space-y-2 text-[#c8f0a0] font-mono text-sm">
                {p.feats.map((f) => (
                  <li key={f}>* {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* final CTA */}
      <section className="px-6 md:px-12 py-24 text-center">
        <h2 className={h2}>
          Stop guessing.
          <br />
          <span className="text-[#b8ff29]">Start shipping winners.</span>
        </h2>
        <p className="mt-6 text-[#9fc98a]">
          Give us a URL. Our Brand Agent pulls your context automatically.
        </p>
        <Link
          href="/app"
          className="inline-block mt-10 font-mono bg-[#b8ff29] text-black px-10 py-4 font-bold text-lg hover:bg-[#d4ff5e]"
        >
          LAUNCH ADCOPIER →
        </Link>
      </section>
    </main>
  );
}
