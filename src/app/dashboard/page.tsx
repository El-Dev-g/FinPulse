
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { GoalTracker } from "@/components/dashboard/goal-tracker";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { Alerts } from "@/components/dashboard/alerts";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { getTransactions, getGoals, getAccounts } from '@/lib/db';
import type { Account, Goal, Transaction, ClientGoal, ClientTransaction } from '@/lib/types';
import { processGoals, processTransactions } from '@/lib/utils';

export default function DashboardPage() {
  const { user, subscriptionStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch data from Firestore
      const [dbTransactions, dbGoals, dbAccounts] = await Promise.all([
        getTransactions(),
        getGoals(),
        getAccounts(),
      ]);
      setTransactions(processTransactions(dbTransactions as any[]));
      setGoals(processGoals(dbGoals as any[]));
      setAccounts(dbAccounts as Account[]);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
         <Loader className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Welcome, {user?.displayName || "User"}!
          </h2>
          <p className="text-muted-foreground">
            Here's a snapshot of your financial health.
          </p>
        </div>
      </div>
      
      {subscriptionStatus === 'past_due' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Your Payment is Past Due</AlertTitle>
          <div className="flex items-center justify-between">
            <AlertDescription>
                Please update your payment information to keep your Pro account active.
            </AlertDescription>
            <Button asChild size="sm">
                <Link href="/dashboard/billing">Update Billing</Link>
            </Button>
          </div>
        </Alert>
      )}

      <Alerts />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <OverviewCards transactions={transactions} goals={goals} accounts={accounts} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingChart transactions={transactions} />
        </div>
        <div className="lg:col-span-1">
          <GoalTracker goals={goals} />
        </div>
      </div>
      <div>
        <RecentTransactions transactions={transactions} />
      </div>
    </main>
  );
}
