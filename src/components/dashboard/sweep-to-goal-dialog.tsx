// src/components/dashboard/sweep-to-goal-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import type { ClientBudget, Goal } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { useAuth } from "@/hooks/use-auth";

interface SweepToGoalDialogProps {
  budget: ClientBudget | null;
  goals: Goal[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSweep: (budget: ClientBudget, goal: Goal) => Promise<void>;
}

export function SweepToGoalDialog({
  budget,
  goals,
  isOpen,
  onOpenChange,
  onSweep,
}: SweepToGoalDialogProps) {
  const { formatCurrency } = useAuth();
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedGoalId("");
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedGoalId || !budget) {
      setError("Please select a goal.");
      return;
    }
    
    const selectedGoal = goals.find(g => g.id === selectedGoalId);
    if (!selectedGoal) {
      setError("Selected goal not found.");
      return;
    }

    setLoading(true);

    try {
        await onSweep(budget, selectedGoal);
        onOpenChange(false);
    } catch (err) {
        setError("Failed to sweep funds. Please try again.");
    } finally {
        setLoading(false);
    }
  };
  
  const remainingAmount = budget ? budget.limit - budget.spent : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Sweep to Goal</DialogTitle>
            <DialogDescription>
              Transfer the remaining amount from your budget to a financial goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Remaining in '{budget?.category}' budget
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(remainingAmount)}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="goal">
                Select Goal to Contribute To
              </Label>
               <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading || !selectedGoalId}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Sweep {formatCurrency(remainingAmount)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
