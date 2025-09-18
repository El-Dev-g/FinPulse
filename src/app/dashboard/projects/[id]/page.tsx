
// src/app/dashboard/projects/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
import { getProject, getTasks, getTransactions, getGoals } from "@/lib/db";
import { ArrowLeft, Calculator, ClipboardList, Loader, Plus, Target } from "lucide-react";
import Link from "next/link";
import { ActivityList } from "@/components/dashboard/activity-list";
import type { ClientProject, ClientFinancialTask, ClientTransaction, Project, Transaction, FinancialTask, Goal, ClientGoal } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { processProject, processTasks, processTransactions, processGoals } from "@/lib/utils";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { AddTaskDialog } from "@/components/dashboard/add-task-dialog";
import { addTransaction, addTask } from "@/lib/db";


export default function ProjectDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user, formatCurrency } = useAuth();
  
  const [project, setProject] = useState<ClientProject | null>(null);
  const [relatedTransactions, setRelatedTransactions] = useState<ClientTransaction[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<ClientFinancialTask[]>([]);
  const [linkedGoal, setLinkedGoal] = useState<ClientGoal | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || typeof id !== 'string') return;
    setLoading(true);
    try {
      const [projectData, transactionsData, tasksData, goalsData] = await Promise.all([
        getProject(id),
        getTransactions(),
        getTasks(),
        getGoals('all'),
      ]);

      if (projectData) {
        
        const filteredTransactions = transactionsData.filter(t => t.projectId === id);
        const currentAmount = filteredTransactions.reduce((sum, t) => sum - t.amount, 0);
        const processedProject = processProject({...(projectData as Project), currentAmount });

        setProject(processedProject);
        
        setRelatedTransactions(processTransactions(filteredTransactions as Transaction[]));
        
        const filteredTasks = tasksData.filter(t => t.projectId === id);
        setRelatedTasks(processTasks(filteredTasks as FinancialTask[]));

        const foundGoal = goalsData.find(g => g.projectId === id);
        setLinkedGoal(foundGoal ? processGoals([foundGoal as Goal])[0] : null);

      } else {
        setProject(null);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id" | "Icon" | "createdAt">) => {
    await addTransaction({ ...newTransaction, projectId: id as string });
    fetchData();
  };
  
  const handleAddTask = async (newTask: Omit<FinancialTask, "id" | "status" | "createdAt">) => {
    await addTask({ ...newTask, status: "To Do", projectId: id as string });
    fetchData();
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 md:p-6 lg:p-8">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center md:p-6 lg:p-8">
        <h2 className="mb-4 text-2xl font-bold">Project Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn't find the project you're looking for.
        </p>
        <Button asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2" />
            Back to Projects
          </Link>
        </Button>
      </main>
    );
  }

  const progress = (project.currentAmount / project.targetAmount) * 100;

  return (
    <>
    <main className="flex-1 space-y-8 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-2" />
              Back to All Projects
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader className="p-0">
                  <div className="relative h-60 w-full">
                    <Image
                        src={project.imageUrl}
                        alt={project.name}
                        fill
                        className="rounded-t-lg object-cover"
                        data-ai-hint="project goal"
                    />
                  </div>
                   <div className="p-6">
                    <CardTitle className="text-3xl font-headline">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {project.description}
                    </CardDescription>
                   </div>
              </CardHeader>
              <CardContent className="space-y-6 px-6">
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(project.currentAmount)}
                    </span>
                    <span className="text-muted-foreground">
                      Target: {formatCurrency(project.targetAmount)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-4" />
                  <p className="mt-2 text-right text-sm text-muted-foreground">
                    {progress.toFixed(1)}% Complete
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 px-6 sm:flex-row">
                 <Button asChild className="w-full" onClick={() => setIsAddTransactionOpen(true)}>
                  <p><Plus className="mr-2" /> Add Expense</p>
                </Button>
                 <Button asChild variant="outline" className="w-full">
                  <Link href={`/dashboard/calculator`}>
                    <Calculator className="mr-2" />
                    Use Calculator
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="space-y-8">
             {linkedGoal && (
               <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Funding Goal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/dashboard/goals/${linkedGoal.id}`} className="block hover:bg-muted/50 p-4 rounded-lg border">
                      <p className="font-semibold">{linkedGoal.title}</p>
                      <Progress value={(linkedGoal.current / linkedGoal.target) * 100} className="mt-2 h-2"/>
                      <p className="text-xs text-muted-foreground mt-1 text-right">{formatCurrency(linkedGoal.current)} / {formatCurrency(linkedGoal.target)}</p>
                    </Link>
                  </CardContent>
                </Card>
            )}
            <ActivityList 
              transactions={relatedTransactions}
              title="Project Expenses"
              description="Transactions assigned to this project."
            />
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            Related Tasks
                        </CardTitle>
                        <CardDescription>Tasks to help you complete this project.</CardDescription>
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
    <AddTransactionDialog
      isOpen={isAddTransactionOpen}
      onOpenChange={setIsAddTransactionOpen}
      onAddTransaction={handleAddTransaction}
    />
     <AddTaskDialog
      isOpen={isAddTaskOpen}
      onOpenChange={setIsAddTaskOpen}
      onAddTask={handleAddTask}
      goals={[]}
      defaultProjectId={id as string}
    />
    </>
  );
}
