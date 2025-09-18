
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
import { Plus, Sparkles, Loader, Lock, Archive } from "lucide-react";
import { AddGoalDialog } from "@/components/dashboard/add-goal-dialog";
import { EditGoalDialog } from "@/components/dashboard/edit-goal-dialog";
import { useAuth } from "@/hooks/use-auth";
import type { Goal, Advice, AIPlan } from "@/lib/types";
import { addGoal, deleteGoal, getGoals, updateGoal, getAIPlans, permanentDeleteGoal, updateTasks } from "@/lib/db";
import { processGoals } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProBadge } from "@/components/pro-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


function GoalsPageContent() {
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [archivedGoals, setArchivedGoals] = useState<Goal[]>([]);
  const [aiPlans, setAiPlans] = useState<AIPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const { user, isPro, formatCurrency } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const goalLimit = 20;
  const hasReachedGoalLimit = !isPro && activeGoals.length >= goalLimit;

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dbActiveGoals, dbArchivedGoals, dbAIPlans] = await Promise.all([
        getGoals('active'),
        getGoals('archived'),
        getAIPlans(),
      ]);

      const adviceParam = searchParams.get("advice");
      const goalId = searchParams.get("goalId");

      if (adviceParam && goalId) {
        try {
          const parsedAdvice: Advice = JSON.parse(
            decodeURIComponent(adviceParam)
          );
          const goalIndex = dbActiveGoals.findIndex((g) => g.id === goalId);
          if (goalIndex !== -1) {
            dbActiveGoals[goalIndex].advice = parsedAdvice;
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

      const processedActive = processGoals(dbActiveGoals as any[]);
      const processedArchived = processGoals(dbArchivedGoals as any[]);
      setActiveGoals(processedActive);
      setArchivedGoals(processedArchived);
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

  const handleAddGoal = async (newGoal: Omit<Goal, "id" | "createdAt" | "status">, linkedTaskIds: string[] = []) => {
    const newGoalId = await addGoal(newGoal, !isPro);
    if (linkedTaskIds.length > 0) {
      await updateTasks(linkedTaskIds, { goalId: newGoalId });
    }
    fetchData();
  };

  const handleEditGoal = async (updatedGoal: Goal, linkedTaskIds: string[], unlinkedTaskIds: string[]) => {
    await updateGoal(updatedGoal.id, updatedGoal);
    if (linkedTaskIds.length > 0) {
      await updateTasks(linkedTaskIds, { goalId: updatedGoal.id });
    }
    if (unlinkedTaskIds.length > 0) {
      await updateTasks(unlinkedTaskIds, { goalId: "" }); // Using empty string to signify unlinking
    }
    fetchData();
  };

  const handleArchiveGoal = async (goalId: string) => {
    await deleteGoal(goalId);
    fetchData();
  };
  
  const handlePermanentDelete = async (goalId: string) => {
    await permanentDeleteGoal(goalId);
    fetchData();
  }

  if(loading){
    return <div className="flex h-full w-full items-center justify-center"><Loader className="animate-spin" /></div>
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Financial Goals
            </h2>
            <p className="text-muted-foreground">
              Track and manage your financial milestones.
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                 <div className="relative">
                    <Button onClick={() => setIsAddGoalDialogOpen(true)} disabled={hasReachedGoalLimit}>
                      {hasReachedGoalLimit ? <Lock className="mr-2" /> : <Plus className="mr-2" />}
                      Add New Goal
                    </Button>
                    {hasReachedGoalLimit && (
                        <div className="absolute -top-2 -right-2">
                            <ProBadge />
                        </div>
                    )}
                </div>
              </TooltipTrigger>
              {hasReachedGoalLimit && (
                 <TooltipContent>
                    <p>Upgrade to Pro to add unlimited goals.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {hasReachedGoalLimit && (
            <div className="mb-6 p-4 bg-accent/30 border border-accent/50 rounded-lg text-center text-sm">
                <p className="font-semibold text-accent-foreground">You've reached your goal limit!</p>
                <p className="text-muted-foreground mt-1">The free plan allows for up to {goalLimit} active goals. <Button variant="link" className="p-0 h-auto" asChild><Link href="/dashboard/billing">Upgrade to Pro</Link></Button> to add more.</p>
            </div>
        )}

        <Tabs defaultValue="active">
            <TabsList className="mb-4">
                <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
                <TabsTrigger value="archived">Archived ({archivedGoals.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
                <GoalGrid goals={activeGoals} onEdit={setEditingGoal} formatCurrency={formatCurrency} />
                 {activeGoals.length === 0 && !loading && (
                    <div className="text-center py-12 text-muted-foreground">
                        <h3 className="text-lg font-semibold">No Active Goals Yet!</h3>
                        <p>Click "Add New Goal" to get started.</p>
                    </div>
                )}
            </TabsContent>
             <TabsContent value="archived">
                <GoalGrid goals={archivedGoals} onEdit={setEditingGoal} formatCurrency={formatCurrency} isArchived />
                 {archivedGoals.length === 0 && !loading && (
                    <div className="text-center py-12 text-muted-foreground">
                        <h3 className="text-lg font-semibold">No Archived Goals</h3>
                        <p>When you delete a goal, it will appear here.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
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
        onArchiveGoal={handleArchiveGoal}
        onPermanentDelete={handlePermanentDelete}
      />
    </main>
  );
}

function GoalGrid({ goals, onEdit, formatCurrency, isArchived = false }: { goals: Goal[], onEdit: (goal: Goal) => void, formatCurrency: (amount: number) => string, isArchived?: boolean }) {
    return (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
            return (
              <Card key={goal.id} className={isArchived ? "opacity-60" : ""}>
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
                    onClick={() => onEdit(goal)}
                  >
                    {isArchived ? "View/Restore" : "Edit"}
                  </Button>
                  {!isArchived && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        asChild
                    >
                        <Link href={`/dashboard/goals/${goal.id}`}>Details</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
    )
}


export default function GoalsPage() {
  return (
    <React.Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader className="animate-spin" /></div>}>
      <GoalsPageContent />
    </React.Suspense>
  )
}
