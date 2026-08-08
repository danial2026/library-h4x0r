#!/usr/bin/env bun
import { readdirSync, existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const LIST_URL = "https://h4x0r.icu/library";
const BASE_URL = "https://h4x0r.icu/library";
const BOOKS_DIR = path.join(process.cwd(), "books");
const CONCURRENCY = 8;

async function listRemoteBooks(): Promise<string[]> {
  const html = await fetch(LIST_URL, { redirect: "follow" }).then((r) => {
    if (!r.ok) throw new Error(`list failed: ${r.status} ${r.statusText}`);
    return r.text();
  });
  const hrefs: string[] = [];
  const linkRe = /href="books\/([^"]+)"\s+download/g;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html))) hrefs.push(m[1]);
  if (hrefs.length === 0) throw new Error("no book links found");
  return Array.from(new Set(hrefs.map((h) => decodeURIComponent(h))));
}

async function download(name: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/books/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(BOOKS_DIR, name), buf);
  return buf.length;
}

async function main2() {
  const names = await listRemoteBooks();
  const existing = new Set(existsSync(BOOKS_DIR) ? readdirSync(BOOKS_DIR) : []);
  const todo = names.filter((n) => !existing.has(n));

  console.log(`remote: ${names.length} books | local: ${names.length - todo.length} | to download: ${todo.length}`);

  if (todo.length === 0) {
    console.log("Nothing to do — all remote books are already local.");
    return;
  }

  mkdirSync(BOOKS_DIR, { recursive: true });
  const queue = [...todo];
  let ok = 0;
  let failed = 0;
  let bytes = 0;

  async function worker() {
    while (queue.length) {
      const name = queue.shift()!;
      if (existsSync(path.join(BOOKS_DIR, name))) {
        ok++;
        continue;
      }
      try {
        const size = await download(name);
        bytes += size;
        ok++;
        console.log(`  + ${name} (${(size / 1e6).toFixed(1)} MB)`);
      } catch (err) {
        failed++;
        console.error(`  ! ${name}: ${(err as Error).message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`Done: ${ok} ok (${(bytes / 1e6).toFixed(1)} MB), ${failed} failed.`);
}

main2().catch((err) => {
  console.error(err);
  process.exit(1);
});