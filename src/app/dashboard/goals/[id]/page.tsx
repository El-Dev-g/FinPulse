// src/app/dashboard/goals/[id]/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
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
import { goalsData, transactionsData, tasksData } from "@/lib/placeholder-data";
import { ArrowLeft, Calculator, Bot, Sparkles, ClipboardList } from "lucide-react";
import Link from "next/link";
import { ActivityList } from "@/components/dashboard/activity-list";

export default function GoalDetailPage() {
  const params = useParams();
  const { id } = params;

  // In a real app, you'd fetch this from your state management or API
  const goal = goalsData.find((g) => g.id === id);

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
  
  const relatedTransactions = transactionsData.filter(t => t.goalId === goal.id);
  const relatedTasks = tasksData.filter(t => t.goalId === goal.id);

  const aiAdvisorLink = `/dashboard/ai-advisor?goal=${encodeURIComponent(
    goal.title
  )}&goalId=${goal.id}${
    goal.advice ? `&advice=${encodeURIComponent(goal.advice)}` : ""
  }`;

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
                    Plan with Calculator
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href={aiAdvisorLink}>
                    <Bot className="mr-2" />
                    Get AI Savings Tips
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            {goal.advice && (
               <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Generated Advice
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{goal.advice}</p>
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
