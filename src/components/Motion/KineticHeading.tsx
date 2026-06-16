import { motion, Variants } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  splitBy?: "char" | "word";
};

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const child: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function KineticHeading({
  text,
  className,
  delay = 0,
  stagger = 0.035,
  as = "h1",
  splitBy = "char",
}: Props) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const parts = splitBy === "word" ? text.split(" ") : Array.from(text);

  return (
    <Tag
      aria-label={text}
      className={cn("inline-flex flex-wrap", className)}
      variants={container(stagger, delay)}
      initial="hidden"
      animate="show"
    >
      {parts.map((p, i) => (
        <span key={i} aria-hidden className="relative inline-block overflow-hidden leading-[1.05]">
          <motion.span variants={child} className="inline-block">
            {p === " " ? "\u00A0" : p}
          </motion.span>
          {splitBy === "word" && i < parts.length - 1 && <span>{"\u00A0"}</span>}
        </span>
      ))}
    </Tag>
  );
}
