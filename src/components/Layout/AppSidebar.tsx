import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Target, Timer, BarChart3, Calendar, LogOut, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { XPBar } from "@/components/UI/XPBar";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/", label: "Dinámica", icon: Home, end: true },
  { to: "/identidades", label: "Equipo", icon: Users },
  { to: "/proyectos", label: "Misiones", icon: Target },
  { to: "/enfoque", label: "Focus", icon: Timer },
  { to: "/planificacion", label: "Agenda", icon: Calendar },
  { to: "/insights", label: "Insights", icon: BarChart3 },
];

export const AppSidebar = () => {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-emerald font-display text-lg font-bold text-primary-foreground shadow-glow-emerald">
            Z
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="font-display text-base font-bold leading-none">Zeofyou</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Equipo interno</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => {
                const active = it.end ? pathname === it.to : pathname.startsWith(it.to);
                return (
                  <SidebarMenuItem key={it.to}>
                    <SidebarMenuButton asChild isActive={active} className="h-11">
                      <NavLink to={it.to} className="flex items-center gap-3">
                        <it.icon className="h-5 w-5" />
                        <span>{it.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {profile && (
          <div className="mb-2 rounded-xl bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:hidden">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground truncate">{profile.display_name ?? "Tú"}</span>
              <span className="text-[10px] text-muted-foreground">🔥 {profile.streak_days}</span>
            </div>
            <XPBar xp={profile.xp} compact />
          </div>
        )}
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 group-data-[collapsible=icon]:justify-center" onClick={() => nav("/perfil")}>
            <Settings className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">Perfil</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
