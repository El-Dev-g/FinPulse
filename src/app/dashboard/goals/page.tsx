// src/app/dashboard/goals/page.tsx
"use client";

import React from "react";
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
import { goalsData } from "@/lib/placeholder-data";
import { Plus } from "lucide-react";

export default function GoalsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
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
          <Button>
            <Plus className="mr-2" />
            Add New Goal
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goalsData.map((goal) => {
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
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full">
                    Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
