// src/components/dashboard/report-metrics.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

interface ReportMetricsProps {
    metrics: {
        totalIncome: number;
        totalExpenses: number;
        netSavings: number;
    }
}

export function ReportMetrics({ metrics }: ReportMetricsProps) {
    const { formatCurrency } = useAuth();

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalIncome)}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalExpenses)}</p>
                </CardContent>
            </Card>
             <Card className="col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.netSavings)}</p>
                </CardContent>
            </Card>
        </div>
    );
}
