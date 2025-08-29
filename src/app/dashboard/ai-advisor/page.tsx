// src/app/dashboard/ai-advisor/page.tsx
"use client";

import { FinancialTips } from "@/components/dashboard/financial-tips";
import React from "react";

export default function AIAdvisorPage() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            AI Financial Advisor
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Leverage the power of AI to get tailored financial advice. Describe
            your spending habits and goals to receive personalized
            recommendations to help you improve your financial health.
          </p>
        </div>
        <FinancialTips />
      </div>
    </main>
  );
}
