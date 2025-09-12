// src/components/dashboard/portfolio-summary.tsx
"use client";

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Landmark } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import type { ClientInvestment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PortfolioSummaryProps {
  investments: ClientInvestment[];
}

export function PortfolioSummary({ investments }: PortfolioSummaryProps) {
  const { formatCurrency } = useAuth();

  const summary = useMemo(() => {
    const totalValue = investments.reduce((acc, inv) => acc + inv.currentValue, 0);
    const totalCost = investments.reduce((acc, inv) => acc + (inv.purchasePrice * inv.quantity), 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    return {
      totalValue,
      totalGainLoss,
      totalGainLossPercentage
    };
  }, [investments]);

  const isOverallGain = summary.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                {isOverallGain ? <TrendingUp className="h-4 w-4 text-green-600"/> : <TrendingDown className="h-4 w-4 text-destructive"/>}
            </CardHeader>
            <CardContent>
                <p className={cn("text-2xl font-bold", isOverallGain ? "text-green-600" : "text-destructive")}>
                    {formatCurrency(summary.totalGainLoss)}
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                 <p className={cn("text-2xl font-bold", isOverallGain ? "text-green-600" : "text-destructive")}>
                    {summary.totalGainLossPercentage.toFixed(2)}%
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
