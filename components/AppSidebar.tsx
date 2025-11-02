import Link from "next/link";
import { usePathname } from "next/navigation";
import SpiralTheStudyBuddy from "@/components/SpiralTheStudyBuddy";
import {
  Home,
  LayoutDashboard,
  Trophy,
  Briefcase,
  FolderKanban,
  Bot,
  Sparkles,
  Zap,
  Users,
  Medal,
  Database,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
const logoImage = "/logo.png";

const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Practice Zone",
    url: "/practice",
    icon: Trophy,
  },
  {
    title: "Matching Zone",
    url: "/matching",
    icon: Sparkles,
  },
  {
    title: "AI Database",
    url: "/ai-database",
    icon: Database,
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: FolderKanban,
  },
];

const communityItems = [
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Medal,
  },
  {
    title: "Community",
    url: "/community",
    icon: Users,
  },
];

const aiItems = [
  {
    title: "Custom GPTs",
    url: "/custom-gpts",
    icon: Bot,
  },
  {
    title: "AI Platform",
    url: "/platform-gpts",
    icon: Sparkles,
  },
];

export function AppSidebar() {
  const location = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" data-testid="sidebar-logo">
          <div className="flex items-center gap-2 py-3 hover-elevate active-elevate-2 rounded-md cursor-pointer">
            <img src={logoImage} alt="TrainingX.Ai Logo" className="h-8 w-auto" />
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                TrainingX.Ai
              </span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4 border-t">
        <SpiralTheStudyBuddy />
      </div>
    </Sidebar>
  );
}
