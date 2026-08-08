"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpenIcon } from "@/components/ui/BookOpenIcon";

const MIN_DISPLAY_MS = 1100;
const SAFETY_MS = 3000;

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = performance.now();
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const hide = () => {
      if (settled) return;
      settled = true;
      const remaining = MIN_DISPLAY_MS - (performance.now() - start);
      timer = setTimeout(() => setVisible(false), Math.max(0, remaining));
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(hide);
    }

    const safety = setTimeout(hide, SAFETY_MS);

    return () => {
      window.removeEventListener("load", hide);
      clearTimeout(safety);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.72, 0.24, 1] }}
          aria-hidden={!visible}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.2, 0.72, 0.24, 1] }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full border border-white-20 flex items-center justify-center text-white mb-6">
              <BookOpenIcon className="w-8 h-8" strokeWidth={1.5} />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0.72, 0.24, 1] }}
              className="font-sans text-3xl sm:text-4xl font-light tracking-[-0.04em] mb-3"
            >
              Library
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="w-40 h-px splash-bar mb-4"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="text-status text-text-secondary uppercase tracking-[0.2em] text-[0.6rem]"
            >
              Gathering volumes
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}