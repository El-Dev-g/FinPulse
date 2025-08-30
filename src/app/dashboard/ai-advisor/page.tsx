// src/app/dashboard/ai-advisor/page.tsx
import { Bot } from "lucide-react";
import { FinancialTips } from "@/components/dashboard/financial-tips";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AiAdvisorPage() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Bot className="h-8 w-8" />
            AI Financial Advisor
          </h2>
          <p className="text-muted-foreground">
            Get personalized financial advice powered by AI.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your Personal Financial Plan</CardTitle>
            <CardDescription>
              Describe your financial situation and your primary goal, and our
              AI will generate a custom plan for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialTips />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
