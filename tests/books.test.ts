import { describe, it, expect } from "vitest";
import { getBooks } from "@/data/books";

describe("getBooks", () => {
  it("returns books sorted alphabetically", async () => {
    const books = await getBooks();
    expect(books.length).toBeGreaterThan(0);
    for (let i = 1; i < books.length; i++) {
      expect(books[i].title.localeCompare(books[i - 1].title)).toBeGreaterThanOrEqual(0);
    }
  });

  it("each book has required fields", async () => {
    const books = await getBooks();
    for (const book of books) {
      expect(book.id).toBeTruthy();
      expect(book.title).toBeTruthy();
      expect(book.category).toBeTruthy();
      expect(book.format).toBeTruthy();
      expect(book.filename).toBeTruthy();
      expect(typeof book.color).toBe("string");
      expect(typeof book.foil).toBe("string");
      expect(Array.isArray(book.tags)).toBe(true);
    }
  });

  it("contains expected categories", async () => {
    const books = await getBooks();
    const categories = new Set(books.map((b) => b.category));
    expect(categories.has("DevOps")).toBe(true);
    expect(categories.has("Security")).toBe(true);
  });
});
