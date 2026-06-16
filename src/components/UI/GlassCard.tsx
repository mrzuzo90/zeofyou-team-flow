import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "framer-motion";

interface Props extends HTMLMotionProps<"div"> {
  variant?: "default" | "strong";
  glow?: "emerald" | "blue" | "none";
}

export const GlassCard = ({ className, variant = "default", glow = "none", children, ...props }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    className={cn(
      variant === "strong" ? "glass-strong" : "glass-card",
      "rounded-2xl",
      glow === "emerald" && "glow-emerald",
      glow === "blue" && "glow-blue",
      className,
    )}
    {...props}
  >
    {children}
  </motion.div>
);
