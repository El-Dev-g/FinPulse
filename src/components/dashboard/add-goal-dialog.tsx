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
import type { Goal } from "@/app/dashboard/goals/page";
import { Textarea } from "../ui/textarea";

interface AddGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddGoal: (newGoal: Omit<Goal, "id" | "current">) => void;
}

export function AddGoalDialog({
  isOpen,
  onOpenChange,
  onAddGoal,
}: AddGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
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

    // Simulate API call
    setTimeout(() => {
      onAddGoal({ title, target: targetAmount, advice });
      setLoading(false);
      onOpenChange(false);
      setTitle("");
      setTarget("");
      setAdvice("");
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setTitle("");
        setTarget("");
        setAdvice("");
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
             <div className="space-y-2">
              <Label htmlFor="advice">
                Personal Notes (Optional)
              </Label>
              <Textarea
                id="advice"
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="e.g., My strategy for this goal is to..."
                rows={3}
              />
            </div>
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
