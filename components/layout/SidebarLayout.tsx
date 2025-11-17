import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const style = {
    "--sidebar-width": "13rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-3 border-b border-slate-700 bg-slate-800">
            <SidebarTrigger 
              data-testid="button-sidebar-toggle" 
              className="text-slate-400 hover:text-white hover:bg-white/5"
            />
            {/* Future: Add user stats here (Level, XP, etc.) */}
          </header>
          <main className="flex-1 overflow-auto bg-slate-900">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
