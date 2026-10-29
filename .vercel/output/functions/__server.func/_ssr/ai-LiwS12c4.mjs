import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-LiwS12c4.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var MAX_IN = 12e3;
var MAX_HTML = 4e5;
async function chat(system, user, maxTokens) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: maxTokens,
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: user.slice(0, MAX_IN)
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `AI request failed (${res.status})`
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!text) return {
		ok: false,
		error: "Empty AI response"
	};
	return {
		ok: true,
		text
	};
}
function extractiveSummary(text, title) {
	const clean = text.replace(/\s+/g, " ").trim();
	return `Summary of ${title}\n\n${(clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 28).slice(0, 7).join(" ") || clean.slice(0, 900)).trim()}\n\nKey points\n${text.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 24).slice(0, 8).map((p) => `- ${p.split(/(?<=[.!?])\s+/)[0]?.slice(0, 160) ?? p.slice(0, 160)}`).join("\n")}`;
}
var summarizeText_createServerFn_handler = createServerRpc({
	id: "85ed5d11c8e805bb500cd502ebd85d90be82e0e8a36c1fdd3afa3640a1e6e620",
	name: "summarizeText",
	filename: "src/lib/folio/ai.ts"
}, (opts) => summarizeText.__executeServer(opts));
var summarizeText = createServerFn({ method: "POST" }).validator((input) => input).handler(summarizeText_createServerFn_handler, async ({ data }) => {
	const res = await chat("You summarize documents for a PDF toolkit. Return plain text only: a 6–10 sentence briefing, then 5–8 bullet key points prefixed with '- '. No markdown headings.", `Title: ${data.title}\n\n${data.text}`, 700);
	if (res.ok) return res;
	return {
		ok: true,
		text: extractiveSummary(data.text, data.title)
	};
});
var translateText_createServerFn_handler = createServerRpc({
	id: "88e21acf9b1bebc5001cc20fad32b65e996cc42204936979f43bc7e01f0ef18f",
	name: "translateText",
	filename: "src/lib/folio/ai.ts"
}, (opts) => translateText.__executeServer(opts));
var translateText = createServerFn({ method: "POST" }).validator((input) => input).handler(translateText_createServerFn_handler, async ({ data }) => {
	const res = await chat(`Translate the document into ${data.lang}. Keep paragraph breaks. Return only the translation, no preface.`, data.text, 1800);
	if (res.ok) return res;
	return {
		ok: false,
		error: `Could not translate to ${data.lang} right now. Try again in a moment.`
	};
});
var fetchHtmlPage_createServerFn_handler = createServerRpc({
	id: "e8412fa3383d18d3023dbe1af1b0ad565635919ccdf172b8f34d2b369c1d81b9",
	name: "fetchHtmlPage",
	filename: "src/lib/folio/ai.ts"
}, (opts) => fetchHtmlPage.__executeServer(opts));
var fetchHtmlPage = createServerFn({ method: "POST" }).validator((input) => input).handler(fetchHtmlPage_createServerFn_handler, async ({ data }) => {
	let url = data.url.trim();
	if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
	try {
		const parsed = new URL(url);
		if (!["http:", "https:"].includes(parsed.protocol)) return {
			ok: false,
			error: "Only http and https URLs are allowed"
		};
	} catch {
		return {
			ok: false,
			error: "Enter a valid URL"
		};
	}
	try {
		const res = await fetch(url, {
			redirect: "follow",
			headers: { "User-Agent": "FolioPDF/1.0" }
		});
		if (!res.ok) return {
			ok: false,
			error: `Could not fetch page (${res.status})`
		};
		return {
			ok: true,
			html: (await res.text()).slice(0, MAX_HTML),
			url
		};
	} catch {
		return {
			ok: false,
			error: "Could not reach that page"
		};
	}
});
//#endregion
export { fetchHtmlPage_createServerFn_handler, summarizeText_createServerFn_handler, translateText_createServerFn_handler };
