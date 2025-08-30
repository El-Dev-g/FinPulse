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
import { getGoal, getTasks, getTransactions } from "@/lib/db";
import { ArrowLeft, Calculator, Sparkles, ClipboardList, Loader, Lightbulb } from "lucide-react";
import Link from "next/link";
import { ActivityList } from "@/components/dashboard/activity-list";
import type { ClientGoal, ClientFinancialTask, ClientTransaction, Goal, Transaction, FinancialTask, Advice } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { processGoal, processTasks, processTransactions } from "@/lib/utils";

export default function GoalDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  
  const [goal, setGoal] = useState<ClientGoal | null>(null);
  const [relatedTransactions, setRelatedTransactions] = useState<ClientTransaction[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<ClientFinancialTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || typeof id !== 'string') return;
    setLoading(true);
    try {
      const [goalData, transactionsData, tasksData] = await Promise.all([
        getGoal(id),
        getTransactions(),
        getTasks(),
      ]);

      if (goalData) {
        setGoal(processGoal(goalData as Goal));
        
        const filteredTransactions = transactionsData.filter(t => t.goalId === id);
        setRelatedTransactions(processTransactions(filteredTransactions as Transaction[]));
        
        const filteredTasks = tasksData.filter(t => t.goalId === id);
        setRelatedTasks(processTasks(filteredTasks as FinancialTask[]));

      } else {
        setGoal(null);
      }
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


  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  if (!goal) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">Goal Not Found</h2>
        <p className="text-muted-foreground mb-8">
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const progress = (goal.current / goal.target) * 100;
  

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/goals">
              <ArrowLeft className="mr-2" />
              Back to All Goals
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-headline">
                  {goal.title}
                </CardTitle>
                <CardDescription>
                  Your progress towards this financial milestone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(goal.current)}
                    </span>
                    <span className="text-muted-foreground">
                      Target: {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-4" />
                  <p className="text-right text-sm mt-2 text-muted-foreground">
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
              <CardFooter className="flex flex-col sm:flex-row gap-2">
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
                   <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
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
            <ActivityList 
              tasks={relatedTasks}
              title="Related Tasks"
              description="Tasks to help you reach this goal."
              Icon={ClipboardList}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
