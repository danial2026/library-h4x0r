#!/usr/bin/env bun
import { existsSync, mkdirSync } from "node:fs";
import { readFile, readdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { getBooks } from "../src/data/books";

const BOOKS_DIR = path.join(process.cwd(), "books");
const OUT_DIR = path.join(process.cwd(), "public", "covers");
const SUPPORTED_EXT = new Set([".pdf", ".epub", ".html", ".htm"]);
const TARGET_WIDTH = 450;

// ---------- minimal ZIP reader (for EPUB) ----------

interface ZipEntry {
  name: string;
  method: number;
  csize: number;
  offset: number;
}

function zipEntries(buf: Uint8Array): ZipEntry[] {
  let eocd = -1;
  const lowerBound = Math.max(0, buf.length - 65557);
  for (let i = buf.length - 22; i >= lowerBound; i--) {
    if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x05 && buf[i + 3] === 0x06) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("not a zip archive");

  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const entries: ZipEntry[] = [];
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error("corrupt zip");
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const offset = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nameLen));
    entries.push({ name, method, csize, offset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function readZipFile(buf: Uint8Array, name: string): Uint8Array | null {
  const entry = zipEntries(buf).find((e) => e.name === name || e.name.endsWith(`/${name}`));
  if (!entry) return null;
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const p = entry.offset;
  if (dv.getUint32(p, true) !== 0x04034b50) throw new Error("corrupt zip local header");
  const nameLen = dv.getUint16(p + 26, true);
  const extraLen = dv.getUint16(p + 28, true);
  const start = p + 30 + nameLen + extraLen;
  const data = buf.subarray(start, start + entry.csize);
  return entry.method === 0 ? data : zlib.inflateRawSync(data);
}

// ---------- per-format cover extraction ----------

async function inkRatio(imageBytes: Uint8Array): Promise<number> {
  const img = await loadImage(imageBytes);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  let dark = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += 32) {
    total++;
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < 200) dark++;
  }
  return dark / total;
}

const BLANK_PAGE_RATIO = 0.01;

interface PageLike {
  getViewport(opts: { scale: number }): { width: number; height: number };
  render(opts: {
    canvas: null;
    canvasContext: CanvasRenderingContext2D;
    viewport: unknown;
  }): { promise: Promise<void> };
}

interface PdfLike {
  numPages: number;
  getPage(pageNum: number): Promise<PageLike>;
}

async function renderPagePng(pdf: PdfLike, pageNum: number): Promise<Uint8Array> {
  const page = await pdf.getPage(pageNum);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: TARGET_WIDTH / base.width });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page
    .render({ canvas: null, canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport })
    .promise;
  return canvas.toBuffer("image/png");
}

async function pdfCoverImage(bytes: Uint8Array): Promise<Uint8Array | null> {
  const loadingTask = getDocument({ data: bytes, useSystemFonts: true, verbosity: 0 });
  const pdf = (await loadingTask.promise) as unknown as PdfLike;
  try {
    const limit = Math.min(pdf.numPages, 12);
    let first: Uint8Array | null = null;
    for (let n = 1; n <= limit; n++) {
      const png = await renderPagePng(pdf, n);
      if (n === 1) first = png;
      if ((await inkRatio(png)) >= BLANK_PAGE_RATIO) return png;
    }
    if (first !== null && (await inkRatio(first)) >= BLANK_PAGE_RATIO) return first;
    return null;
  } finally {
    loadingTask.destroy();
  }
}

