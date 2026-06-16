import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { PrivacyShield } from "@/components/UI/PrivacyShield";
import { useCurrentMode } from "@/hooks/useCurrentMode";
import { useModeSuggestion } from "@/hooks/useModeSuggestion";

export const Layout = ({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) => (
  <SidebarProvider defaultOpen>
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
    </div>
  </SidebarProvider>
);

export default Layout;
