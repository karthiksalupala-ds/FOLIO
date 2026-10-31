<div align="center">

# FOLIO

**The complete PDF studio. Edit, convert, sign, secure and understand documents, right in your browser.**

[![CI](https://github.com/karthiksalupala-ds/FOLIO/actions/workflows/ci.yml/badge.svg)](https://github.com/karthiksalupala-ds/FOLIO/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white)

</div>

---

## Why FOLIO

One workspace for everything you do with a PDF. **36 tools** across organizing, optimizing, converting, editing, securing and understanding documents, plus a full on-page editor with undo/redo. Most processing happens **locally in your browser**, so your files are not uploaded to a conversion server.

## Tools

### Organize
Merge PDF · Split PDF · Extract pages · Remove pages · Organize PDF · Rotate PDF

### Optimize
Compress PDF · Repair PDF · PDF to PDF/A

### Convert
Convert any file · PDF to Word · PDF to PowerPoint · PDF to Excel · PDF to JPG · PDF to PNG · PDF to Markdown · PDF to TXT · Word to PDF · PowerPoint to PDF · Excel to PDF · JPG to PDF · HTML to PDF · Scan to PDF

### Edit
Edit PDF · PDF Forms · Watermark · Page numbers · Crop PDF

### Security
Redact PDF · Sign PDF · Protect PDF · Unlock PDF · Compare PDF

### Intelligence
OCR PDF · AI Summarizer · Translate PDF

## The editor

Open any document and work directly on the page.

| Tool | Shortcut | What it does |
| --- | :---: | --- |
| Select | `V` | Move, resize and delete objects |
| Text | `T` | Click any line of existing text and retype it. The new text keeps the original font style (sans, serif, mono, bold, italic), ink colour and background |
| Highlight, Underline, Strike | `H` | Mark up text |
| Pen | `P` | Freehand drawing |
| Shapes | | Rectangle, ellipse, line, arrow |
| Image | | Place pictures and logos |
| Sign | | Draw or type a signature |
| Stamp | | Approved, Draft, Confidential and more |
| Note | | Sticky notes |
| Redact | | Mark text for permanent removal |

Also built in: **find in page**, page tools (rotate, duplicate, insert blank, delete, reorder), and full **undo / redo** history.

## Built for real documents

- **Real redaction.** Redacted pages are flattened to images, so the removed text can't be selected or copied.
- **Real encryption.** Protect PDF uses standard PDF password encryption.
- **OCR for scans.** Scanned PDFs are read with Tesseract (English) and saved as a searchable PDF plus a text file.
- **Multilingual text.** Telugu, Hindi, Tamil, Kannada, Cyrillic, Greek and extended Latin render correctly in watermarks, annotations and notes.
- **Never-larger compression.** Compress PDF compares a lossless rewrite with a re-render and returns the smallest result.
- **Long-document AI.** Summaries and translations are chunked, so nothing is silently cut off.
- **Safe link fetching.** HTML to PDF blocks private networks, localhost and cloud metadata addresses.

## Privacy

Documents are processed in your browser and stored locally. The two AI tools (Summarizer, Translate) send the extracted text to the server, which calls the xAI API. Nothing else leaves your device.

## Getting started

```bash
git clone https://github.com/karthiksalupala-ds/FOLIO.git
cd FOLIO
npm install
npm run dev
```

Open **http://localhost:8080**.

### Configuration

| Variable | Purpose |
| --- | --- |
| `XAI_API_KEY` | Enables AI Summarizer and Translate. Without it, summaries fall back to a basic extract and translation is unavailable. |

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port 8080 |
| `npm run build` | Production build and database migrations |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test:app` | FOLIO unit tests |
| `npm run format` | Prettier |

## Tech stack

**Frontend:** React, TypeScript, Vite, TanStack Router, Radix UI
**PDF engine:** pdf-lib, pdf.js, @pdf-lib/fontkit, Tesseract.js, JSZip
**Backend:** TanStack Start server functions, PGlite, email/password auth
**Quality:** ESLint, Prettier, Node test runner, GitHub Actions CI

## Project structure

```
src/
  components/folio/   Editor, tool workspace, dialogs, upload hub
  lib/folio/          catalog, ops (tool logic), pdf, convert, office, ai,
                      fonts, ssrf, text-utils, store, idb
  routes/             Pages: home, /tools/:toolId, /editor/:docId
server/middleware/    Server middleware
migrations/auth/      Database migrations
public/fonts/         Noto fonts used for multilingual PDF text
scripts/              Build and platform scripts
```

## Roadmap

Planned work to bring the editing experience closer to desktop PDF editors:

- [ ] Paragraph-level text editing with reflow (today editing is line by line)
- [ ] Exact font matching with embedded fonts (today the closest standard font is used)
- [ ] Edit, move, replace and delete existing images
- [ ] Find and replace across the document
- [ ] Comments and review mode
- [ ] Interactive form fields: checkbox, radio, dropdown, signature field
- [ ] Hyperlinks and bookmarks
- [ ] More OCR languages (Telugu, Hindi)

## Contributing

1. Create a branch.
2. Run `npm run typecheck`, `npm run lint` and `npm run test:app`.
3. Open a pull request. CI runs the same checks.

---

<div align="center">Built by <a href="https://github.com/karthiksalupala-ds">Karthik</a></div>
