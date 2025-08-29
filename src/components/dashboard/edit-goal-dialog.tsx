// src/components/dashboard/edit-goal-dialog.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import type { Goal } from "@/app/dashboard/goals/page";
import { Textarea } from "../ui/textarea";

interface EditGoalDialogProps {
  goal: Goal | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEditGoal: (updatedGoal: Goal) => void;
}

export function EditGoalDialog({
  goal,
  isOpen,
  onOpenChange,
  onEditGoal,
}: EditGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setCurrent(goal.current.toString());
      setTarget(goal.target.toString());
      setAdvice(goal.advice || "");
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !target || !current) {
      setError("Please fill out all fields.");
      return;
    }

    const currentAmount = parseFloat(current);
    const targetAmount = parseFloat(target);

    if (
      isNaN(targetAmount) ||
      targetAmount <= 0 ||
      isNaN(currentAmount) ||
      currentAmount < 0
    ) {
      setError("Please enter valid amounts.");
      return;
    }

    if (currentAmount > targetAmount) {
      setError("Current amount cannot be greater than the target amount.");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (goal) {
        onEditGoal({
          ...goal,
          title,
          current: currentAmount,
          target: targetAmount,
          advice,
        });
      }
      setLoading(false);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Financial Goal</DialogTitle>
            <DialogDescription>
              Update the details for your financial goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Goal Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Save for Vacation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">
                Current Amount
              </Label>
              <Input
                id="current"
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="e.g., 1500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">
                Target Amount
              </Label>
              <Input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., 5000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advice">
                AI Advice (Optional)
              </Label>
              <Textarea
                id="advice"
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="e.g., Cut down on daily coffees to save $5 a day."
                rows={3}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
