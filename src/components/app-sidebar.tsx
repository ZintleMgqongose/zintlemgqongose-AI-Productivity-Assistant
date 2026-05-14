import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Mail, FileText, ListTodo, Search, MessageSquare, Sparkles } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Meeting Notes", url: "/meeting-notes", icon: FileText },
  { title: "Task Planner", url: "/tasks", icon: ListTodo },
  { title: "Research", url: "/research", icon: Search },
  { title: "AI Chatbot", url: "/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[12px] text-white shrink-0 bg-purple-500/20 border border-purple-400/30 backdrop-blur-xl shadow-[0_0_20px_rgba(167,139,250,0.35)]">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white tracking-wide">AURA AI</span>
              <span className="text-xs text-[#94A3B8]">By CAPACITI</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={
                        active
                          ? "data-[active=true]:bg-purple-500/20 data-[active=true]:text-white border-l-2 border-[#a78bfa] shadow-[0_0_18px_rgba(167,139,250,0.4)] hover:bg-purple-500/30 hover:text-white"
                          : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                      }
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${active ? "text-[#d8b4fe]" : "text-[#94A3B8]"}`} strokeWidth={1.5} />
                        {!collapsed && <span className={active ? "text-white font-medium" : ""}>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}