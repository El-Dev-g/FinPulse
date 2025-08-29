// src/components/dashboard/budget-card.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ClientBudget } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MoveUpRight } from "lucide-react";

interface BudgetCardProps {
  budget: ClientBudget;
  onSweep: () => void;
}

export function BudgetCard({ budget, onSweep }: BudgetCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const progress = (budget.spent / budget.limit) * 100;
  const remaining = budget.limit - budget.spent;
  const isOverBudget = progress > 100;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-muted p-2 rounded-md">
            <budget.Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{budget.category}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div>
          <Progress value={Math.min(progress, 100)} className={cn(isOverBudget && "bg-destructive/20 [&>*]:bg-destructive")}/>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Spent</span>
            <span>
              {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className={cn("text-sm", isOverBudget ? "text-destructive font-semibold" : "text-muted-foreground")}>
          {isOverBudget 
            ? `${formatCurrency(Math.abs(remaining))} over budget` 
            : `${formatCurrency(remaining)} remaining`}
        </p>
        {!isOverBudget && remaining > 0 && (
          <Button variant="ghost" size="sm" onClick={onSweep}>
            <MoveUpRight className="mr-2 h-4 w-4" />
            Sweep to Goal
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
