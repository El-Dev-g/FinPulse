// src/app/dashboard/reports/page.tsx
"use client";

import React from "react";
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
  categorySpendingData,
  monthlyBreakdownData,
  reportMetrics,
} from "@/lib/placeholder-data";
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon } from "lucide-react";

export default function ReportsPage() {
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
                        <Line type="monotone" dataKey="income" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-2))" />
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
