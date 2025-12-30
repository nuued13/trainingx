"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  MessageCircleHeart,
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
    title: "AI Career Coach",
    url: "/ai-career-coach",
    icon: Bot,
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
  // {
  //   title: "Quests",
  //   url: "/quests",
  //   icon: Target,
  // },
  // {
  //   title: "Creator Studio",
  //   url: "/creator",
  //   icon: Palette,
  // },
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
    title: "Spiral Study Buddy",
    url: "/spiral-the-study-buddy",
    icon: Bot,
  },
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

const careItems = [
  {
    title: "Feedback",
    url: "/feedback",
    icon: MessageCircleHeart,
  },
];

export function AppSidebar() {
  const location = usePathname();

  const renderItems = (items: typeof mainItems) => {
    return items.map((item) => {
      const isActive = location === item.url;
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
            className={cn(
              "h-10 px-2 transition-all duration-200 rounded-xl border-2 border-transparent",
              "hover:bg-slate-100 hover:border-slate-200  font-semibold",
              isActive
                ? "bg-blue-50 text-blue-500 border-blue-200 border-b-4 font-extrabold"
                : "text-slate-500"
            )}
          >
            <Link href={item.url} className="flex items-center gap-1">
              <item.icon
                className={cn(
                  "w-6 h-6 stroke-[2.5]",
                  isActive ? "text-blue-500" : "text-slate-400"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  isActive ? "text-blue-500" : "text-slate-500"
                )}
              >
                {item.title}
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <Sidebar className="bg-white border-r-2 border-slate-200 px-0 mx-0">
      <SidebarHeader className="border-b-2 border-slate-100 bg-white px-2 py-4">
        <Link href="/" data-testid="sidebar-logo">
          <div className="flex items-center gap-3 px-2 cursor-pointer group">
            <img
              src={logoImage}
              alt="TrainingX.Ai Logo"
              className="h-10 w-auto transition-transform group-hover:scale-110 duration-200"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-slate-700 tracking-tight group-hover:text-primary transition-colors">
                TrainingX
              </span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-white px-1 py-0 gap-3">
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(mainItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-0">
          <SidebarGroupLabel className="text-slate-400 text-xs font-black uppercase tracking-widest px-2 mb-0">
            Engagement
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(engagementItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-0">
          <SidebarGroupLabel className="text-slate-400 text-xs font-black uppercase tracking-widest px-2 mb-0">
            Community
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(communityItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-0">
          <SidebarGroupLabel className="text-slate-400 text-xs font-black uppercase tracking-widest px-2 mb-0">
            AI Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(aiItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-0">
          <SidebarGroupLabel className="text-slate-400 text-xs font-black uppercase tracking-widest px-2 mb-0">
            Care
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(careItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
