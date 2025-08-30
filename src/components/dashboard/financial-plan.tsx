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
    <Card className="mt-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-headline text-primary">
          <Sparkles className="h-6 w-6" />
          {plan.title}
        </CardTitle>
        <CardDescription className="text-lg italic">
            {plan.subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
            {plan.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-green-500 mt-1" />
                    </div>
                    <div>
                        <h4 className="font-semibold">Step {index + 1}</h4>
                        <p className="text-muted-foreground">{step}</p>
                    </div>
                </li>
            ))}
        </ol>
      </CardContent>
    </Card>
  );
}
