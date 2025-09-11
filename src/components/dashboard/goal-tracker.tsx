
// src/components/dashboard/goal-tracker.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import React from "react";
import type { ClientGoal } from "@/lib/types";

interface GoalTrackerProps {
  goals: ClientGoal[];
}

export function GoalTracker({ goals }: GoalTrackerProps) {
  const { formatCurrency } = useAuth();
  
  const topGoals = goals.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Goals</CardTitle>
        <CardDescription>
          Track your progress towards your financial milestones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topGoals.length > 0 ? (
          <div className="space-y-6">
            {topGoals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">{goal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(goal.current)}
                      </span>{" "}
                      / {formatCurrency(goal.target)}
                    </p>
                  </div>
                  <Progress value={progress} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>No goals set yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
