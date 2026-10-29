import { createServerFn } from "@tanstack/react-start";
import { isBlockedHostname, isPrivateAddress } from "./ssrf.ts";

const MAX_IN = 12_000;
const MAX_HTML = 400_000;

async function chat(system: string, user: string, maxTokens: number) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false as const, error: "unavailable" };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user.slice(0, MAX_IN) },
      ],
    }),
  });
  if (!res.ok) return { ok: false as const, error: `AI request failed (${res.status})` };
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return { ok: false as const, error: "Empty AI response" };
  return { ok: true as const, text };
}

export function extractiveSummary(text: string, title: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 28);
  const briefing = (sentences.slice(0, 7).join(" ") || clean.slice(0, 900)).trim();
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 24)
    .slice(0, 8);
  const bullets = paras.map((p) => `- ${p.split(/(?<=[.!?])\s+/)[0]?.slice(0, 160) ?? p.slice(0, 160)}`);
  return `Summary of ${title}\n\n${briefing}\n\nKey points\n${bullets.join("\n")}`;
}

export const summarizeText = createServerFn({ method: "POST" })
  .validator((input: { text: string; title: string }) => input)
  .handler(async ({ data }) => {
    const res = await chat(
      "You summarize documents for a PDF toolkit. Return plain text only: a 6–10 sentence briefing, then 5–8 bullet key points prefixed with '- '. No markdown headings.",
      `Title: ${data.title}\n\n${data.text}`,
      700,
    );
    if (res.ok) return res;
    return { ok: true as const, text: extractiveSummary(data.text, data.title) };
  });

export const translateText = createServerFn({ method: "POST" })
  .validator((input: { text: string; lang: string }) => input)
  .handler(async ({ data }) => {
    const res = await chat(
      `Translate the document into ${data.lang}. Keep paragraph breaks. Return only the translation, no preface.`,
      data.text,
      6000,
    );
    if (res.ok) return res;
    return {
      ok: false as const,
      error: `Could not translate to ${data.lang} right now. Try again in a moment.`,
    };
  });

const MAX_REDIRECTS = 5;

/** Throws unless the URL points at a public http(s) host (blocks localhost, private ranges, cloud metadata). */
async function assertPublicUrl(url: URL) {
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only http and https URLs are allowed");
  if (url.username || url.password) throw new Error("URLs with credentials are not allowed");
  if (url.port && !["80", "443"].includes(url.port)) throw new Error("Only standard web ports are allowed");
  const host = url.hostname;
  if (isBlockedHostname(host)) throw new Error("That address is not allowed");
  const isLiteral = /^[0-9.]+$/.test(host) || host.includes(":");
  if (!isLiteral) {
    const { lookup } = await import("node:dns/promises");
    const addrs = await lookup(host, { all: true });
    if (!addrs.length || addrs.some((a) => isPrivateAddress(a.address))) throw new Error("That address is not allowed");
  }
}

export const fetchHtmlPage = createServerFn({ method: "POST" })
  .validator((input: { url: string }) => input)
  .handler(async ({ data }) => {
    let raw = data.url.trim();
    if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
    let current: URL;
    try {
      current = new URL(raw);
    } catch {
      return { ok: false as const, error: "Enter a valid URL" };
    }
    try {
      for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        await assertPublicUrl(current);
        const res = await fetch(current, {
          redirect: "manual", // follow redirects ourselves so every hop is re-checked
          headers: { "User-Agent": "FolioPDF/1.0" },
          signal: AbortSignal.timeout(10_000),
        });
        if (res.status >= 300 && res.status < 400) {
          const loc = res.headers.get("location");
          if (!loc) return { ok: false as const, error: "Bad redirect from that page" };
          current = new URL(loc, current);
          continue;
        }
        if (!res.ok) return { ok: false as const, error: `Could not fetch page (${res.status})` };
        const html = (await res.text()).slice(0, MAX_HTML);
        return { ok: true as const, html, url: current.toString() };
      }
      return { ok: false as const, error: "Too many redirects" };
    } catch (e) {
      const msg = e instanceof Error && /not allowed|Only http|credentials|ports/.test(e.message) ? e.message : "Could not reach that page";
      return { ok: false as const, error: msg };
    }
  });
