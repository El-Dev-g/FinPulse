"use client";

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
import { spendingData, spendingChartConfig } from "@/lib/placeholder-data";

export function SpendingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending This Month</CardTitle>
        <CardDescription>
          A breakdown of your expenses by category.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
