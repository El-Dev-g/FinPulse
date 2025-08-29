"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { GoalTracker } from "@/components/dashboard/goal-tracker";
import { FinancialTips } from "@/components/dashboard/financial-tips";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { open } = useSidebar();

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex-col md:flex">
        <div
          className={cn(
            "flex-1 space-y-4 transition-all duration-300",
            !open && "md:hidden"
          )}
        >
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Dashboard
          </h2>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCards />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SpendingChart />
        </div>
        <div className="lg:col-span-3">
          <FinancialTips />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-3">
          <GoalTracker />
        </div>
      </div>
    </main>
  );
}
