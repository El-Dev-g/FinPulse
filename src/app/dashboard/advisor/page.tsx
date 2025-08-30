// src/app/dashboard/advisor/page.tsx
"use client";

import React, { useState } from "react";
import { AdvisorForm } from "@/components/dashboard/advisor-form";
import { FinancialPlan } from "@/components/dashboard/financial-plan";
import type { Advice } from "@/lib/types";
import { getFinancialAdvice } from "@/lib/actions";
import { Lightbulb, Loader } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { updateGoal } from "@/lib/db";

export default function AdvisorPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <AdvisorPageContent />
    </React.Suspense>
  )
}

function AdvisorPageContent() {
  const [plan, setPlan] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const initialGoalId = searchParams.get("goalId");
  const router = useRouter();


  const handleGetAdvice = async (prompt: string, goalId: string | null) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await getFinancialAdvice(prompt);
      
      if (goalId && result.advice) {
        // If a goalId was provided, save the advice to that goal
        // and then redirect to the goals page to see it.
        await updateGoal(goalId, { advice: result.advice });
        router.push(`/dashboard/goals?goalId=${goalId}&advice=${encodeURIComponent(JSON.stringify(result.advice))}`);
      } else if (result.advice) {
        // Otherwise, just display the plan on this page
        setPlan(result.advice);
      } else {
        throw new Error("No advice was generated.");
      }

    } catch (e: any) {
      setError("Sorry, we couldn't generate advice at this time. Please try again.");
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

        <AdvisorForm onGetAdvice={handleGetAdvice} loading={loading} initialGoalId={initialGoalId} />
        
        {loading && (
            <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Generating your personalized plan...</p>
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
