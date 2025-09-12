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
  Bell,
  Sparkles,
  FileText,
  ChevronDown,
  GanttChartSquare,
  Lock,
  Landmark,
  Send,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { ProBadge } from "@/components/pro-badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";


const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/transactions", icon: ArrowRightLeft, label: "Transactions" },
  { href: "/dashboard/recurring", icon: Repeat, label: "Recurring" },
  { href: "/dashboard/transfer", icon: Send, label: "Transfer" },
  { href: "/dashboard/budgets", icon: Wallet, label: "Budgets" },
  { href: "/dashboard/reports", icon: PieChart, label: "Reports", isPro: true },
  { href: "/dashboard/goals", icon: Target, label: "Goals" },
];

const productivitySubMenu = [
    { href: "/dashboard/organizer", icon: ClipboardList, label: "Organizer" },
    { href: "/dashboard/calculator", icon: Calculator, label: "Calculator" },
    { href: "/dashboard/catalog", icon: ListTree, label: "Categories" },
]

const aiSubMenu = [
   { href: "/dashboard/alerts", icon: Bell, label: "Alerts", isPro: true },
  { href: "/dashboard/advisor", icon: Lightbulb, label: "AI Advisor", isPro: true },
];

const settingsNavItems = [
  { href: "/dashboard/link-account", icon: Landmark, label: "Link Account" },
  { href: "/dashboard/billing", icon: FileText, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];


function DashboardSidebar() {
  const pathname = usePathname();
  const { open, setOpen, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = !open;
  const { user, isPro, profile } = useAuth();
  const router = useRouter();
  const [isProductivityOpen, setIsProductivityOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);


  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.push("/signin");
  };

  const renderProFeature = (item: any, isSubItem = false) => {
     const linkContent = (
      <>
        <item.icon />
        <span>{item.label}</span>
        {!isCollapsed && <Lock className="ml-auto" />}
      </>
    );

    const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;

     return (
        <SidebarMenuItem key={item.href}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                  <ButtonComponent
                    asChild
                    disabled
                    className="w-full cursor-not-allowed"
                  >
                  <div>{linkContent}</div>
                  </ButtonComponent>
              </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p>Upgrade to Pro to access this feature</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuItem>
      );
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      open={open}
      onOpenChange={setOpen}
    >
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <Logo isCollapsed={isCollapsed} />
        </Link>
      </SidebarHeader>

      <Separator className="mx-4 mb-2 bg-border/80" />

      <SidebarContent className="p-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isProFeature = item.isPro && !isPro;
            const linkContent = (
              <>
                <item.icon />
                <span>{item.label}</span>
                 {isProFeature && !isCollapsed && <ProBadge />}
              </>
            );

            if (isProFeature) {
              return renderProFeature(item);
            }

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href!) && item.href !== "/dashboard" || pathname === "/dashboard" && item.href === "/dashboard"}
                  tooltip={{ children: item.label }}
                  onClick={handleLinkClick}
                >
                  <Link href={item.href!}>
                    {linkContent}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          
          <Separator className="my-2 mx-2" />

           <Collapsible open={isProductivityOpen} onOpenChange={setIsProductivityOpen}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={{children: "Productivity"}} className="w-full">
                        <GanttChartSquare />
                        <span>Productivity</span>
                        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isProductivityOpen && "rotate-180")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
                 <SidebarMenuSub>
                    {productivitySubMenu.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton asChild isActive={pathname.startsWith(item.href)}>
                                <Link href={item.href} onClick={handleLinkClick}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                    ))}
                 </SidebarMenuSub>
            </CollapsibleContent>
           </Collapsible>
           
           <Collapsible open={isAiOpen} onOpenChange={setIsAiOpen}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={{children: "AI Tools"}} className="w-full">
                        <Sparkles />
                        <span>AI Tools</span>
                        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isAiOpen && "rotate-180")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
                 <SidebarMenuSub>
                    {aiSubMenu.map((item) => {
                      const isProFeatureLocked = item.isPro && !isPro;
                      if (isProFeatureLocked) {
                          const linkContent = (
                            <>
                              <item.icon />
                              <span>{item.label}</span>
                              {!isCollapsed && <ProBadge />}
                            </>
                          );
                          return (
                             <SidebarMenuSubItem key={item.href}>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                      <SidebarMenuSubButton disabled className="cursor-not-allowed w-full">
                                          {linkContent}
                                      </SidebarMenuSubButton>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <p>Upgrade to Pro to access this feature</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </SidebarMenuSubItem>
                          )
                      }
                      return (
                        <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton asChild isActive={pathname.startsWith(item.href)}>
                                <Link href={item.href} onClick={handleLinkClick}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                 </SidebarMenuSub>
            </CollapsibleContent>
           </Collapsible>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          {settingsNavItems.map((item) => (
             <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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
          <SidebarMenuItem>
            <div className="flex items-center gap-3 w-full mt-4">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={profile?.photoURL || user?.photoURL || "https://picsum.photos/100"}
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
  
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
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
            <Link href="/dashboard">
              <Logo />
            </Link>
          </header>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