function epubCoverImage(bytes: Uint8Array): Uint8Array | null {
  const container = readZipFile(bytes, "META-INF/container.xml");
  if (!container) return null;
  const opfMatch = new TextDecoder().decode(container).match(/full-path\s*=\s*["']([^"']+)["']/);
  if (!opfMatch) return null;
  const opfPath = opfMatch[1];
  const opf = readZipFile(bytes, opfPath);
  if (!opf) return null;
  const opfText = new TextDecoder().decode(opf);
  const opfDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/")) : "";

  const attr = (tag: string, name: string): string | null => {
    const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
    return m ? m[1] : null;
  };

  const coverId = opfText.match(/<meta\s+name\s*=\s*["']cover["']\s+content\s*=\s*["']([^"']+)["']/i)?.[1] ?? null;

  let href: string | null = null;
  const items = opfText.match(/<item\b[^>]*\/?>/gi) ?? [];
  for (const item of items) {
    const id = attr(item, "id");
    const props = (attr(item, "properties") ?? "").toLowerCase();
    if ((coverId && id === coverId) || props.includes("cover-image")) {
      href = attr(item, "href");
      break;
    }
  }
  if (!href) {
    const imgItem = items.find((it) => (attr(it, "media-type") ?? "").startsWith("image/"));
    href = imgItem ? attr(imgItem, "href") : null;
  }
  if (!href) return null;

  const resolved = href.startsWith("/") ? href.slice(1) : opfDir ? `${opfDir}/${href}` : href;
  const file = readZipFile(bytes, resolved);
  if (!file) return null;

  const lower = new TextDecoder("latin1").decode(file.subarray(0, 64)).toLowerCase();
  if (lower.includes("svg")) return file;
  if (lower.includes("<html") || lower.includes("<xml")) return null;
  return file;
}

async function htmlCoverImage(srcPath: string): Promise<Uint8Array | null> {
  const html = await readFile(srcPath, "utf8");
  const m = html.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
  if (!m) return null;
  const u = m[1];
  const baseDir = path.dirname(srcPath);
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(u)) {
    const res = await fetch(u);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  }
  const target = path.join(baseDir, decodeURIComponent(u.split("?")[0]));
  if (!existsSync(target)) return null;
  return new Uint8Array(await readFile(target));
}

// ---------- rasterize any cover bytes to PNG ----------

async function rasterizeCover(imageBytes: Uint8Array, out: string): Promise<void> {
  const img = await loadImage(imageBytes);
  const scale = TARGET_WIDTH / img.width;
  const width = Math.ceil(img.width * scale);
  const height = Math.ceil(img.height * scale);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  await writeFile(out, canvas.toBuffer("image/png"));
}

// ---------- typographic cover for books without extractable art ----------

async function textCoverImage(
  book: Awaited<ReturnType<typeof getBooks>>[number]
): Promise<Uint8Array> {
  const width = 450;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f5f4ef";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, width - 28, height - 28);

  const words = book.title.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  ctx.font = "600 34px system-ui, sans-serif";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > width - 90 && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  ctx.fillStyle = "#141414";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lineHeight = 44;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight);
  });

  ctx.font = "600 13px system-ui, sans-serif";
  ctx.fillStyle = "rgba(20,20,20,0.55)";
  ctx.fillText(book.category.toUpperCase(), width / 2, height - 38);

  return canvas.toBuffer("image/png");
}

export async function renderCover(book: Awaited<ReturnType<typeof getBooks>>[number]): Promise<boolean> {
  const src = path.join(BOOKS_DIR, book.filename);
  const out = path.join(OUT_DIR, `${book.id}.png`);
  const ext = path.extname(book.filename).toLowerCase();

  if (!existsSync(src)) return false;
  if (existsSync(out)) {
    const upToDate = await (async () => {
      const [srcStat, outStat] = await Promise.all([stat(src), stat(out)]);
      if (outStat.mtimeMs < srcStat.mtimeMs) return false;
      if (ext !== ".pdf") return true;
      try {
        return (await inkRatio(new Uint8Array(await readFile(out)))) >= BLANK_PAGE_RATIO;
      } catch {
        return false;
      }
    })();
    if (upToDate) return true;
  }

  try {
    let imageBytes: Uint8Array | null = null;
    if (ext === ".pdf") {
      imageBytes = await pdfCoverImage(new Uint8Array(await readFile(src)));
    } else if (ext === ".epub") {
      imageBytes = epubCoverImage(new Uint8Array(await readFile(src)));
    } else if (ext === ".html" || ext === ".htm") {
      imageBytes = await htmlCoverImage(src);
    }
    if (!imageBytes) imageBytes = await textCoverImage(book);

    mkdirSync(OUT_DIR, { recursive: true });
    await rasterizeCover(imageBytes, out);
    return true;
  } catch (err) {
    console.error(`  ! failed ${book.filename}: ${(err as Error).message}`);
    return false;
  }
}

async function main() {
  if (!existsSync(BOOKS_DIR)) {
    console.log("books/ not found — skipping cover generation.");
    return;
  }

  const files = new Set(await readdir(BOOKS_DIR));
  const books = (await getBooks()).filter((b) => {
    const ext = path.extname(b.filename).toLowerCase();
    return files.has(b.filename) && SUPPORTED_EXT.has(ext);
  });

  console.log(`Generating covers for ${books.length} books into ${OUT_DIR}...`);
  let ok = 0;
  let skipped = 0;

  for (const book of books) {
    const existed = existsSync(path.join(OUT_DIR, `${book.id}.png`));
    const result = await renderCover(book);
    if (result && existed) {
      skipped++;
    } else if (result) {
      ok++;
      console.log(`  + ${book.id}.png`);
    }
  }

  console.log(`Done: ${ok} generated, ${skipped} up-to-date, ${books.length - ok - skipped} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});