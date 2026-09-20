// Fetch a brand URL server-side and extract a compact text profile
// for Jev to judge. Never let Jev "generate" brand info — we extract
// real sentences and let Jev select the benefit-bearing ones.

export type RawBrandPage = {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  text: string; // first ~3000 chars of visible-ish text
  sentences: string[]; // candidate benefit sentences
};

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extract(html: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < 20) {
    const t = stripTags(m[1]);
    if (t.length > 3) out.push(t);
  }
  return out;
}

export async function fetchBrandPage(url: string): Promise<RawBrandPage> {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let html: string;
  try {
    const res = await fetch(u, {
      signal: controller.signal,
      headers: { "user-agent": "AdCopier-BrandAgent/1.0" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status}`);
    html = await res.text();
  } finally {
    clearTimeout(timer);
  }

  const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const metaDescription = stripTags(
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] ||
      ""
  );
  const headings = [
    ...extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi),
    ...extract(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi),
  ];
  const text = stripTags(html).slice(0, 3000);

  const sentences = [metaDescription, ...headings, ...text.split(/(?<=[.!?])\s+/)]
    .map((s) => s.trim())
    .filter((s) => s.length >= 25 && s.length <= 220 && /[a-z]/i.test(s))
    .filter((s, i, a) => a.indexOf(s) === i)
    .slice(0, 12);

  return { url: u, title, metaDescription, headings, text, sentences };
}
