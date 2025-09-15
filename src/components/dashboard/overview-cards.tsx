
// src/components/dashboard/overview-cards.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Landmark, TrendingDown, TrendingUp } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import type { ClientTransaction, ClientGoal, Account } from '@/lib/types';
import { subDays, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

interface OverviewCardsProps {
    transactions: ClientTransaction[];
    goals: ClientGoal[];
    accounts: Account[];
}

export function OverviewCards({ transactions, goals, accounts }: OverviewCardsProps) {
  const { formatCurrency } = useAuth();
  
  const overviewData = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subDays(currentMonthStart, 1));
    const lastMonthEnd = endOfMonth(lastMonthStart);

    let currentMonthIncome = 0;
    let currentMonthExpenses = 0;
    let lastMonthIncome = 0;
    let lastMonthExpenses = 0;
    
    transactions.forEach(t => {
        const tDate = new Date(t.date);
        // Current month calculations
        if (isWithinInterval(tDate, { start: currentMonthStart, end: now })) {
          if (t.amount > 0) currentMonthIncome += t.amount;
          else currentMonthExpenses += Math.abs(t.amount);
        }
        // Last month calculations
        if (isWithinInterval(tDate, { start: lastMonthStart, end: lastMonthEnd })) {
            if (t.amount > 0) lastMonthIncome += t.amount;
            else lastMonthExpenses += Math.abs(t.amount);
        }
    });

    const totalAccountBalances = accounts.reduce((acc, account) => acc + (account.balance || 0), 0);

    const incomeChange = lastMonthIncome > 0 ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : currentMonthIncome > 0 ? 100 : 0;
    const expenseChange = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : currentMonthExpenses > 0 ? 100 : 0;

    return {
        income: currentMonthIncome,
        expenses: currentMonthExpenses,
        netWorth: totalAccountBalances,
        incomeChange,
        expenseChange
    };
  }, [transactions, accounts]);

  const formatPercentage = (value: number) => {
      if (!isFinite(value)) return "0.0%";
      const sign = value > 0 ? '+' : '';
      return `${sign}${value.toFixed(1)}%`;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overviewData.income)}
          </div>
          <p className="text-xs text-muted-foreground">{formatPercentage(overviewData.incomeChange)} from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overviewData.expenses)}
          </div>
          <p className="text-xs text-muted-foreground">{formatPercentage(overviewData.expenseChange)} from last month</p>
        </CardContent>
      </Card>
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overviewData.netWorth)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total of all connected account balances
          </p>
        </CardContent>
      </Card>
    </>
  );
}
