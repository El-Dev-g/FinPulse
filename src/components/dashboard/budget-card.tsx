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
import { MoveUpRight, MoreVertical } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface BudgetCardProps {
  budget: ClientBudget;
  onSweep: () => void;
  onEdit: () => void;
}

export function BudgetCard({ budget, onSweep, onEdit }: BudgetCardProps) {
  const { formatCurrency } = useAuth();
  
  const progress = (budget.spent / budget.limit) * 100;
  const remaining = budget.limit - budget.spent;
  const isOverBudget = progress > 100;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-muted p-2 rounded-md">
            <budget.Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{budget.category}</CardTitle>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                    Edit Budget
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
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
