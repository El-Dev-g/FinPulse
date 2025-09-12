// src/components/dashboard/investment-performance-chart.tsx
"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import type { ClientInvestment } from "@/lib/types";

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--muted))",
];

interface InvestmentPerformanceChartProps {
  investments: ClientInvestment[];
}

export function InvestmentPerformanceChart({ investments }: InvestmentPerformanceChartProps) {
  const { formatCurrency } = useAuth();
  
  const chartData = useMemo(() => {
    return investments.map((inv, index) => ({
      name: inv.symbol,
      value: inv.currentValue,
      fill: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);
  }, [investments]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
        <CardDescription>A visual breakdown of your holdings.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={({ name, percent }) => {
                        if (percent < 0.05) return null;
                        return `${name} ${(percent * 100).toFixed(0)}%`
                    }}
                >
                    {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)}/>
                <Legend />
            </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
