// src/app/dashboard/reports/page.tsx
"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  transactionsData,
} from "@/lib/placeholder-data";
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon } from "lucide-react";
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--muted))",
];

export default function ReportsPage() {
    const {
        monthlyBreakdownData,
        categorySpendingData,
        reportMetrics
    } = useMemo(() => {
        const now = new Date();
        const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(now, i);
            const monthKey = format(date, 'MMM');
            monthlyData[monthKey] = { income: 0, expenses: 0 };
        }

        const sixMonthsAgo = startOfMonth(subMonths(now, 5));
        
        const categorySpending: { [key: string]: number } = {};
        const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };

        let totalIncome = 0;
        let totalExpenses = 0;

        transactionsData.forEach(t => {
            const tDate = new Date(t.date);
             // Monthly breakdown
            if (isWithinInterval(tDate, { start: sixMonthsAgo, end: now })) {
                const monthKey = format(tDate, 'MMM');
                if (t.amount > 0) {
                    monthlyData[monthKey].income += t.amount;
                } else {
                    monthlyData[monthKey].expenses += Math.abs(t.amount);
                }
            }
            // All time metrics
            if (t.amount > 0) {
                totalIncome += t.amount;
            } else {
                totalExpenses += Math.abs(t.amount);
            }
             // Current month category spending
             if (isWithinInterval(tDate, currentMonthInterval) && t.amount < 0) {
                categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount);
            }
        });

        const processedMonthlyData = Object.entries(monthlyData).map(([month, values]) => ({
            month,
            ...values,
        }));

        const processedCategoryData = Object.entries(categorySpending).map(([name, value], index) => ({
            name,
            value,
            fill: COLORS[index % COLORS.length]
        }));
        
        // This is a simplified metric calculation
        const uniqueMonths = new Set(transactionsData.map(t => format(new Date(t.date), 'yyyy-MM'))).size;
        const avgIncome = uniqueMonths > 0 ? totalIncome / uniqueMonths : 0;
        const avgExpenses = uniqueMonths > 0 ? totalExpenses / uniqueMonths : 0;
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
        
        return {
            monthlyBreakdownData: processedMonthlyData,
            categorySpendingData: processedCategoryData,
            reportMetrics: {
                avgIncome,
                avgExpenses,
                savingsRate
            }
        };

    }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <PieChartIcon className="h-8 w-8" />
              Advanced Reports
            </h2>
            <p className="text-muted-foreground">
              Deep dive into your financial data.
            </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Monthly Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(reportMetrics.avgIncome)}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Monthly Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(reportMetrics.avgExpenses)}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{reportMetrics.savingsRate.toFixed(1)}%</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
            <Card className="md:col-span-3">
                <CardHeader>
                    <CardTitle>Income vs. Expense</CardTitle>
                    <CardDescription>Last 6 months trend.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyBreakdownData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)}/>
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} name="Income" />
                        <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-2))" name="Expenses" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Spending by category this month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categorySpendingData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {categorySpendingData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value as number)}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
