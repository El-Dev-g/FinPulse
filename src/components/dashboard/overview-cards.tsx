// src/components/dashboard/overview-cards.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Landmark, TrendingDown, TrendingUp, Loader } from "lucide-react";
import { getTransactions, getGoals } from '@/lib/db';
import { useAuth } from '@/hooks/use-auth';
import type { Transaction, Goal } from '@/lib/types';
import { subDays, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

export function OverviewCards() {
  const { user } = useAuth();
  const [overviewData, setOverviewData] = useState({
    income: 0,
    expenses: 0,
    netWorth: 0, // Note: True net worth is complex. This is a simple calculation.
    incomeChange: 0,
    expenseChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateOverview = async () => {
      if (!user) return;
      setLoading(true);
      
      const transactions = await getTransactions() as Transaction[];
      const goals = await getGoals() as Goal[];

      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subDays(currentMonthStart, 1));
      const lastMonthEnd = endOfMonth(lastMonthStart);

      let currentMonthIncome = 0;
      let currentMonthExpenses = 0;
      let lastMonthIncome = 0;
      let lastMonthExpenses = 0;
      let totalAssets = 0;
      
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
      
      goals.forEach(g => {
        totalAssets += g.current;
      });
      
      // A simple net worth could be total saved in goals.
      // A more complex one would involve assets - liabilities.
      // We are only tracking savings goals as assets here.
      
      const incomeChange = lastMonthIncome > 0 ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : currentMonthIncome > 0 ? 100 : 0;
      const expenseChange = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : currentMonthExpenses > 0 ? 100 : 0;

      setOverviewData({
        income: currentMonthIncome,
        expenses: currentMonthExpenses,
        netWorth: totalAssets,
        incomeChange,
        expenseChange
      });
      setLoading(false);
    };

    calculateOverview();
  }, [user]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  const formatPercentage = (value: number) => {
      const sign = value > 0 ? '+' : '';
      return `${sign}${value.toFixed(1)}%`;
  }
  
  if (loading) {
      return (
          <>
            <Card><CardContent className="p-6 flex justify-center items-center h-[118px]"><Loader className="animate-spin" /></CardContent></Card>
            <Card><CardContent className="p-6 flex justify-center items-center h-[118px]"><Loader className="animate-spin" /></CardContent></Card>
            <Card className="col-span-1 md:col-span-2 lg:col-span-2"><CardContent className="p-6 flex justify-center items-center h-[118px]"><Loader className="animate-spin" /></CardContent></Card>
          </>
      )
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
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overviewData.netWorth)}
          </div>
          <p className="text-xs text-muted-foreground">
            Your financial independence tracker
          </p>
        </CardContent>
      </Card>
    </>
  );
}
