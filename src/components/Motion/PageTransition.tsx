import { ReactNode } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const variants: Variants = {
  initial: { clipPath: "inset(0 0 100% 0)" },
  animate: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } },
  exit: { clipPath: "inset(100% 0 0 0)", transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] } },
};

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 } }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
        className="relative"
      >
        {children}
        <motion.div
          variants={variants}
          initial="initial"
          animate="exit"
          exit="animate"
          className="pointer-events-none fixed inset-0 z-[60] bg-gradient-aurora opacity-40 mix-blend-overlay"
          aria-hidden
        />
      </motion.div>
    </AnimatePresence>
  );
}
