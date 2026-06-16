import { ButtonHTMLAttributes, ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion, useIsTouch } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  strength?: number;
  cursorLabel?: string;
};

export function MagneticButton({ children, className, strength = 0.35, cursorLabel, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  return (
    <motion.button
      ref={ref}
      data-cursor="magnet"
      data-cursor-label={cursorLabel}
      onMouseMove={(e) => {
        if (reduced || touch) return;
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={cn("relative", className)}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}
