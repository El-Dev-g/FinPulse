// src/components/dashboard/financial-plan.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Advice } from "@/lib/types";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface FinancialPlanProps {
  plan: Advice;
}

export function FinancialPlan({ plan }: FinancialPlanProps) {
  return (
    <div className="mt-8 space-y-6">
       <div className="text-center">
         <div className="inline-block bg-primary/10 p-3 rounded-full">
            <Sparkles className="h-8 w-8 text-primary" />
         </div>
        <h2 className="text-3xl font-bold tracking-tight font-headline mt-4 text-primary">
          {plan.title}
        </h2>
        <p className="mt-2 text-lg text-muted-foreground italic">
          {plan.subtitle}
        </p>
      </div>

      <div className="space-y-4">
        {plan.steps.map((step, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
               <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
               <CardTitle className="text-xl">
                Step {index + 1}
               </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground pl-10">
                    {step}
                </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
