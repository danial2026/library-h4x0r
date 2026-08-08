"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Book } from "@/types/book";
import { BookOpenIcon } from "@/components/ui/BookOpenIcon";
import { assetUrl, cn } from "@/lib/utils";

interface Props {
  book: Book;
}

const pdfUrl = (filename: string) => assetUrl(`/books/${encodeURI(filename)}`);

export function BookDetailPanel({ book }: Props) {
  const [isReading, setIsReading] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const coverRef = useRef<HTMLImageElement | null>(null);
  const isPdf = book.format === "pdf";

  useEffect(() => {
    if (coverRef.current?.complete) setCoverLoaded(true);
  }, []);

  const openBook = useCallback(() => {
    if (isPdf) setIsReading(true);
    else window.open(book.path, "_blank");
  }, [isPdf, book.path]);

  const closeReader = useCallback(() => setIsReading(false), []);

  useEffect(() => {
    if (!isReading) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReader();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isReading, closeReader]);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-30 px-6 py-5">
        {isReading ? (
          <button
            onClick={closeReader}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 4l-4 4 4 4" /></svg>
            <span className="text-status uppercase tracking-[0.15em]">Close book</span>
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors group"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 4l-4 4 4 4" /></svg>
            <span className="text-status uppercase tracking-[0.15em] group-hover:tracking-[0.2em] transition-all">Library</span>
          </Link>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isReading ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-5xl mx-auto px-6 pt-28 pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.72, 0.24, 1] }}
                  className="flex items-start justify-center lg:justify-end"
                >
                  <motion.div
                    className="relative perspective-1000 cursor-pointer"
                    whileHover={{ rotateY: isPdf ? -6 : 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={openBook}
                  >
                    <div
                      className="relative w-[260px] sm:w-[320px] rounded-sm border border-white-10 book-shadow overflow-hidden"
                      style={{ aspectRatio: "3/4", backgroundColor: book.color }}
                    >
                      {book.cover ? (
                        <>
                          {!coverLoaded && <div className="absolute inset-0 cover-shimmer" />}
                          <img
                            ref={coverRef}
                            src={book.cover}
                            alt={book.title}
                            decoding="async"
                            draggable={false}
                            onLoad={() => setCoverLoaded(true)}
                            onError={() => setCoverLoaded(true)}
                            className={cn(
                              "absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500",
                              coverLoaded ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div
                            className="absolute inset-0"
                            style={{ boxShadow: `inset 0 0 80px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)` }}
                          />
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-[14px] rounded-sm border opacity-40" style={{ borderColor: `${book.foil}44` }} />
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
                            <div className="w-16 h-16 rounded-full border flex items-center justify-center" style={{ borderColor: `${book.foil}88`, color: book.foil }}>
                              <BookOpenIcon className="w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <span className="text-[0.55rem] uppercase tracking-[0.18em] font-semibold" style={{ color: `${book.foil}aa` }}>{book.category}</span>
                            <h2 className="text-lg font-semibold tracking-[-0.03em] leading-tight" style={{ color: book.foil }}>{book.title}</h2>
                            {book.author && <span className="text-xs opacity-60" style={{ color: book.foil }}>{book.author}</span>}
                          </div>
                        </>
                      )}
                      <div className="absolute right-0 top-0 bottom-0 w-[6px] opacity-20" style={{ background: book.foil }} />
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.72, 0.24, 1] }}
                  className="flex flex-col justify-center"
                >
                  <p className="text-status text-text-secondary uppercase tracking-[0.15em] mb-3">
                    {book.category} · {book.format.toUpperCase()}
                  </p>
                  <h1 className="text-[2.8rem] sm:text-[4rem] md:text-[5.5rem] font-light tracking-[-0.06em] leading-[0.85] mb-6">
                    {book.title}
                  </h1>
                  {book.author && <p className="text-base text-text-secondary mb-5">by {book.author}</p>}
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary max-w-lg mb-8">{book.description}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {book.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-surface border border-white-10 rounded text-[0.6rem] uppercase tracking-[0.1em] text-text-secondary">{tag}</span>
                    ))}
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-7 border-t border-divider">
                    <div>
                      <dt className="text-status text-text-secondary uppercase tracking-[0.12em] mb-1">Format</dt>
                      <dd className="text-body-strong">{book.format.toUpperCase()}</dd>
                    </div>
                    <div>
                      <dt className="text-status text-text-secondary uppercase tracking-[0.12em] mb-1">File</dt>
                      <dd className="text-body-strong text-text-secondary text-xs truncate">{book.filename}</dd>
                    </div>
                    <div>
                      <dt className="text-status text-text-secondary uppercase tracking-[0.12em] mb-1">Category</dt>
                      <dd className="text-body-strong">{book.category}</dd>
                    </div>
                    {book.pages && (
                      <div>
                        <dt className="text-status text-text-secondary uppercase tracking-[0.12em] mb-1">Pages</dt>
                        <dd className="text-body-strong">{book.pages}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      onClick={openBook}
                      className="inline-flex items-center gap-2 px-7 py-3 bg-accent text-background rounded-button text-button uppercase hover:bg-white-90 transition-colors"
                    >
                      <BookOpenIcon className="w-4 h-4" strokeWidth={2} />
                      {isPdf ? "Read" : "Download"}
                    </button>
                    <a
                      href={pdfUrl(book.filename)}
                      download
                      className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-button text-button uppercase border border-white-10 hover:border-white-30 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <path d="M7 10l5 5 5-5" />
                        <path d="M12 15V3" />
                      </svg>
                      Download
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-background shrink-0 z-10">
              <button
                onClick={closeReader}
                className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 4l-4 4 4 4" /></svg>
                <span className="text-status uppercase tracking-[0.15em]">Close</span>
              </button>
              <span className="text-status text-text-secondary uppercase tracking-[0.12em] truncate max-w-[40%]">
                {book.title}
              </span>
              <a
                href={pdfUrl(book.filename)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="text-status uppercase tracking-[0.15em]">Fullscreen</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
              </a>
            </div>

            <iframe
              src={pdfUrl(book.filename)}
              title={book.title}
              className="flex-1 w-full bg-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}