import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Flame, Search, MessageCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeSwitcher } from "@/components/Mode/ModeSwitcher";

type Props = {
  title: string;
  subtitle?: string;
  onOpenPalette?: () => void;
  onOpenCoach?: () => void;
};

export const TopBar = ({ title, subtitle, onOpenPalette, onOpenCoach }: Props) => {
  const { data: profile } = useProfile();
  const nav = useNavigate();

  // Separa "Eyebrow · Title" si viene con punto medio
  const parts = title.split(" · ");
  const showEyebrow = parts.length > 1;
  const eyebrow = showEyebrow ? parts[0] : "";
  const mainTitle = showEyebrow ? parts.slice(1).join(" · ") : title;

  return (
    <header className="sticky top-0 z-30 bg-background/60 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 lg:px-8">
        <SidebarTrigger className="hidden lg:flex" aria-label="Abrir menú lateral" />
        <div className="flex-1 min-w-0">
          {showEyebrow && (
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground truncate">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-lg font-bold leading-tight md:text-xl truncate">{mainTitle}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>

        {onOpenPalette && (
          <button
            onClick={onOpenPalette}
            aria-label="Buscar (⌘K)"
            className="ios-tap inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card"
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        {onOpenCoach && (
          <button
            onClick={onOpenCoach}
            aria-label="Hablar con el coach"
            className="ios-tap inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/70 border border-border/60 text-accent hover:bg-accent/10"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        )}

        {profile && (
          <div className="flex items-center gap-2">
            <ModeSwitcher />
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1.5 text-warning">
              <Flame className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{profile.streak_days}</span>
            </div>
            <button
              onClick={() => nav("/perfil")}
              aria-label="Abrir perfil"
              className="ios-tap relative h-10 w-10 rounded-full p-[2px] bg-gradient-aurora"
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-card font-display text-xs font-bold text-foreground">
                {(profile.display_name ?? "T")[0].toUpperCase()}
              </span>
              <span className="absolute -bottom-1 -right-1 rounded-full bg-background px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-accent border border-border/60">
                Nv{profile.level}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
