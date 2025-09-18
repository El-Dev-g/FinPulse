
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
import type { ClientInvestment, AlpacaAccount } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PortfolioSummaryProps {
  investments: ClientInvestment[];
  account: AlpacaAccount | null;
}

export function PortfolioSummary({ investments, account }: PortfolioSummaryProps) {
  const { formatCurrency } = useAuth();

  const summary = useMemo(() => {
    if (!account) {
        return {
            totalValue: 0,
            totalGainLoss: 0,
            totalGainLossPercentage: 0,
            buyingPower: 0,
        }
    }
    const { portfolio_value, buying_power } = account;
    const totalCost = investments.reduce((sum, pos) => sum + (parseFloat(pos.cost_basis)), 0);
    const totalMarketValue = investments.reduce((sum, pos) => sum + (parseFloat(pos.market_value)), 0);
    const totalGainLoss = totalMarketValue - totalCost;
    const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    return {
      totalValue: parseFloat(portfolio_value),
      buyingPower: parseFloat(buying_power),
      totalGainLoss,
      totalGainLossPercentage
    };
  }, [investments, account]);

  const isOverallGain = summary.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
                {parseFloat(account?.equity_change_today || '0') >= 0 ? <TrendingUp className="h-4 w-4 text-green-600"/> : <TrendingDown className="h-4 w-4 text-destructive"/>}
            </CardHeader>
            <CardContent>
                 <p className={cn("text-2xl font-bold", parseFloat(account?.equity_change_today || '0') >= 0 ? "text-green-600" : "text-destructive")}>
                    {formatCurrency(parseFloat(account?.equity_change_today || '0'))}
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                 {isOverallGain ? <TrendingUp className="h-4 w-4 text-green-600"/> : <TrendingDown className="h-4 w-4 text-destructive"/>}
            </CardHeader>
            <CardContent>
                 <p className={cn("text-2xl font-bold", isOverallGain ? "text-green-600" : "text-destructive")}>
                    {formatCurrency(summary.totalGainLoss)} ({summary.totalGainLossPercentage.toFixed(2)}%)
                </p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Buying Power</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(summary.buyingPower)}</p>
            </CardContent>
        </Card>
    </div>
  );
}
