// src/app/dashboard/budgets/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import type { Budget, ClientBudget, ClientGoal, Goal, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, ArrowRightLeft, Loader } from "lucide-react";
import { BudgetCard } from "@/components/dashboard/budget-card";
import { AddBudgetDialog } from "@/components/dashboard/add-budget-dialog";
import { SweepToGoalDialog } from "@/components/dashboard/sweep-to-goal-dialog";
import { useAuth } from "@/hooks/use-auth";
import { getBudgets, getGoals, getTransactions, addBudget, updateGoal, addTransaction } from "@/lib/db";
import { processBudgets, processGoals, processTransactions } from "@/lib/utils";

export default function BudgetsPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<ClientBudget[]>([]);
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false);
  const [sweepingBudget, setSweepingBudget] = useState<ClientBudget | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dbBudgets, dbGoals, dbTransactions] = await Promise.all([
        getBudgets(),
        getGoals(),
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

  const handleSweepToGoal = async (budget: ClientBudget, goal: Goal) => {
    const remaining = budget.limit - budget.spent;
    if (remaining <= 0) return;

    // 1. Add amount to goal
    const newGoalAmount = goal.current + remaining;
    await updateGoal(goal.id, { current: newGoalAmount });

    // 2. Create a new transaction for the sweep
    const sweepTransaction = {
      description: `Sweep from ${budget.category} budget`,
      amount: remaining,
      date: new Date().toISOString().split("T")[0],
      category: 'Savings',
      goalId: goal.id,
    };
    await addTransaction(sweepTransaction);
    
    // 3. Create a transaction to "reset" the budget's spent amount for this month
    const resetTransaction = {
      description: `Budget sweep adjustment: ${budget.category}`,
      amount: -budget.spent,
      date: new Date().toISOString().split("T")[0],
      category: budget.category,
    };
    await addTransaction(resetTransaction);

    fetchData(); // Re-fetch all data to ensure UI consistency
  };
  
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <Wallet className="h-8 w-8" />
              Monthly Budgets
            </h2>
            <p className="text-muted-foreground">
              Track your spending against your set limits.
            </p>
          </div>
           <Button onClick={() => setIsAddBudgetDialogOpen(true)}>
            <Plus className="mr-2" />
            Add Budget
          </Button>
        </div>
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : budgets.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} onSweep={() => setSweepingBudget(budget)} />
              ))}
            </div>
        ) : (
             <div className="text-center py-12 text-muted-foreground">
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
