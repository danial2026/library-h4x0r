"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Book } from "@/types/book";
import { BookCard } from "@/components/ui/BookCard";

interface Props {
  books: Book[];
}

export function BookShelf({ books }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const categories = useMemo(() => {
    const cats = new Set(books.map((b) => b.category));
    return Array.from(cats).sort();
  }, [books]);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        (b.author && b.author.toLowerCase().includes(search.toLowerCase())) ||
        b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === "all" || b.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setFocusedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        e.preventDefault();
      }
    },
    [filtered.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [search, category]);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pb-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-status text-text-secondary uppercase tracking-[0.12em]">
            {filtered.length} / {books.length} volumes
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white-30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search volumes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52 h-9 pl-9 pr-4 bg-surface border border-white-10 rounded-input text-body-strong text-text-primary placeholder:text-white-30 focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategory("all")}
              className={`text-[0.65rem] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                category === "all"
                  ? "bg-accent text-background border-accent"
                  : "bg-surface text-text-secondary border-white-10 hover:border-white-30"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-[0.65rem] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                  category === c
                    ? "bg-accent text-background border-accent"
                    : "bg-surface text-text-secondary border-white-10 hover:border-white-30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-text-secondary">
          <svg
            className="w-12 h-12 mb-4 opacity-30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <p className="text-body-strong uppercase tracking-[0.15em]">No volumes found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 justify-items-center">
            {filtered.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                index={i}
                isFocused={i === focusedIndex}
              />
            ))}
          </div>
          <p className="text-center mt-8 text-[0.7rem] text-text-primary tracking-[0.08em]">
            An alternative front end for{" "}
            <a
              href="https://h4x0r.icu/library/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white-30 hover:decoration-white transition-colors"
            >
              h4x0r.icu/library
            </a>{" "}
            — a minimal library site for browsing downloaded books.
          </p>
        </>
      )}
    </div>
  );
}
