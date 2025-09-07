// src/app/dashboard/advisor/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AdvisorForm } from "@/components/dashboard/advisor-form";
import { FinancialPlan } from "@/components/dashboard/financial-plan";
import type { Advice, ClientAIPlan } from "@/lib/types";
import { getFinancialAdvice } from "@/lib/actions";
import { addAIPlan, updateGoal } from "@/lib/db";
import { Lightbulb, Loader, Sparkles, FileText } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAIPlans } from "@/lib/db";
import { PastPlansList } from "@/components/dashboard/past-plans-list";
import { useAuth } from "@/hooks/use-auth";
import { ProBadge } from "@/components/pro-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactToPrint from 'react-to-print';
import { PrintableFinancialPlan } from "@/components/dashboard/printable-financial-plan";

function UpgradeToPro() {
  return (
    <Card className="mt-8 text-center">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 font-headline">
          <Sparkles className="h-6 w-6 text-primary" />
          Unlock Your AI Financial Advisor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This is a Pro feature. Upgrade your plan to get personalized financial advice, create unlimited goals, and more.
        </p>
        <Button>Upgrade to Pro</Button>
      </CardContent>
    </Card>
  );
}


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
  const { user, isPro } = useAuth();
  
  const componentRef = useRef<HTMLDivElement>(null);


  const fetchPastPlans = useCallback(async () => {
    if (!user) return;
    try {
      const plans = (await getAIPlans()) as any[];
      // The process function for dates is missing, so we do it manually
      const processedPlans = plans.map(p => ({...p, createdAt: p.createdAt.toDate()}));
      setPastPlans(processedPlans);
    } catch(e) {
      console.error("Could not fetch past plans", e);
    }
  }, [user]);

  useEffect(() => {
    if (isPro) {
      fetchPastPlans();
    }
  }, [fetchPastPlans, isPro]);


  const handleGetAdvice = async (prompt: string, goalId: string | null) => {
    setLoading(true);
    setError(null);
    setPlan(null); // Clear current plan while generating new one
    try {
      const advice = await getFinancialAdvice(prompt);
      
      // Save all generated plans
      const newPlanId = await addAIPlan({
        prompt,
        advice,
        goalId: goalId || undefined,
      });

      // If a goalId was provided, also save the advice to that goal
      if (goalId && goalId !== 'none') {
        await updateGoal(goalId, { advice });
        
        // Redirect to the goals page to see the new advice attached
        router.push(
          `/dashboard/goals?goalId=${goalId}&advice=${encodeURIComponent(
            JSON.stringify(advice)
          )}`
        );
      } else {
        // Otherwise, just refresh the past plans list. The plan will not be displayed until clicked.
        // And display the plan we just generated.
        setPlan(advice);
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
  
  const handleSelectPlan = (selectedAdvice: Advice) => {
    // If the same plan is clicked again, hide it. Otherwise, show the new one.
    if (plan && JSON.stringify(plan) === JSON.stringify(selectedAdvice)) {
      setPlan(null);
    } else {
      setPlan(selectedAdvice);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <Lightbulb className="h-8 w-8" />
              AI Financial Advisor
            </h2>
            {isPro && <ProBadge />}
          </div>
          <p className="text-muted-foreground">
            Get a personalized financial plan based on your goals.
          </p>
        </div>

        {!isPro ? <UpgradeToPro /> : (
          <>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <AdvisorForm
                  onGetAdvice={handleGetAdvice}
                  loading={loading}
                  initialGoalId={initialGoalId}
                />
              </div>
              <div>
                <PastPlansList
                  plans={pastPlans}
                  onSelectPlan={handleSelectPlan}
                  activePlan={plan}
                />
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

            {plan && !loading && (
              <>
                <div className="text-right mt-4">
                  <ReactToPrint
                    trigger={() => (
                      <Button variant="outline">
                        <FileText className="mr-2" />
                        Download PDF
                      </Button>
                    )}
                    content={() => componentRef.current}
                    documentTitle={`FinPulse AI Plan - ${plan?.title || 'Financial Advice'}`}
                  />
                </div>
                <FinancialPlan plan={plan} />
                 <div className="hidden">
                    {plan && <PrintableFinancialPlan ref={componentRef} plan={plan} />}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
