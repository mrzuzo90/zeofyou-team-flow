import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const KEY = "zeofyou:intro:v2";

export function IntroLoader() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    setShow(true);
    sessionStorage.setItem(KEY, "1");
    const t = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(t);
  }, [reduced]);

  const chars = "ZEOFYOU".split("");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
          aria-hidden
        >
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, times: [0, 0.3, 0.7, 1] }}
            style={{
              background:
                "radial-gradient(60% 60% at 20% 30%, hsl(252 92% 76% / 0.35), transparent 60%), radial-gradient(60% 60% at 80% 70%, hsl(142 71% 58% / 0.3), transparent 60%)",
              filter: "blur(40px)",
            }}
          />
          <div className="relative flex overflow-hidden">
            {chars.map((c, i) => (
              <motion.span
                key={i}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-110%", opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 * i }}
                className="font-display text-5xl font-black tracking-[0.18em] gradient-text md:text-7xl"
              >
                {c}
              </motion.span>
            ))}
          </div>
          <motion.div
            className="absolute bottom-12 h-px bg-gradient-aurora"
            initial={{ width: 0 }}
            animate={{ width: "40%" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
