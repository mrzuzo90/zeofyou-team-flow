import { ReactNode, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { PrivacyShield } from "@/components/UI/PrivacyShield";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { useModeSuggestion } from "@/hooks/useModeSuggestion";
import { BrainDumpButton } from "@/components/BrainDump/BrainDumpButton";
import { EnergyCheckInPrompt } from "@/components/Energy/EnergyCheckIn";
import { PageSeo, type PageSeoProps } from "@/components/SEO/PageSeo";
import { CommandPalette } from "@/components/CommandPalette/CommandPalette";
import { CoachDrawer } from "@/components/Coach/CoachDrawer";
import { useGlobalHotkeys } from "@/hooks/useGlobalHotkeys";
import { AuroraCanvas } from "@/components/Motion/AuroraCanvas";

type LayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  seo?: PageSeoProps;
};

export const Layout = ({ children, title, subtitle, seo }: LayoutProps) => {
  useCurrentMode();
  useModeSuggestion();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  useGlobalHotkeys({
    onOpenPalette: () => setPaletteOpen(true),
    onOpenCoach: () => setCoachOpen(true),
  });

  return (
    <SidebarProvider defaultOpen>
      {seo && <PageSeo {...seo} />}
      <div className="relative flex min-h-screen w-full">
        <AuroraCanvas />
        <div className="relative z-10 hidden lg:block">
          <AppSidebar />
        </div>
        <div className="relative z-10 flex min-h-screen flex-1 flex-col">
          <TopBar title={title} subtitle={subtitle} onOpenPalette={() => setPaletteOpen(true)} onOpenCoach={() => setCoachOpen(true)} />
          <main className="flex-1 pb-32 lg:pb-8">
            <div className="mx-auto w-full max-w-7xl px-4 py-4 lg:px-8 lg:py-6">{children}</div>
          </main>
          <BottomNav />
        </div>
        <PrivacyShield />
        <BrainDumpButton />
        <EnergyCheckInPrompt />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onOpenCoach={() => setCoachOpen(true)} />
        <CoachDrawer open={coachOpen} onOpenChange={setCoachOpen} />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
