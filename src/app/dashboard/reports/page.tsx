// src/app/dashboard/reports/page.tsx
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
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
import { getTransactions } from "@/lib/db";
import type { Transaction } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { PieChart as PieChartIcon, Loader, Sparkles, FileText } from "lucide-react";
import { subDays, format, isWithinInterval, startOfDay } from 'date-fns';
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import type { DateRange } from "react-day-picker";
import { ReportMetrics } from "@/components/dashboard/report-metrics";
import { Button } from "@/components/ui/button";
import { ProBadge } from "@/components/pro-badge";

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--muted))",
];


function UpgradeToPro() {
  return (
    <Card className="mt-8 text-center">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 font-headline">
          <Sparkles className="h-6 w-6 text-primary" />
          Unlock Advanced Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This is a Pro feature. Upgrade your plan to get advanced charts, custom date ranges, and PDF exports.
        </p>
        <Button>Upgrade to Pro</Button>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
    const { user, isPro, formatCurrency } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const today = startOfDay(new Date());
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(today, 29),
        to: today,
    });

    const fetchData = useCallback(async () => {
        if(!user) return;
        setLoading(true);
        try {
            const dbTransactions = await getTransactions();
            setTransactions(dbTransactions as Transaction[]);
        } catch (error) {
            console.error("Error fetching transactions: ", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isPro) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [fetchData, isPro]);


    const {
        timeSeriesData,
        categorySpendingData,
        reportMetrics
    } = useMemo(() => {
        const fromDate = dateRange?.from;
        const toDate = dateRange?.to;

        if (!fromDate || !toDate || !transactions) {
            return { timeSeriesData: [], categorySpendingData: [], reportMetrics: { totalIncome: 0, totalExpenses: 0, netSavings: 0 } };
        }
        
        const interval = { start: fromDate, end: toDate };
        const filteredTransactions = transactions.filter(t => isWithinInterval(new Date(t.date), interval));
        
        // --- Time Series Data (Income vs Expense) ---
        const dailyData: { [key: string]: { income: number; expenses: number } } = {};
        for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
            const dateKey = format(d, 'MMM d');
            dailyData[dateKey] = { income: 0, expenses: 0 };
        }
        
        filteredTransactions.forEach(t => {
            const dateKey = format(new Date(t.date), 'MMM d');
            if(dailyData[dateKey]) {
                 if (t.amount > 0) {
                    dailyData[dateKey].income += t.amount;
                } else {
                    dailyData[dateKey].expenses += Math.abs(t.amount);
                }
            }
        });
        const processedTimeSeriesData = Object.entries(dailyData).map(([date, values]) => ({
            date,
            ...values,
        }));

        // --- Category Spending Data ---
        const categorySpending: { [key: string]: number } = {};
        let totalIncome = 0;
        let totalExpenses = 0;

        filteredTransactions.forEach(t => {
            if (t.amount < 0) {
                const expense = Math.abs(t.amount);
                categorySpending[t.category] = (categorySpending[t.category] || 0) + expense;
                totalExpenses += expense;
            } else {
                totalIncome += t.amount;
            }
        });

        const processedCategoryData = Object.entries(categorySpending).map(([name, value], index) => ({
            name,
            value,
            fill: COLORS[index % COLORS.length]
        })).sort((a, b) => b.value - a.value);
        
        return {
            timeSeriesData: processedTimeSeriesData,
            categorySpendingData: processedCategoryData,
            reportMetrics: {
                totalIncome,
                totalExpenses,
                netSavings: totalIncome - totalExpenses
            }
        };

    }, [dateRange, transactions]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
                 <div className="flex items-center gap-4">
                     <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <PieChartIcon className="h-8 w-8" />
                        Financial Reports
                    </h2>
                    {isPro && <ProBadge />}
                </div>
                <p className="text-muted-foreground">
                    Deep dive into your financial data with custom date ranges.
                </p>
            </div>
            {isPro && (
                <div className="flex gap-2 items-center">
                    <Button variant="outline" disabled>
                        <FileText className="mr-2" />
                        Export to PDF
                    </Button>
                    <DateRangePicker dateRange={dateRange} onDateChange={setDateRange} />
                </div>
            )}
        </div>

        {!isPro ? (
            <UpgradeToPro />
        ) : loading ? (
             <div className="flex justify-center items-center h-96">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <>
                <ReportMetrics metrics={reportMetrics} />

                <div className="grid gap-8 md:grid-cols-5 mt-8">
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Income vs. Expense</CardTitle>
                            <CardDescription>Trend for the selected period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                                <Tooltip formatter={(value, name) => [formatCurrency(value as number), name]}/>
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
                            <CardDescription>Spending by category for the selected period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        {categorySpendingData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categorySpendingData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        labelLine={false}
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        if (percent < 0.05) return null; // Don't render label for small slices
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                        return (
                                            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                                            {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                        }}
                                    >
                                        {categorySpendingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value as number)}/>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                                No expense data for this period.
                            </div>
                        )}
                        </CardContent>
                    </Card>
                </div>
            </>
        )}
      </div>
    </main>
  );
}
