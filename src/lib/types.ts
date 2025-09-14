// src/lib/types.ts
import type { ChartConfig } from "@/components/ui/chart";
import type { LucideIcon } from "lucide-react";

export interface UserProfile {
  currency?: string;
  photoURL?: string;
}

export type Account = {
  id: string;
  name: string;
  bank: string;
  last4: string;
  type: string;
  accountNumber: string;
  syncStatus: string;
  bankUserName: string;
  balance?: number; // Optional balance for mock data
};


export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  category: string;
  goalId?: string;
  projectId?: string;
  createdAt: any; // Firestore timestamp
  source: 'manual' | string; // 'manual' or a linked account ID
  bankTransactionId?: string; // Unique ID from the bank/aggregator
}

export interface ClientTransaction extends Omit<Transaction, 'createdAt'>{
  Icon: LucideIcon;
  createdAt: Date;
}


export interface Budget {
    id: string;
    category: string;
    limit: number;
    createdAt: any; // Firestore timestamp
}

export interface ClientBudget extends Omit<Budget, 'createdAt'>{
  spent: number;
  Icon: LucideIcon;
  createdAt: Date;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface FinancialTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string; // ISO string
  dueTime?: string; // HH:mm format
  goalId?: string;
  createdAt: any; // Firestore timestamp
}

export interface ClientFinancialTask extends Omit<FinancialTask, 'createdAt'>{
  createdAt: Date;
}

export interface Advice {
  title: string;
  subtitle: string;
  steps: string[];
}

export interface AIPlan {
    id: string;
    advice: Advice;
    prompt: string;
    goalId?: string;
    createdAt: any; // Firestore timestamp
}

export interface ClientAIPlan extends Omit<AIPlan, 'createdAt'>{
    createdAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  advice?: Advice;
  createdAt: any; // Firestore timestamp
  status: 'active' | 'archived';
}

export interface ClientGoal extends Omit<Goal, 'createdAt'>{
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: any; // Firestore timestamp
}

export interface ClientProject extends Omit<Project, 'createdAt'>{
  createdAt: Date;
}


export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  frequency: RecurringFrequency;
  startDate: string; // ISO string
  createdAt: any; // Firestore timestamp
}

export interface ClientRecurringTransaction extends Omit<RecurringTransaction, 'createdAt'>{
    Icon: LucideIcon;
    createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  createdAt: any; // Firestore timestamp
}

export interface Investment {
  id?: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  createdAt: any; // Firestore timestamp
}

export interface ClientInvestment extends Omit<Investment, 'createdAt'> {
  id: string;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  logoUrl?: string;
  createdAt: Date;
}


export const spendingChartConfig = {
  amount: {
    label: "$",
  },
  groceries: {
    label: "Groceries",
    color: "hsl(var(--chart-1))",
  },
  dining: {
    label: "Dining",
    color: "hsl(var(--chart-2))",
  },
  transport: {
    label: "Transport",
    color: "hsl(var(--chart-3))",
  },
  entertainment: {
    label: "Entertainment",
    color: "hsl(var(--chart-4))",
  },
  health: {
    label: "Health",
    color: "hsl(var(--chart-5))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;
