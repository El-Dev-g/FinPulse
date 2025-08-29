// src/app/dashboard/budgets/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  budgetsData as initialBudgetsData,
  transactionsData,
  goalsData
} from "@/lib/placeholder-data";
import type { Budget, Goal } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, ArrowRightLeft } from "lucide-react";
import { BudgetCard } from "@/components/dashboard/budget-card";
import { AddBudgetDialog } from "@/components/dashboard/add-budget-dialog";
import {
  Car,
  Film,
  HeartPulse,
  Home,
  LucideIcon,
  Shirt,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react";
import { SweepToGoalDialog } from "@/components/dashboard/sweep-to-goal-dialog";


const categoryIcons: { [key: string]: LucideIcon } = {
  Groceries: ShoppingCart,
  'Dining Out': UtensilsCrossed,
  Transport: Car,
  Shopping: Shirt,
  Housing: Home,
  Entertainment: Film,
  Health: HeartPulse,
};


export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Omit<Budget, 'spent'>[]>(initialBudgetsData);
  const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false);
  const [sweepingBudget, setSweepingBudget] = useState<Budget | null>(null);

  const processedBudgets = useMemo(() => {
    // In a real app, you'd filter transactions by the current month
    return budgets.map(budget => {
      const spent = transactionsData
        .filter(t => t.category === budget.category && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return { ...budget, spent };
    });
  }, [budgets]);
  
  const handleAddBudget = (newBudget: Omit<Budget, "id" | "spent" | "Icon">) => {
    const budgetWithId = {
      ...newBudget,
      id: `budget_${budgets.length + 1}`,
      Icon: categoryIcons[newBudget.category] || Wallet,
    };
    setBudgets([...budgets, budgetWithId]);
  };

  const handleSweepToGoal = (budget: Budget, goal: Goal) => {
    const remaining = budget.limit - budget.spent;
    if (remaining <= 0) return;

    // 1. Add amount to goal
    const goalIndex = goalsData.findIndex(g => g.id === goal.id);
    if (goalIndex !== -1) {
      goalsData[goalIndex].current += remaining;
    }

    // 2. Create a new transaction for the sweep
    const newTransaction = {
      id: `txn_sweep_${Date.now()}`,
      description: `Sweep from ${budget.category} budget`,
      amount: remaining,
      date: new Date().toISOString().split("T")[0],
      category: 'Savings',
      Icon: ArrowRightLeft,
      goalId: goal.id,
    };
    transactionsData.unshift(newTransaction);
    
    // 3. Reset the budget's spent amount (by creating a "reset" transaction)
    // In a real app, you'd handle monthly resets differently.
    const resetTransaction = {
      id: `txn_reset_${Date.now()}`,
      description: `Budget Reset: ${budget.category}`,
      amount: budget.spent,
      date: new Date().toISOString().split("T")[0],
      category: budget.category,
      Icon: Wallet
    };
    transactionsData.unshift(resetTransaction);

    // Force a re-render by updating the state
    setBudgets([...budgets]);
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {processedBudgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onSweep={() => setSweepingBudget(budget)} />
          ))}
        </div>
      </div>
      <AddBudgetDialog
        isOpen={isAddBudgetDialogOpen}
        onOpenChange={setIsAddBudgetDialogOpen}
        onAddBudget={handleAddBudget}
        existingCategories={budgets.map(b => b.category)}
      />
      <SweepToGoalDialog
        budget={sweepingBudget}
        goals={goalsData}
        isOpen={!!sweepingBudget}
        onOpenChange={(isOpen) => !isOpen && setSweepingBudget(null)}
        onSweep={handleSweepToGoal}
      />
    </main>
  );
}
