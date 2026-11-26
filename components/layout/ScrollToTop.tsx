"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TbArrowUp } from "react-icons/tb";
import { useT } from "@/components/i18n/lang";

export default function ScrollToTop() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label={t("Kthehu në fillim", "Back to top")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="slant-sm fixed bottom-6 right-6 z-40 flex h-12 w-14 items-center justify-center bg-red text-white shadow-lg transition-transform hover:-translate-y-1"
        >
          <TbArrowUp size={22} aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
