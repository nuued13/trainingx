import Link from "next/link";
import { usePathname } from "next/navigation";
import SpiralTheStudyBuddy from "@/components/common/SpiralTheStudyBuddy";
import { cn } from "@/lib/utils";
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
  Swords,
  Target,
  Palette,
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
const logoImage = "/logo.webp";

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

const engagementItems = [
  {
    title: "Duels",
    url: "/duels",
    icon: Swords,
  },
  {
    title: "Quests",
    url: "/quests",
    icon: Target,
  },
  {
    title: "Prompt Arena",
    url: "/prompt-arena",
    icon: Zap,
  },
  {
    title: "Creator Studio",
    url: "/creator",
    icon: Palette,
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
    <Sidebar className="bg-slate-800 border-r border-slate-700">
      <SidebarHeader className="border-b border-slate-700 bg-slate-800">
        <Link href="/" data-testid="sidebar-logo">
          <div className="flex items-center gap-2 py-3 px-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
            <img
              src={logoImage}
              alt="TrainingX.Ai Logo"
              className="h-8 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">
                TrainingX.Ai
              </span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-slate-800">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "text-slate-400 hover:text-white hover:bg-white/5 transition-colors",
                      location === item.url && "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">Engagement</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {engagementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "text-slate-400 hover:text-white hover:bg-white/5 transition-colors",
                      location === item.url && "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">Community</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "text-slate-400 hover:text-white hover:bg-white/5 transition-colors",
                      location === item.url && "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "text-slate-400 hover:text-white hover:bg-white/5 transition-colors",
                      location === item.url && "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
