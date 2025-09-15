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
import { getProject, getTasks, getTransactions } from "@/lib/db";
import { ArrowLeft, Calculator, ClipboardList, Loader, Plus } from "lucide-react";
import Link from "next/link";
import { ActivityList } from "@/components/dashboard/activity-list";
import type { ClientProject, ClientFinancialTask, ClientTransaction, Project, Transaction, FinancialTask, Goal } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { processProject, processTasks, processTransactions } from "@/lib/utils";
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
  const [loading, setLoading] = useState(true);

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || typeof id !== 'string') return;
    setLoading(true);
    try {
      const [projectData, transactionsData, tasksData] = await Promise.all([
        getProject(id),
        getTransactions(),
        getTasks(),
      ]);

      if (projectData) {
        setProject(processProject(projectData as Project));
        
        const filteredTransactions = transactionsData.filter(t => t.projectId === id);
        setRelatedTransactions(processTransactions(filteredTransactions as Transaction[]));
        
        const filteredTasks = tasksData.filter(t => t.projectId === id);
        setRelatedTasks(processTasks(filteredTasks as FinancialTask[]));

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
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <p className="text-muted-foreground mb-8">
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
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-2" />
              Back to All Projects
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="p-0">
                  <div className="relative h-60 w-full">
                    <Image
                        src={project.imageUrl}
                        alt={project.name}
                        fill
                        className="object-cover rounded-t-lg"
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
              <CardContent className="px-6 space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(project.currentAmount)}
                    </span>
                    <span className="text-muted-foreground">
                      Target: {formatCurrency(project.targetAmount)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-4" />
                  <p className="text-right text-sm mt-2 text-muted-foreground">
                    {progress.toFixed(1)}% Complete
                  </p>
                </div>
              </CardContent>
              <CardFooter className="px-6 flex flex-col sm:flex-row gap-2">
                 <Button asChild className="w-full" onClick={() => setIsAddTransactionOpen(true)}>
                  <p><Plus className="mr-2" /> Add Funds</p>
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
            <ActivityList 
              transactions={relatedTransactions}
              title="Project Contributions"
              description="Transactions assigned to this project."
            />
            <ActivityList 
              tasks={relatedTasks}
              title="Related Tasks"
              description="Tasks to help you complete this project."
              Icon={ClipboardList}
            />
             <Card>
                <CardHeader>
                    <CardTitle>Add Task</CardTitle>
                    <CardDescription>Add a new task for this project.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={() => setIsAddTaskOpen(true)} className="w-full">
                        <Plus className="mr-2" /> New Task
                    </Button>
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
    />
    </>
  );
}
