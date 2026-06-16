import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { getMode } from "@/lib/modes";
import { MagneticButton } from "@/components/Motion/MagneticButton";

export const ThemeToggle = () => {
  const { theme, mode, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = `Tema ${isDark ? "oscuro" : "claro"} · ${getMode(mode).label}`;

  return (
    <MagneticButton
      onClick={toggleTheme}
      aria-label={label}
      cursorLabel={isDark ? "Claro" : "Oscuro"}
      className="ios-tap relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-card/70 text-foreground/80 hover:text-foreground hover:bg-card"
      title={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ y: -14, opacity: 0, rotate: -40 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 14, opacity: 0, rotate: 40 }}
            transition={{ type: "spring", stiffness: 360, damping: 22 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ y: -14, opacity: 0, rotate: -40 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 14, opacity: 0, rotate: 40 }}
            transition={{ type: "spring", stiffness: 360, damping: 22 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </MagneticButton>
  );
};
