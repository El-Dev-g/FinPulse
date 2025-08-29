"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightLeft,
  Bot,
  LayoutDashboard,
  Settings,
  Target,
  PanelLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/transactions", icon: ArrowRightLeft, label: "Transactions" },
  { href: "/dashboard/goals", icon: Target, label: "Goals" },
  { href: "/dashboard/ai-advisor", icon: Bot, label: "AI Advisor" },
];

function DashboardSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const isCollapsed = !open;

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      open={open}
      onOpenChange={setOpen}
    >
      <SidebarHeader className="p-4">
        <Logo isCollapsed={isCollapsed} />
      </SidebarHeader>

      <Separator className="mx-4 mb-2 bg-border/80" />
      
      <SidebarContent className="p-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard/settings"}
              tooltip={{ children: "Settings" }}
            >
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <div className="flex items-center gap-3 w-full mt-4">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://picsum.photos/100" alt="User" data-ai-hint="person avatar"/>
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">User</span>
                        <span className="text-xs text-muted-foreground">user@finpulse.com</span>
                    </div>
                )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <SidebarInset className="bg-background flex-1">
          <header className="p-4 flex items-center gap-4 md:hidden border-b">
            <SidebarTrigger>
              <PanelLeft />
            </SidebarTrigger>
            <Logo />
          </header>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
