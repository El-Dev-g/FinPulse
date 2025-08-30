import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  ArrowRightLeft,
  Car,
  Film,
  HeartPulse,
  Home,
  LucideIcon,
  Shirt,
  ShoppingCart,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import type { ClientTransaction, Transaction, ClientBudget, Budget, ClientRecurringTransaction, RecurringTransaction, ClientFinancialTask, FinancialTask, ClientGoal, Goal } from "./types";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const categoryIcons: { [key: string]: LucideIcon } = {
  Groceries: ShoppingCart,
  'Dining Out': UtensilsCrossed,
  Transport: Car,
  Shopping: Shirt,
  Housing: Home,
  Entertainment: Film,
  Health: HeartPulse,
  Savings: Wallet,
  Income: ArrowRightLeft,
  Default: ArrowRightLeft
};

const budgetCategoryIcons: { [key: string]: LucideIcon } = {
  Groceries: ShoppingCart,
  'Dining Out': UtensilsCrossed,
  Transport: Car,
  Shopping: Shirt,
  Housing: Home,
  Entertainment: Film,
  Health: HeartPulse,
  Other: Wallet,
};


export const getIconForCategory = (category: string): LucideIcon => {
  return categoryIcons[category] || categoryIcons['Default'];
};

export const getIconForBudgetCategory = (category: string): LucideIcon => {
    return budgetCategoryIcons[category] || Wallet;
}

export const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
}


// These functions convert Firestore Timestamps to JS Dates
// This is necessary because the conversion doesn't happen automatically
// when fetching data in Next.js server components.

export function processTransactions(transactions: Transaction[]): ClientTransaction[] {
    return transactions.map(t => ({
        ...t,
        Icon: getIconForCategory(t.category),
        createdAt: t.createdAt.toDate(),
    }));
}

export function processBudgets(budgets: Budget[], transactions: Transaction[]): ClientBudget[] {
    const monthlySpending = new Map<string, number>();
    transactions.forEach(t => {
      if (t.amount < 0) {
        monthlySpending.set(t.category, (monthlySpending.get(t.category) || 0) + Math.abs(t.amount));
      }
    });

    return budgets.map(b => ({
        ...b,
        spent: monthlySpending.get(b.category) || 0,
        Icon: getIconForBudgetCategory(b.category),
        createdAt: b.createdAt.toDate(),
    }));
}

export function processRecurringTransactions(transactions: RecurringTransaction[]): ClientRecurringTransaction[] {
    return transactions.map(t => ({
        ...t,
        Icon: getIconForCategory(t.category),
        createdAt: t.createdAt.toDate(),
    }));
}

export function processTasks(tasks: FinancialTask[]): ClientFinancialTask[] {
    return tasks.map(t => ({
        ...t,
        createdAt: t.createdAt.toDate(),
    }));
}

export function processGoals(goals: Goal[]): ClientGoal[] {
    return goals.map(g => ({
        ...g,
        createdAt: g.createdAt.toDate(),
    }));
}

export function processGoal(goal: Goal): ClientGoal {
    return {
        ...goal,
        createdAt: goal.createdAt.toDate(),
    }
}
