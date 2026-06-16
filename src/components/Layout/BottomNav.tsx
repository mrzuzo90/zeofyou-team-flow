import { NavLink } from "react-router-dom";
import { Home, Users, Timer, Target, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Home, label: "Inicio", end: true },
  { to: "/identidades", icon: Users, label: "Equipo" },
  { to: "/enfoque", icon: Timer, label: "Focus", center: true },
  { to: "/proyectos", icon: Target, label: "Misiones" },
  { to: "/insights", icon: BarChart3, label: "Insights" },
];

export const BottomNav = () => (
  <nav
    aria-label="Navegación principal"
    className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 lg:hidden"
  >
    <div className="mx-auto flex max-w-md items-center justify-around rounded-[2.25rem] dock-glass px-2 py-2">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          aria-label={it.label}
          className={({ isActive }) =>
            cn(
              "ios-tap relative flex flex-col items-center gap-0.5 text-[10px] font-semibold",
              isActive ? "text-foreground" : "text-muted-foreground",
              it.center && "-translate-y-5",
            )
          }
        >
          {({ isActive }) =>
            it.center ? (
              <>
                <span
                  className={cn(
                    "ios-tap flex h-14 w-14 items-center justify-center rounded-full bg-gradient-aurora shadow-aurora ring-4 ring-background/80",
                    isActive && "scale-105",
                  )}
                >
                  <it.icon className="h-6 w-6 text-background" strokeWidth={2.6} />
                </span>
                <span className={cn("mt-0.5", isActive ? "text-accent" : "text-muted-foreground")}>{it.label}</span>
              </>
            ) : (
              <span
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl px-2.5 py-1.5 transition-colors",
                  isActive && "bg-accent/10 text-accent",
                )}
              >
                <it.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} strokeWidth={2.2} />
                <span>{it.label}</span>
              </span>
            )
          }
        </NavLink>
      ))}
    </div>
  </nav>
);
