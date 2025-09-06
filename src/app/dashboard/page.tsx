
"use client";

import React, { useState, useEffect } from 'react';
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { GoalTracker } from "@/components/dashboard/goal-tracker";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { Alerts, type AlertData } from "@/components/dashboard/alerts";
import { useAuth } from "@/hooks/use-auth";
import { getBudgets, getTransactions } from '@/lib/db';
import type { Budget, Transaction } from '@/lib/types';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    async function checkBudgetsForAlerts() {
      if (!user) return;
      setLoadingAlerts(true);

      try {
        const budgets = await getBudgets() as Budget[];
        if (budgets.length === 0) {
          setAlerts([]);
          setLoadingAlerts(false);
          return;
        }

        const transactions = await getTransactions() as Transaction[];
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);

        const spendingByCategory: { [key: string]: number } = {};
        transactions.forEach(t => {
          const tDate = new Date(t.date);
          if (t.amount < 0 && isWithinInterval(tDate, { start: currentMonthStart, end: currentMonthEnd })) {
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Math.abs(t.amount);
          }
        });

        const newAlerts: AlertData[] = [];
        budgets.forEach(budget => {
          const spent = spendingByCategory[budget.category] || 0;
          const percentage = (spent / budget.limit) * 100;

          if (percentage > 100) {
            newAlerts.push({
              id: `budget-over-${budget.id}`,
              variant: 'destructive',
              title: 'Budget Exceeded',
              message: `You've gone over your '${budget.category}' budget by $${(spent - budget.limit).toFixed(2)}.`,
            });
          } else if (percentage >= 90) {
            newAlerts.push({
              id: `budget-warning-${budget.id}`,
              variant: 'default',
              title: 'Budget Warning',
              message: `You've used ${percentage.toFixed(0)}% of your '${budget.category}' budget.`,
            });
          }
        });
        setAlerts(newAlerts);
      } catch (error) {
        console.error("Error generating budget alerts:", error);
      } finally {
        setLoadingAlerts(false);
      }
    }

    checkBudgetsForAlerts();
  }, [user]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Welcome, {user?.displayName || "User"}!
          </h2>
          <p className="text-muted-foreground">
            Here's a snapshot of your financial health.
          </p>
        </div>
      </div>

      <Alerts alerts={alerts} loading={loadingAlerts} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <OverviewCards />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingChart />
        </div>
        <div className="lg:col-span-1">
          <GoalTracker />
        </div>
      </div>
      <div>
        <RecentTransactions />
      </div>
    </main>
  );
}
