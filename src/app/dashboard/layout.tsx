// src/app/dashboard/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  LayoutDashboard,
  Settings,
  Target,
  PanelLeft,
  LogOut,
  Loader,
  Calculator,
  Wallet,
  PieChart,
  ClipboardList,
  Repeat,
  ListTree,
  Lightbulb,
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
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    href: "/dashboard/expenses",
    icon: ArrowRightLeft,
    label: "Expenses",
  },
  { href: "/dashboard/recurring", icon: Repeat, label: "Recurring" },
  { href: "/dashboard/goals", icon: Target, label: "Goals" },
  { href: "/dashboard/budgets", icon: Wallet, label: "Budgets" },
  { href: "/dashboard/reports", icon: PieChart, label: "Reports" },
  { href: "/dashboard/organizer", icon: ClipboardList, label: "Organizer" },
  { href: "/dashboard/catalog", icon: ListTree, label: "Categories" },
  { href: "/dashboard/calculator", icon: Calculator, label: "Calculator" },
  { href: "/dashboard/advisor", icon: Lightbulb, label: "AI Advisor" },
];

function DashboardSidebar() {
  const pathname = usePathname();
  const { open, setOpen, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = !open;
  const { user } = useAuth();
  const router = useRouter();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.push("/signin");
  };

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
                isActive={pathname.startsWith(item.href) && item.href !== "/dashboard" || pathname === "/dashboard" && item.href === "/dashboard"}
                tooltip={{ children: item.label }}
                onClick={handleLinkClick}
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
              onClick={handleLinkClick}
            >
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 w-full mt-4">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.photoURL || "https://picsum.photos/100"}
                  alt={user?.displayName || "User"}
                  data-ai-hint="person avatar"
                />
                <AvatarFallback>
                  {user?.email?.[0].toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold truncate">
                    {user?.displayName || user?.email}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </div>
              )}
            </div>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start mt-2"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2" />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
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
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // router.push("/signin");
    return null;
  }
  
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
