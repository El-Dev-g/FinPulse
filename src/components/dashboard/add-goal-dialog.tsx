// src/components/dashboard/add-goal-dialog.tsx
"use client";

import { useState } from "react";
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
import type { Goal, AIPlan } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface AddGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddGoal: (newGoal: Omit<Goal, "id" | "current" | "createdAt">) => Promise<void>;
  aiPlans?: AIPlan[];
}

export function AddGoalDialog({
  isOpen,
  onOpenChange,
  onAddGoal,
  aiPlans = [],
}: AddGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [adviceId, setAdviceId] = useState<string>("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !target) {
      setError("Please fill out title and target.");
      return;
    }

    const targetAmount = parseFloat(target);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    setLoading(true);

    const selectedPlan = aiPlans.find(p => p.id === adviceId);

    try {
      await onAddGoal({ 
        title, 
        target: targetAmount,
        advice: selectedPlan ? selectedPlan.advice : undefined,
      });
      onOpenChange(false);
      setTitle("");
      setTarget("");
      setAdviceId("none");
    } catch (err) {
       setError("Failed to add goal. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setTitle("");
        setTarget("");
        setAdviceId("none");
        setError(null);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Financial Goal</DialogTitle>
            <DialogDescription>
              What's your next financial milestone?
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
            {aiPlans.length > 0 && (
                <div className="space-y-2">
                <Label htmlFor="advice">Link an AI Plan (Optional)</Label>
                    <Select value={adviceId} onValueChange={setAdviceId}>
                        <SelectTrigger id="advice">
                            <SelectValue placeholder="Select a pre-generated plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {aiPlans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                    {plan.advice.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Add Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
