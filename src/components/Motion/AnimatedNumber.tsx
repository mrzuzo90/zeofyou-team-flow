import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
};

export function AnimatedNumber({ value, duration = 1.2, className, suffix, prefix, decimals = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const fromRef = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    if (reduced) {
      ref.current.textContent = `${prefix ?? ""}${value.toFixed(decimals)}${suffix ?? ""}`;
      return;
    }
    if (!inView) return;
    const controls = animate(fromRef.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${prefix ?? ""}${v.toFixed(decimals)}${suffix ?? ""}`;
      },
    });
    fromRef.current = value;
    return () => controls.stop();
  }, [value, inView, reduced, duration, suffix, prefix, decimals]);

  return <span ref={ref} className={className}>{`${prefix ?? ""}${reduced ? value.toFixed(decimals) : "0"}${suffix ?? ""}`}</span>;
}
