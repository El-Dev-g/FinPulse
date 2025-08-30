// src/app/dashboard/advisor/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdvisorForm } from "@/components/dashboard/advisor-form";
import { FinancialPlan } from "@/components/dashboard/financial-plan";
import type { Advice, ClientAIPlan } from "@/lib/types";
import { getFinancialAdvice } from "@/lib/actions";
import { Lightbulb, Loader } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAIPlans } from "@/lib/db";
import { PastPlansList } from "@/components/dashboard/past-plans-list";
import { useAuth } from "@/hooks/use-auth";

export default function AdvisorPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <AdvisorPageContent />
    </React.Suspense>
  );
}

function AdvisorPageContent() {
  const [plan, setPlan] = useState<Advice | null>(null);
  const [pastPlans, setPastPlans] = useState<ClientAIPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const initialGoalId = searchParams.get("goalId");
  const router = useRouter();
  const { user } = useAuth();


  const fetchPastPlans = useCallback(async () => {
    if (!user) return;
    try {
      const plans = (await getAIPlans()) as any[];
      // The process function for dates is missing, so we do it manually
      const processedPlans = plans.map(p => ({...p, createdAt: p.createdAt.toDate()}));
      setPastPlans(processedPlans);
      // Set the most recent plan as the active plan
      if (processedPlans.length > 0 && !plan) {
        setPlan(processedPlans[0].advice);
      }
    } catch(e) {
      console.error("Could not fetch past plans", e);
    }
  }, [user, plan]);

  useEffect(() => {
    fetchPastPlans();
  }, [fetchPastPlans]);


  const handleGetAdvice = async (prompt: string, goalId: string | null) => {
    setLoading(true);
    setError(null);
    setPlan(null); // Clear current plan while generating new one
    try {
      const result = await getFinancialAdvice(prompt, goalId);

      if (result.goalId) {
        // If a goalId was provided, redirect to the goals page to see it.
        // The advice is already saved to the goal in the server action.
        router.push(
          `/dashboard/goals?goalId=${result.goalId}&advice=${encodeURIComponent(
            JSON.stringify(result.advice)
          )}`
        );
      } else {
        // Otherwise, display the plan on this page and refresh the past plans list
        setPlan(result.advice);
        fetchPastPlans();
      }
    } catch (e: any) {
      setError(
        "Sorry, we couldn't generate advice at this time. Please try again."
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Lightbulb className="h-8 w-8" />
            AI Financial Advisor
          </h2>
          <p className="text-muted-foreground">
            Get a personalized financial plan based on your goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <AdvisorForm
              onGetAdvice={handleGetAdvice}
              loading={loading}
              initialGoalId={initialGoalId}
            />
          </div>
          <div>
            <PastPlansList plans={pastPlans} onSelectPlan={setPlan} />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">
              Generating your personalized plan...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-destructive">
            <h3 className="text-lg font-semibold">An Error Occurred</h3>
            <p>{error}</p>
          </div>
        )}

        {plan && !loading && <FinancialPlan plan={plan} />}
      </div>
    </main>
  );
}
