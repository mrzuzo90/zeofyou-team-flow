import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, Timer, Target, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Home, label: "Inicio", end: true },
  { to: "/identidades", icon: Users, label: "Equipo" },
  { to: "/enfoque", icon: Timer, label: "Focus", center: true },
  { to: "/proyectos", icon: Target, label: "Misiones" },
  { to: "/insights", icon: BarChart3, label: "Insights" },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  const isActive = (to: string, end?: boolean) => (end ? pathname === to : pathname.startsWith(to));

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 lg:hidden"
    >
      <div className="relative mx-auto flex max-w-md items-center justify-around rounded-[2.25rem] dock-glass px-2 py-2">
        {items.map((it) => {
          const active = isActive(it.to, it.end);
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              aria-label={it.label}
              data-cursor="magnet"
              className={cn(
                "ios-tap relative flex flex-col items-center gap-0.5 text-[10px] font-semibold",
                active ? "text-foreground" : "text-muted-foreground",
                it.center && "-translate-y-5",
              )}
            >
              {it.center ? (
                <>
                  <span
                    className={cn(
                      "ios-tap relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-aurora shadow-aurora ring-4 ring-background/80",
                      active && "scale-105",
                    )}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-full bg-gradient-aurora opacity-60 blur-md animate-pulse" />
                    )}
                    <it.icon className="relative h-6 w-6 text-background" strokeWidth={2.6} />
                  </span>
                  <span className={cn("mt-0.5", active ? "text-accent" : "text-muted-foreground")}>{it.label}</span>
                </>
              ) : (
                <span className="relative flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5">
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-2xl bg-accent/15 ring-1 ring-accent/30"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <it.icon
                    className={cn("relative h-5 w-5 transition-transform", active && "scale-110 text-accent")}
                    strokeWidth={2.2}
                  />
                  <span className={cn("relative", active && "text-accent")}>{it.label}</span>
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
