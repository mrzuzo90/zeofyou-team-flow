import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "framer-motion";

interface Props extends HTMLMotionProps<"div"> {
  variant?: "default" | "strong";
  glow?: "emerald" | "blue" | "aurora" | "none";
  halo?: boolean;
}

export const GlassCard = ({ className, variant = "default", glow = "none", halo = false, children, ...props }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={cn(
      variant === "strong" ? "glass-strong" : "glass-card",
      "rounded-[1.75rem]",
      glow === "emerald" && "glow-emerald",
      glow === "blue" && "glow-blue",
      glow === "aurora" && "glow-aurora",
      halo && "halo-aurora",
      className,
    )}
    {...props}
  >
    {children}
  </motion.div>
);
