import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  personaCSSVars,
  personaCardClass,
  resolvePersona,
  type IdentityLike,
  type PersonaPreset,
} from "@/lib/personas";

interface Props extends HTMLAttributes<HTMLDivElement> {
  identity?: IdentityLike | null;
  persona?: PersonaPreset;
  /** Capa base. "glass" hereda glassmorphism del proyecto. */
  base?: "glass" | "bare";
}

/**
 * Envoltorio que aplica la "personalidad visual" de una identidad:
 * acento, gradiente, textura y borde según su arquetipo.
 */
export const PersonaSurface = forwardRef<HTMLDivElement, Props>(
  ({ identity, persona, base = "glass", className, style, children, ...rest }, ref) => {
    const p = persona ?? resolvePersona(identity ?? null);
    return (
      <div
        ref={ref}
        style={{ ...personaCSSVars(p), ...(style ?? {}) }}
        className={cn(
          base === "glass" && "glass-card",
          "rounded-[1.75rem]",
          personaCardClass(p),
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
PersonaSurface.displayName = "PersonaSurface";
