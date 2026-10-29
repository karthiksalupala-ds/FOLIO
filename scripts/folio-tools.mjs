import { chromium } from "playwright";

const tools = [
  "merge-pdf","split-pdf","extract-pdf","organize-pdf","rotate-pdf","compress-pdf","repair-pdf","pdf-to-pdfa",
  "pdf-to-word","pdf-to-powerpoint","pdf-to-excel","pdf-to-jpg","pdf-to-png","pdf-to-markdown","pdf-to-txt",
  "word-to-pdf","powerpoint-to-pdf","excel-to-pdf","jpg-to-pdf","html-to-pdf","scan-to-pdf",
  "watermark","page-numbers","crop-pdf","redact-pdf","sign-pdf","protect-pdf","unlock-pdf","compare-pdf",
  "ocr-pdf","summarize-pdf","translate-pdf"
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const results = [];
for (const id of tools) {
  const t0 = Date.now();
  try {
    await page.goto(`http://127.0.0.1:8080/tools/${id}`, { waitUntil: "networkidle", timeout: 20000 });
    const sample = page.getByRole("button", { name: /Try with a sample|Use sample/ }).first();
    await sample.click({ timeout: 8000 });
    const dock = page.locator(".tool-dock button").last();
    await page.waitForFunction(() => {
      const b = document.querySelector(".tool-dock button");
      return b && !b.disabled;
    }, { timeout: 12000 });
    await dock.click();
    await page.waitForFunction(() => {
      const h = document.querySelector("h1")?.textContent || "";
      const err = document.querySelector(".text-danger")?.textContent || "";
      return err || /!/.test(h) || /ready|merged|converted|split|organized|rotated|compressed|repaired|extracted|added|signed|protected|unlocked|redacted|cropped|summary|translated|comparison/i.test(h);
    }, { timeout: 25000 });
    const h1 = await page.locator("h1").innerText();
    const err = await page.locator(".text-danger").count() ? await page.locator(".text-danger").first().innerText() : "";
    const downloads = await page.getByRole("button", { name: /Download|Save/ }).count();
    results.push({ id, ok: !err && downloads > 0, h1, err, downloads, ms: Date.now()-t0 });
  } catch (e) {
    const h1 = await page.locator("h1").innerText().catch(() => "");
    const err = await page.locator(".text-danger").innerText().catch(() => "");
    results.push({ id, ok: false, h1, err, error: String(e.message || e).slice(0, 180), ms: Date.now()-t0 });
  }
  console.log(JSON.stringify(results[results.length-1]));
}
const failed = results.filter(r => !r.ok);
console.log("FAILED", failed.length, "/", results.length);
await browser.close();
