// src/app/dashboard/goals/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Plus, Sparkles, Loader } from "lucide-react";
import { AddGoalDialog } from "@/components/dashboard/add-goal-dialog";
import { EditGoalDialog } from "@/components/dashboard/edit-goal-dialog";
import { useAuth } from "@/hooks/use-auth";
import type { Goal, Advice, AIPlan } from "@/lib/types";
import { addGoal, deleteGoal, getGoals, updateGoal, getAIPlans } from "@/lib/db";
import { processGoals } from "@/lib/utils";

function GoalsPageContent() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [aiPlans, setAiPlans] = useState<AIPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const { user, formatCurrency } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dbGoals, dbAIPlans] = await Promise.all([
        getGoals('active'),
        getAIPlans(),
      ]);

      const adviceParam = searchParams.get("advice");
      const goalId = searchParams.get("goalId");

      if (adviceParam && goalId) {
        try {
          const parsedAdvice: Advice = JSON.parse(
            decodeURIComponent(adviceParam)
          );
          const goalIndex = dbGoals.findIndex((g) => g.id === goalId);
          if (goalIndex !== -1) {
            dbGoals[goalIndex].advice = parsedAdvice;
          }
        } catch (e) {
          console.error("Failed to parse advice from URL:", e);
        }

        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("advice");
        newParams.delete("goalId");
        router.replace(`/dashboard/goals?${newParams.toString()}`, {
          scroll: false,
        });
      }

      const processed = processGoals(dbGoals as any[]);
      setGoals(processed);
      setAiPlans(dbAIPlans as any[]);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  }, [user, searchParams, router]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddGoal = async (newGoal: Omit<Goal, "id" | "current" | "createdAt" | "status">) => {
    await addGoal({ ...newGoal, current: 0 });
    fetchData();
  };

  const handleEditGoal = async (updatedGoal: Goal) => {
    await updateGoal(updatedGoal.id, updatedGoal);
    fetchData();
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoal(goalId);
    fetchData();
  };

  if(loading){
    return <div className="flex h-full w-full items-center justify-center"><Loader className="animate-spin" /></div>
  }

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
                       <p className="line-clamp-2 italic">"{goal.advice.subtitle}"</p>
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
        {goals.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-lg font-semibold">No Goals Yet!</h3>
              <p>Click "Add New Goal" to get started.</p>
          </div>
        )}
      </div>
      <AddGoalDialog
        isOpen={isAddGoalDialogOpen}
        onOpenChange={setIsAddGoalDialogOpen}
        onAddGoal={handleAddGoal}
        aiPlans={aiPlans}
      />
      <EditGoalDialog
        goal={editingGoal}
        isOpen={!!editingGoal}
        onOpenChange={(isOpen) => !isOpen && setEditingGoal(null)}
        onEditGoal={handleEditGoal}
        onDeleteGoal={handleDeleteGoal}
      />
    </main>
  );
}


export default function GoalsPage() {
  return (
    <React.Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader className="animate-spin" /></div>}>
      <GoalsPageContent />
    </React.Suspense>
  )
}
