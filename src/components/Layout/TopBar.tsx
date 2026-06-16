import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Flame, Sparkles, Search, MessageCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { XPBar } from "@/components/UI/XPBar";
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
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
        <SidebarTrigger className="hidden lg:flex" aria-label="Abrir menú lateral" />
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-lg font-bold leading-tight md:text-xl truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {onOpenPalette && (
          <button
            onClick={onOpenPalette}
            aria-label="Buscar (⌘K)"
            className="hidden md:inline-flex h-9 items-center gap-2 rounded-full bg-card/60 px-3 text-xs text-muted-foreground hover:bg-card transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Buscar…</span>
            <kbd className="ml-2 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
          </button>
        )}
        {onOpenCoach && (
          <button
            onClick={onOpenCoach}
            aria-label="Hablar con el coach"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        )}
        {profile && (
          <div className="flex items-center gap-2 md:gap-3">
            <ModeSwitcher />
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-warning">
              <Flame className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{profile.streak_days} días</span>
            </div>
            <button onClick={() => nav("/perfil")} aria-label="Abrir perfil" className="group flex items-center gap-2.5 rounded-full bg-card/60 p-1 pr-3 transition-colors hover:bg-card lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-emerald font-display text-xs font-bold text-primary-foreground">
                {(profile.display_name ?? "T")[0].toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Nv {profile.level}</div>
              </div>
            </button>
            <button onClick={() => nav("/perfil")} aria-label="Abrir perfil" className="hidden lg:flex items-center gap-3 rounded-full bg-card/60 px-3 py-1.5 hover:bg-card transition-colors">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="w-28">
                <XPBar xp={profile.xp} compact />
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
