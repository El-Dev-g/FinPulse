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
import { getGoals } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import React, { useState, useEffect } from "react";
import type { Goal } from "@/lib/types";
import { Loader } from "lucide-react";
import { processGoals } from "@/lib/utils";

export function GoalTracker() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;
      try {
        const dbGoals = await getGoals();
        const processed = processGoals(dbGoals as any[]);
        setGoals(processed.slice(0, 3)); // Show top 3 goals
      } catch (error) {
        console.error("Error fetching goals: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Goals</CardTitle>
        <CardDescription>
          Track your progress towards your financial milestones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : goals.length > 0 ? (
          <div className="space-y-6">
            {goals.map((goal) => {
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
