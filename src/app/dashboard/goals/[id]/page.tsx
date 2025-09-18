
// src/app/dashboard/goals/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { getGoal, getTasks, getTransactions, addTask, getProject } from "@/lib/db";
import { ArrowLeft, Calculator, Sparkles, ClipboardList, Loader, Lightbulb, Plus, FolderKanban } from "lucide-react";
import Link from "next/link";
import { ActivityList } from "@/components/dashboard/activity-list";
import type { ClientGoal, ClientFinancialTask, ClientTransaction, Goal, Transaction, FinancialTask, Advice, Project } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { processGoal, processTasks, processTransactions } from "@/lib/utils";
import { AddTaskDialog } from "@/components/dashboard/add-task-dialog";
import { Badge } from "@/components/ui/badge";

export default function GoalDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user, formatCurrency } = useAuth();
  
  const [goal, setGoal] = useState<ClientGoal | null>(null);
  const [linkedProject, setLinkedProject] = useState<Project | null>(null);
  const [relatedTransactions, setRelatedTransactions] = useState<ClientTransaction[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<ClientFinancialTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || typeof id !== 'string') return;
    setLoading(true);
    try {
      const goalData = await getGoal(id);
      if (!goalData) {
        setGoal(null);
        setLoading(false);
        return;
      }
      
      const [transactionsData, tasksData, projectData] = await Promise.all([
        getTransactions(),
        getTasks(),
        goalData.projectId ? getProject(goalData.projectId) : Promise.resolve(null),
      ]);

      setGoal(processGoal(goalData as Goal));
      setLinkedProject(projectData as Project | null);
      
      const filteredTransactions = transactionsData.filter(t => t.goalId === id);
      setRelatedTransactions(processTransactions(filteredTransactions as Transaction[]));
      
      const filteredTasks = tasksData.filter(t => t.goalId === id);
      setRelatedTasks(processTasks(filteredTasks as FinancialTask[]));

    } catch (error) {
      console.error("Error fetching goal details:", error);
      setGoal(null);
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTask = async (newTask: Omit<FinancialTask, "id" | "status" | "createdAt">) => {
    await addTask({ ...newTask, status: "To Do", goalId: id as string });
    fetchData();
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 md:p-6 lg:p-8">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  if (!goal) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center md:p-6 lg:p-8">
        <h2 className="mb-4 text-2xl font-bold">Goal Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn't find the goal you're looking for.
        </p>
        <Button asChild>
          <Link href="/dashboard/goals">
            <ArrowLeft className="mr-2" />
            Back to Goals
          </Link>
        </Button>
      </main>
    );
  }

  const progress = (goal.current / goal.target) * 100;
  

  return (
    <>
    <main className="flex-1 space-y-8 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/goals">
              <ArrowLeft className="mr-2" />
              Back to All Goals
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-headline">
                  {goal.title}
                </CardTitle>
                <CardDescription>
                  Your progress towards this financial milestone.
                </CardDescription>
                {linkedProject && (
                  <Link href={`/dashboard/projects/${linkedProject.id}`} className="!mt-4">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-muted">
                        <FolderKanban className="mr-2 h-4 w-4" />
                        Linked to Project: {linkedProject.name}
                    </Badge>
                  </Link>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(goal.current)}
                    </span>
                    <span className="text-muted-foreground">
                      Target: {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-4" />
                  <p className="mt-2 text-right text-sm text-muted-foreground">
                    {progress.toFixed(1)}% Complete
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Remaining</p>
                    <p className="font-semibold">
                      {formatCurrency(goal.target - goal.current)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target</p>
                    <p className="font-semibold">
                      {formatCurrency(goal.target)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 sm:flex-row">
                 <Button asChild className="w-full">
                  <Link href={`/dashboard/calculator?tab=goals&target=${goal.target}&current=${goal.current}`}>
                    <Calculator className="mr-2" />
                    Use Calculator
                  </Link>
                </Button>
                 <Button asChild variant="outline" className="w-full">
                  <Link href={`/dashboard/advisor?goalId=${goal.id}`}>
                    <Lightbulb className="mr-2" />
                    AI Advisor
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            {goal.advice && (
               <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {goal.advice.title}
                    </CardTitle>
                    <CardDescription className="italic">
                      {goal.advice.subtitle}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <ol className="list-inside list-decimal space-y-3 text-sm text-muted-foreground">
                      {goal.advice.steps && Array.isArray(goal.advice.steps) && goal.advice.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                </CardContent>
               </Card>
            )}
          </div>
          <div className="space-y-8">
            <ActivityList 
              transactions={relatedTransactions}
              title="Goal Contributions"
              description="Transactions assigned to this goal."
            />
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            Related Tasks
                        </CardTitle>
                        <CardDescription>Tasks to help you reach this goal.</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setIsAddTaskOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New
                    </Button>
                 </CardHeader>
                 <CardContent>
                    <ActivityList tasks={relatedTasks} title="" description="" />
                 </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
     <AddTaskDialog
        isOpen={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onAddTask={handleAddTask}
        goals={[]}
        defaultGoalId={id as string}
      />
    </>
  );
}
