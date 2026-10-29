import { createServerFn } from "@tanstack/react-start";

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
      1800,
    );
    if (res.ok) return res;
    return {
      ok: false as const,
      error: `Could not translate to ${data.lang} right now. Try again in a moment.`,
    };
  });

export const fetchHtmlPage = createServerFn({ method: "POST" })
  .validator((input: { url: string }) => input)
  .handler(async ({ data }) => {
    let url = data.url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { ok: false as const, error: "Only http and https URLs are allowed" };
      }
    } catch {
      return { ok: false as const, error: "Enter a valid URL" };
    }
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "User-Agent": "FolioPDF/1.0" },
      });
      if (!res.ok) return { ok: false as const, error: `Could not fetch page (${res.status})` };
      const html = (await res.text()).slice(0, MAX_HTML);
      return { ok: true as const, html, url };
    } catch {
      return { ok: false as const, error: "Could not reach that page" };
    }
  });
