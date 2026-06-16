import { ReactNode } from "react";
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

type LayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  seo?: PageSeoProps;
};

export const Layout = ({ children, title, subtitle, seo }: LayoutProps) => {
  useCurrentMode();
  useModeSuggestion();
  return (
    <SidebarProvider defaultOpen>
      {seo && <PageSeo {...seo} />}
      <div className="flex min-h-screen w-full">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar title={title} subtitle={subtitle} />
          <main className="flex-1 pb-24 lg:pb-8">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">{children}</div>
          </main>
          <BottomNav />
        </div>
        <PrivacyShield />
        <BrainDumpButton />
        <EnergyCheckInPrompt />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
