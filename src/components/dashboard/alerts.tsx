
// src/components/dashboard/alerts.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader, TriangleAlert } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { getBudgets, getTransactions } from '@/lib/db';
import type { Budget, Transaction } from '@/lib/types';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export type AlertData = {
  id: string;
  variant: "default" | "destructive";
  title: string;
  message: string;
};

interface AlertsProps {}

export function Alerts({}: AlertsProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkBudgetsForAlerts() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const budgets = await getBudgets() as Budget[];
        if (budgets.length === 0) {
          setAlerts([]);
          setLoading(false);
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
        setLoading(false);
      }
    }

    checkBudgetsForAlerts();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Checking for alerts...</span>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null; // Don't render anything if there are no alerts
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const Icon = alert.variant === 'destructive' ? TriangleAlert : Info;
        return (
          <Alert key={alert.id} variant={alert.variant}>
            <Icon className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
