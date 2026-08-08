"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Book } from "@/types/book";
import { cn } from "@/lib/utils";
import { BookOpenIcon } from "@/components/ui/BookOpenIcon";

interface Props {
  book: Book;
  index: number;
  isFocused?: boolean;
}

export function BookCard({ book, index, isFocused = false }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const coverRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (coverRef.current?.complete) setCoverLoaded(true);
  }, []);

  useEffect(() => {
    if (isFocused) {
      const el = document.querySelector(`[data-book-id="${book.id}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isFocused, book.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.04,
        ease: [0.2, 0.72, 0.24, 1],
      }}
      className="perspective-1000"
    >
      <Link
        href={`/book/${encodeURIComponent(book.id)}`}
        className="block"
        data-book-id={book.id}
      >
        <motion.div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{
            y: -6,
            rotateY: -3,
            transition: { duration: 0.35, ease: [0.2, 0.72, 0.24, 1] },
          }}
          animate={
            isFocused
              ? { y: -6, rotateY: -3, borderColor: "rgba(255,255,255,0.35)" }
              : { y: 0, rotateY: 0, borderColor: "rgba(255,255,255,0.1)" }
          }
          transition={{ duration: 0.3 }}
          className={cn(
            "relative group cursor-pointer",
            "rounded-sm border",
            "book-shadow",
            "overflow-hidden",
            "transition-shadow duration-300"
          )}
          style={{
            backgroundColor: book.color,
            height: "320px",
            width: "220px",
          }}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-[6px] opacity-25"
            style={{
              background: `linear-gradient(90deg, ${book.foil}33, ${book.foil}11)`,
            }}
          />

          <div
            className="absolute inset-[12px] rounded-sm border opacity-40"
            style={{ borderColor: `${book.foil}44` }}
          />

          {book.cover ? (
            <>
              {!coverLoaded && <div className="absolute inset-0 cover-shimmer" />}
              <img
                ref={coverRef}
                src={book.cover}
                alt={book.title}
                loading={index < 12 ? "eager" : "lazy"}
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
                style={{ boxShadow: `inset 0 0 60px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)` }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
              <div
                className="w-14 h-14 rounded-full border flex items-center justify-center"
                style={{ borderColor: `${book.foil}88`, color: book.foil }}
              >
                <BookOpenIcon className="w-7 h-7" strokeWidth={1.5} />
              </div>

              <div className="space-y-2">
                <span
                  className="block text-[0.5rem] uppercase tracking-[0.18em] font-semibold"
                  style={{ color: `${book.foil}aa` }}
                >
                  {book.category}
                </span>

                <h3
                  className="text-sm font-semibold leading-tight tracking-[-0.02em] line-clamp-3"
                  style={{ color: book.foil }}
                >
                  {book.title}
                </h3>

                {book.author && (
                  <span
                    className="block text-[0.58rem]"
                    style={{ color: `${book.foil}88` }}
                  >
                    {book.author}
                  </span>
                )}
              </div>

              <div
                className="mt-auto pt-3 border-t w-full"
                style={{ borderColor: `${book.foil}22` }}
              >
                <span
                  className="text-[0.48rem] uppercase tracking-[0.14em]"
                  style={{ color: `${book.foil}66` }}
                >
                  {book.format} · {book.tags[0] || book.category}
                </span>
              </div>
            </div>
          )}

          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: book.foil }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isHovered || isFocused ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.72, 0.24, 1] }}
          />

          {isFocused && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 rounded-sm"
                style={{ boxShadow: `0 0 0 2px ${book.foil}44` }}
              />
            </motion.div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
}
