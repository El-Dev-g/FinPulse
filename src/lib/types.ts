
// src/lib/types.ts
import type { ChartConfig } from "@/components/ui/chart";
import type { LucideIcon } from "lucide-react";
import type { Position, Account, Bar, Order, News, Asset } from '@alpacahq/alpaca-trade-api/dist/resources/entities';

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
  projectId?: string;
  goalId?: string;
  createdAt: any; // Firestore timestamp
  source?: 'manual' | string; // Source can be manual or an account ID
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
  projectId?: string;
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
  projectId?: string;
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

// Alpaca & Investment Types
export type ClientInvestment = Position & {
  logoUrl?: string;
  unrealized_pl: number;
  unrealized_plpc: number;
  market_value: number;
  cost_basis: number;
  qty: number;
}
export type AlpacaAccount = Account;

export interface StockDetails {
    asset: Asset;
    bars: Bar[];
    news: News[];
}

export interface OrderParams {
    symbol: string;
    qty: number;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop' | 'stop_limit';
    time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
    limit_price?: number;
    stop_price?: number;
}
export type AlpacaOrder = Order;



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
