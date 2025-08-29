import type { ChartConfig } from "@/components/ui/chart";
import {
  ArrowRightLeft,
  Film,
  HeartPulse,
  LucideIcon,
  ShoppingCart,
  UtensilsCrossed,
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
    category: "Dining",
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
    amount: 500,
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
];

export const goalsData = [
  {
    id: "goal_1",
    title: "House Down Payment",
    current: 45250,
    target: 80000,
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
