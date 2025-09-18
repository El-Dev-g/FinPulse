
// src/app/dashboard/budgets/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import type { Budget, ClientBudget, ClientGoal, Goal, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, ArrowRightLeft, Loader, Lock } from "lucide-react";
import { BudgetCard } from "@/components/dashboard/budget-card";
import { AddBudgetDialog } from "@/components/dashboard/add-budget-dialog";
import { EditBudgetDialog } from "@/components/dashboard/edit-budget-dialog";
import { SweepToGoalDialog } from "@/components/dashboard/sweep-to-goal-dialog";
import { useAuth } from "@/hooks/use-auth";
import { getBudgets, getGoals, getTransactions, addBudget, updateGoal, addTransaction, updateBudget, deleteBudget } from "@/lib/db";
import { processBudgets, processGoals, processTransactions } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { ProBadge } from "@/components/pro-badge";

export default function BudgetsPage() {
  const { user, isPro } = useAuth();
  const [budgets, setBudgets] = useState<ClientBudget[]>([]);
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<ClientBudget | null>(null);
  const [sweepingBudget, setSweepingBudget] = useState<ClientBudget | null>(null);

  const budgetLimit = 20;
  const hasReachedBudgetLimit = !isPro && budgets.length >= budgetLimit;

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dbBudgets, dbGoals, dbTransactions] = await Promise.all([
        getBudgets(),
        getGoals('active'),
        getTransactions(),
      ]);
      const processedBudgets = processBudgets(dbBudgets as Budget[], dbTransactions as Transaction[]);
      setBudgets(processedBudgets);
      setGoals(processGoals(dbGoals as Goal[]));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddBudget = async (newBudget: Omit<Budget, "id" | "createdAt">) => {
    await addBudget(newBudget);
    fetchData();
  };
  
  const handleEditBudget = async (id: string, updatedData: Partial<Omit<Budget, "id" | "createdAt">>) => {
    await updateBudget(id, updatedData);
    fetchData();
  }

  const handleDeleteBudget = async (id: string) => {
    await deleteBudget(id);
    fetchData();
  }

  const handleSweepToGoal = async (budget: ClientBudget, goal: Goal) => {
    const remaining = budget.limit - budget.spent;
    if (remaining <= 0) return;

    // 1. Add amount to goal
    const newGoalAmount = goal.current + remaining;
    await updateGoal(goal.id, { current: newGoalAmount });

    // 2. Create a new transaction to represent the sweep as a contribution to the goal
    // This makes it visible in the goal's activity list
    const sweepTransaction = {
      description: `Sweep from ${budget.category} budget`,
      amount: remaining,
      category: 'Savings', // A neutral, positive category
      date: new Date().toISOString().split("T")[0],
      source: 'manual',
      goalId: goal.id,
    };
    await addTransaction(sweepTransaction);
    
    // 3. Create a negative transaction against the budget category to zero out the 'spent' amount for the current period
    // This allows the user to see the sweep as a formal transaction while keeping budget tracking accurate
    const resetTransaction = {
      description: `Budget sweep adjustment: ${budget.category}`,
      amount: -budget.spent, // Use the spent amount, not the remaining amount
      date: new Date().toISOString().split("T")[0],
      category: budget.category,
      source: 'manual'
    };
    await addTransaction(resetTransaction);

    fetchData(); // Re-fetch all data to ensure UI consistency
  };
  
  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 lg:p-8">
      <div className="w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-3xl font-bold font-headline tracking-tight">
              <Wallet className="h-8 w-8" />
              Monthly Budgets
            </h2>
            <p className="text-muted-foreground">
              Track your spending against your set limits.
            </p>
          </div>
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                   <Button onClick={() => setIsAddBudgetDialogOpen(true)} disabled={hasReachedBudgetLimit}>
                    {hasReachedBudgetLimit ? <Lock className="mr-2" /> : <Plus className="mr-2" />}
                    Add Budget
                  </Button>
                  {hasReachedBudgetLimit && (
                    <div className="absolute -right-2 -top-2">
                      <ProBadge />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
               {hasReachedBudgetLimit && (
                 <TooltipContent>
                    <p>Upgrade to Pro to add unlimited budgets.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
         {hasReachedBudgetLimit && (
            <div className="mb-6 rounded-lg border border-accent/50 bg-accent/30 p-4 text-center text-sm">
                <p className="font-semibold text-accent-foreground">You've reached your budget limit!</p>
                <p className="mt-1 text-muted-foreground">The free plan allows for up to {budgetLimit} active budgets. <Button variant="link" className="h-auto p-0" asChild><Link href="/dashboard/billing">Upgrade to Pro</Link></Button> to add more.</p>
            </div>
        )}
        {loading ? (
            <div className="flex h-64 items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : budgets.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => (
                <BudgetCard 
                  key={budget.id} 
                  budget={budget} 
                  onSweep={() => setSweepingBudget(budget)}
                  onEdit={() => setEditingBudget(budget)}
                />
              ))}
            </div>
        ) : (
             <div className="py-12 text-center text-muted-foreground">
              <h3 className="text-lg font-semibold">No Budgets Yet!</h3>
              <p>Click "Add Budget" to start tracking your spending.</p>
            </div>
        )}
      </div>
      <AddBudgetDialog
        isOpen={isAddBudgetDialogOpen}
        onOpenChange={setIsAddBudgetDialogOpen}
        onAddBudget={handleAddBudget}
        existingCategories={budgets.map(b => b.category)}
      />
       <EditBudgetDialog
        budget={editingBudget}
        isOpen={!!editingBudget}
        onOpenChange={() => setEditingBudget(null)}
        onEditBudget={handleEditBudget}
        onDeleteBudget={handleDeleteBudget}
      />
      <SweepToGoalDialog
        budget={sweepingBudget}
        goals={goals}
        isOpen={!!sweepingBudget}
        onOpenChange={(isOpen) => !isOpen && setSweepingBudget(null)}
        onSweep={handleSweepToGoal}
      />
    </main>
  );
}
