// src/components/dashboard/spending-chart.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { spendingChartConfig } from "@/lib/types";
import { getTransactions } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import type { Transaction } from "@/lib/types";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Loader } from "lucide-react";

export function SpendingChart() {
  const { user } = useAuth();
  const [spendingData, setSpendingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateSpending = async () => {
      if (!user) return;
      setLoading(true);
      const transactions = await getTransactions() as Transaction[];

      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);

      const categorySpending: { [key: string]: number } = {};

      transactions.forEach((t) => {
        const tDate = new Date(t.date);
        if (
          t.amount < 0 &&
          isWithinInterval(tDate, {
            start: currentMonthStart,
            end: currentMonthEnd,
          })
        ) {
          const expense = Math.abs(t.amount);
          categorySpending[t.category] =
            (categorySpending[t.category] || 0) + expense;
        }
      });
      
      const chartData = Object.entries(categorySpending).map(([category, amount]) => ({
          category,
          amount,
          fill: `var(--color-${category.toLowerCase().replace(' ', '')})`
      })).sort((a,b) => b.amount - a.amount);

      setSpendingData(chartData);
      setLoading(false);
    };

    calculateSpending();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending This Month</CardTitle>
        <CardDescription>
          A breakdown of your expenses by category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
           <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : spendingData.length > 0 ? (
        <ChartContainer config={spendingChartConfig} className="h-64 w-full">
          <ResponsiveContainer>
            <BarChart accessibilityLayer data={spendingData}>
              <XAxis
                dataKey="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickFormatter={(value) => `$${value}`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="amount" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
         ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                No spending data for this month.
            </div>
         )}
      </CardContent>
    </Card>
  );
}
