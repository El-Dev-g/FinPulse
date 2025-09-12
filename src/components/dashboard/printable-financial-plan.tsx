// src/components/dashboard/printable-financial-plan.tsx
import React from 'react';
import { Advice } from "@/lib/types";
import { Logo } from "../logo";
import { format } from 'date-fns';
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface PrintableFinancialPlanProps {
    plan: Advice;
    id: string;
}

export const PrintableFinancialPlan = ({ plan, id }: PrintableFinancialPlanProps) => {
  return (
    <div id={id} className="p-8 font-body">
        <header className="flex justify-between items-center mb-8 pb-4 border-b">
            <Logo />
            <div>
                <h1 className="text-2xl font-bold font-headline">Your AI Financial Plan</h1>
                 <p className="text-muted-foreground text-sm text-right">
                    Generated on {format(new Date(), "LLL dd, y")}
                </p>
            </div>
        </header>

        <section>
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

            <div className="space-y-4 mt-8">
                {plan.steps.map((step, index) => (
                    <Card key={index} className="shadow-none border">
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
        </section>

        <footer className="mt-12 pt-4 border-t text-center text-xs text-muted-foreground">
            <p>This advice is AI-generated and for informational purposes only. Consult with a professional financial advisor for personalized guidance.</p>
            <p>FinPulse - Your Financial Health Companion</p>
        </footer>
    </div>
  );
};

PrintableFinancialPlan.displayName = 'PrintableFinancialPlan';
