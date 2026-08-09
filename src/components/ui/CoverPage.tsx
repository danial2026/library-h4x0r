"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Book } from "@/types/book";
import { BookShelf } from "@/components/books/BookShelf";
import { BookOpenIcon } from "@/components/ui/BookOpenIcon";

interface Props {
  books: Book[];
}

export function CoverPage({ books }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const coverOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const coverScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.96]);
  const titleY = useTransform(scrollYProgress, [0, 0.4], [0, -60]);
  const frameOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const scrollHint = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  return (
    <div ref={containerRef} className="relative bg-background">
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-4 sm:inset-6 border border-white-10 pointer-events-none z-10"
          style={{ opacity: frameOpacity }}
        />

        <motion.div
          className="absolute inset-0 z-0"
          style={{ opacity: coverOpacity, scale: coverScale }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white-5 to-transparent" />
        </motion.div>

        <motion.div
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
          style={{ opacity: coverOpacity, y: titleY }}
        >
          <motion.div
            className="mb-8 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.72, 0.24, 1] }}
          >
            <div className="w-14 h-14 rounded-full border border-white-20 flex items-center justify-center text-white">
              <BookOpenIcon className="w-7 h-7" />
            </div>
          </motion.div>

          <motion.p
            className="text-status text-text-secondary uppercase tracking-[0.2em] mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.72, 0.24, 1] }}
          >
            Edition 01 · 2026
          </motion.p>

          <motion.h1
            className="font-sans text-[4rem] sm:text-[6.5rem] md:text-[9rem] font-light tracking-[-0.07em] leading-[0.82]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.2, 0.72, 0.24, 1] }}
          >
            Library
          </motion.h1>

          <motion.div
            className="mt-14 flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease: [0.2, 0.72, 0.24, 1] }}
          >
            <Link
              href="#shelf"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-accent text-background rounded-button text-button uppercase hover:opacity-90 transition-opacity"
            >
              Browse Collection
              <svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3v10M3 8l5 5 5-5" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-0 right-0 z-10 flex justify-center"
          style={{ opacity: scrollHint }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-white-30"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-6 left-6 sm:left-8 text-[0.6rem] text-text-secondary uppercase tracking-[0.15em] z-10">
          <a
            href="https://h4x0r.icu/library/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            An alternative front-end for h4x0r.icu/library
          </a>
        </div>
      </section>

      <section id="shelf" className="relative z-10 min-h-screen pb-24 bg-background">
        <BookShelf books={books} />
      </section>
    </div>
  );
}
