
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
export interface Position {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
  id: string; // Not from API, added for client-side key
  name: string; // Not from API, added for client-side
  logoUrl?: string; // Not from API, added for client-side
  currentValue: number; // Not from API, added for client-side
}

export type ClientInvestment = Position;

export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  cash: string;
  portfolio_value: string;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  sma: string;
  daytrade_count: number;
  last_daytrade_count: number;
  created_at: string;
  trade_suspended_by_user: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  shorting_enabled: boolean;
  multiplier: string;
  equity_change_today?: number; // Changed to number
}

export interface Bar {
    t: string; // Timestamp
    o: number; // Open
    h: number; // High
    l: number; // Low
    c: number; // Close
    v: number; // Volume
}

export interface LatestQuote {
    c: number; // Close price
}

export interface Asset {
    id: string;
    asset_class: string;
    exchange: string;
    symbol: string;
    name: string;
    status: string;
    tradable: boolean;
    marginable: boolean;
    shortable: boolean;
    easy_to_borrow: boolean;
    fractionable: boolean;
    industry?: string;
}

export interface News {
    id: number;
    headline: string;
    author: string;
    created_at: string;
    updated_at: string;
    summary: string;
    url: string;
    images?: { size: string; url: string }[];
    symbols: string[];
    source: string;
}

export interface StockDetails {
    asset: Asset;
    bars: Bar[];
    news: News[];
    latestQuote?: LatestQuote;
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

export interface Order {
    id: string;
    client_order_id: string;
    created_at: string;
    updated_at: string;
    submitted_at: string;
    filled_at: string | null;
    expired_at: string | null;
    canceled_at: string | null;
    failed_at: string | null;
    replaced_at: string | null;
    replaced_by: string | null;
    replaces: string | null;
    asset_id: string;
    symbol: string;
    asset_class: string;
    notional: string | null;
    qty: string;
    filled_qty: string;
    filled_avg_price: string | null;
    order_class: string;
    order_type: string;
    type: string;
    side: string;
    time_in_force: string;
    limit_price: string | null;
    stop_price: string | null;
    status: string;
    extended_hours: boolean;
    legs: any[] | null; // You might want to define a type for legs if you use them
    trail_price: string | null;
    trail_percent: string | null;
    hwm: string | null;
}
export type AlpacaOrder = Order;
export type NewsArticle = News;



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
