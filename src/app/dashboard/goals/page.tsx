// src/app/dashboard/goals/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { goalsData, type Goal as GoalType } from "@/lib/placeholder-data";
import { Plus, Sparkles } from "lucide-react";
import { AddGoalDialog } from "@/components/dashboard/add-goal-dialog";
import { EditGoalDialog } from "@/components/dashboard/edit-goal-dialog";

export interface Goal extends GoalType {}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(goalsData);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const advice = searchParams.get('advice');
    const goalId = searchParams.get('goalId');

    if (advice && goalId) {
      setGoals(prevGoals =>
        prevGoals.map(goal =>
          goal.id === goalId ? { ...goal, advice: decodeURIComponent(advice) } : goal
        )
      );
    }
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddGoal = (newGoal: Omit<Goal, "id" | "current">) => {
    const goalWithId: Goal = {
      ...newGoal,
      id: `goal_${goalsData.length + 1}`,
      current: 0,
    };
    // Add to the original array to simulate a database update
    goalsData.push(goalWithId);
    setGoals([...goalsData]);
  };

  const handleEditGoal = (updatedGoal: Goal) => {
    const goalIndex = goalsData.findIndex(g => g.id === updatedGoal.id);
    if (goalIndex !== -1) {
      goalsData[goalIndex] = updatedGoal;
    }
    setGoals([...goalsData]);
  };

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Financial Goals
            </h2>
            <p className="text-muted-foreground">
              Track and manage your financial milestones.
            </p>
          </div>
          <Button onClick={() => setIsAddGoalDialogOpen(true)}>
            <Plus className="mr-2" />
            Add New Goal
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle>{goal.title}</CardTitle>
                  <CardDescription>
                    Target: {formatCurrency(goal.target)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress: {progress.toFixed(0)}%</span>
                      <span>{formatCurrency(goal.current)}</span>
                    </div>
                  </div>
                  {goal.advice && (
                    <div className="mt-4 p-3 bg-accent/50 rounded-lg text-sm text-accent-foreground border border-accent/20 flex items-start gap-2">
                       <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                       <p className="line-clamp-2">{goal.advice}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setEditingGoal(goal)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/dashboard/goals/${goal.id}`}>Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      <AddGoalDialog
        isOpen={isAddGoalDialogOpen}
        onOpenChange={setIsAddGoalDialogOpen}
        onAddGoal={handleAddGoal}
      />
      <EditGoalDialog
        goal={editingGoal}
        isOpen={!!editingGoal}
        onOpenChange={(isOpen) => !isOpen && setEditingGoal(null)}
        onEditGoal={handleEditGoal}
      />
    </main>
  );
}
