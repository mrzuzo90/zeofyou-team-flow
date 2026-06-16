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
  <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-xl lg:hidden">
    <div className="safe-bottom mx-auto flex max-w-md items-end justify-around px-2 pt-2">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            cn(
              "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              it.center && "-translate-y-3",
            )
          }
        >
          {({ isActive }) =>
            it.center ? (
              <>
                <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-emerald shadow-glow-emerald transition-transform", isActive && "scale-110")}>
                  <it.icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.4} />
                </span>
                <span className="mt-0.5">{it.label}</span>
              </>
            ) : (
              <>
                <it.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} strokeWidth={2.2} />
                <span>{it.label}</span>
              </>
            )
          }
        </NavLink>
      ))}
    </div>
  </nav>
);
