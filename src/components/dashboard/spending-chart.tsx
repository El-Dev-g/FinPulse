// src/components/dashboard/spending-chart.tsx
"use client";

import React, { useMemo } from "react";
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
import type { Transaction } from "@/lib/types";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface SpendingChartProps {
    transactions: Transaction[];
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  const spendingData = useMemo(() => {
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
    
    return Object.entries(categorySpending).map(([category, amount]) => ({
        category,
        amount,
        fill: `var(--color-${category.toLowerCase().replace(' ', '')})`
    })).sort((a,b) => b.amount - a.amount);
  }, [transactions]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending This Month</CardTitle>
        <CardDescription>
          A breakdown of your expenses by category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {spendingData.length > 0 ? (
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
