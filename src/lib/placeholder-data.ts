import type { ChartConfig } from "@/components/ui/chart";
import {
  ArrowRightLeft,
  Film,
  HeartPulse,
  LucideIcon,
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Home,
  Shirt,
  Wallet,
  ClipboardList,
  Repeat,
} from "lucide-react";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  Icon: LucideIcon;
  goalId?: string;
}

export interface Budget {
    id: string;
    category: string;
    limit: number;
    spent: number;
    Icon: LucideIcon;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface FinancialTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
  goalId?: string;
}

export interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  advice?: string;
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  frequency: RecurringFrequency;
  startDate: string;
  Icon: LucideIcon;
}


export const overviewData = {
  income: 5231.89,
  expenses: 2510.45,
  netWorth: 142034.21,
};

export const spendingData = [
  { category: "Groceries", amount: 650, fill: "var(--color-groceries)" },
  { category: "Dining", amount: 320, fill: "var(--color-dining)" },
  { category: "Transport", amount: 210, fill: "var(--color-transport)" },
  { category: "Entertainment", amount: 480, fill: "var(--color-entertainment)" },
  { category: "Health", amount: 150, fill: "var(--color-health)" },
  { category: "Other", amount: 700, fill: "var(--color-other)" },
];

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

export const transactionsData: Transaction[] = [
  {
    id: "txn_1",
    description: "Trader Joe's",
    amount: -78.54,
    date: "2024-07-22",
    category: "Groceries",
    Icon: ShoppingCart,
  },
  {
    id: "txn_2",
    description: "Monthly Salary",
    amount: 3500.0,
    date: "2024-07-20",
    category: "Income",
    Icon: ArrowRightLeft,
  },
  {
    id: "txn_3",
    description: "Netflix Subscription",
    amount: -15.99,
    date: "2024-07-19",
    category: "Entertainment",
    Icon: Film,
  },
  {
    id: "txn_4",
    description: "The Cozy Diner",
    amount: -45.2,
    date: "2024-07-18",
    category: "Dining Out",
    Icon: UtensilsCrossed,
  },
  {
    id: "txn_5",
    description: "CVS Pharmacy",
    amount: -22.1,
    date: "2024-07-17",
    category: "Health",
    Icon: HeartPulse,
  },
  {
    id: 'txn_6',
    description: 'Contribution to House Fund',
    amount: -500,
    date: '2024-07-15',
    category: 'Savings',
    Icon: ArrowRightLeft,
    goalId: 'goal_1',
  },
  {
    id: 'txn_7',
    description: 'Birthday Money',
    amount: 100,
    date: '2024-07-10',
    category: 'Income',
    Icon: ArrowRightLeft,
    goalId: 'goal_2',
  },
  {
    id: 'txn_8',
    description: 'Gas',
    amount: -45.67,
    date: '2024-07-23',
    category: 'Transport',
    Icon: Car,
  },
  {
    id: 'txn_9',
    description: 'Zara',
    amount: -120.50,
    date: '2024-07-21',
    category: 'Shopping',
    Icon: Shirt,
  },
  {
    id: 'txn_10',
    description: 'Rent',
    amount: -1450,
    date: '2024-07-01',
    category: 'Housing',
    Icon: Home,
  }
];

export const goalsData: Goal[] = [
  {
    id: "goal_1",
    title: "House Down Payment",
    current: 45250,
    target: 80000,
    advice: "Consider automating a weekly transfer of $200 to your savings account. This 'out of sight, out of mind' approach can accelerate your progress without feeling like a major sacrifice."
  },
  {
    id: "goal_2",
    title: "Vacation to Japan",
    current: 3100,
    target: 8000,
  },
  {
    id: "goal_3",
    title: "New Car Fund",
    current: 12500,
    target: 15000,
  },
];

export const budgetsData: Omit<Budget, 'spent'>[] = [
    { id: 'budget_1', category: 'Groceries', limit: 800, Icon: ShoppingCart },
    { id: 'budget_2', category: 'Dining Out', limit: 200, Icon: UtensilsCrossed },
    { id: 'budget_3', category: 'Transport', limit: 150, Icon: Car },
    { id: 'budget_4', category: 'Shopping', limit: 250, Icon: Shirt },
    { id: 'budget_5', category: 'Housing', limit: 1500, Icon: Home },
    { id: 'budget_6', category: 'Entertainment', limit: 100, Icon: Film },
];


export const reportMetrics = {
    avgIncome: 5288.50,
    avgExpenses: 2543.33,
    savingsRate: 51.9,
};

export const tasksData: FinancialTask[] = [
    { id: 'task-1', title: 'Pay credit card bill', status: 'To Do', dueDate: '2024-08-25' },
    { id: 'task-2', title: 'Review monthly budget', status: 'In Progress' },
    { id: 'task-3', title: 'Call insurance company about renewal', status: 'To Do', dueDate: '2024-08-20' },
    { id: 'task-4', title: 'File tax documents', status: 'Done' },
    { id: 'task-5', title: 'Research high-yield savings accounts', status: 'In Progress', goalId: 'goal_1' },
    { id: 'task-6', title: 'Book flights', status: 'To Do', dueDate: '2024-09-01', goalId: 'goal_2' },
];

export const recurringTransactionsData: RecurringTransaction[] = [
    {
        id: 'recur_1',
        description: 'Monthly Salary',
        amount: 3500.0,
        category: 'Income',
        frequency: 'monthly',
        startDate: '2024-07-20',
        Icon: ArrowRightLeft,
    },
    {
        id: 'recur_2',
        description: 'Netflix Subscription',
        amount: -15.99,
        category: 'Entertainment',
        frequency: 'monthly',
        startDate: '2024-07-19',
        Icon: Film,
    },
    {
        id: 'recur_3',
        description: 'Rent',
        amount: -1450,
        category: 'Housing',
        frequency: 'monthly',
        startDate: '2024-07-01',
        Icon: Home,
    },
];
