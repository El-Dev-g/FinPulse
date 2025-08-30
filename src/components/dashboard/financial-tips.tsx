// src/components/dashboard/financial-tips.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateAdviceAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { type PersonalizedFinancialAdviceOutput } from "@/ai/flows/personalized-financial-advice";

const formSchema = z.object({
  financialSituation: z.string().min(50, {
    message: "Please describe your financial situation in at least 50 characters.",
  }),
  goal: z.string().min(10, {
    message: "Please describe your goal in at least 10 characters.",
  }),
});

export function FinancialTips() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<PersonalizedFinancialAdviceOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialSituation: "",
      goal: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const result = await generateAdviceAction(values);
      setAdvice(result);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="financialSituation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Financial Situation</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your income, major expenses, savings, and any debts..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The more detail you provide, the better the advice.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Primary Financial Goal</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Save for a house down payment, pay off credit card debt, build an emergency fund."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2" />
            )}
            Generate Advice
          </Button>
        </form>
      </Form>

      {error && (
         <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
            <p className="font-bold">Error Generating Advice</p>
            <p>{error}</p>
         </div>
      )}

      {advice && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Sparkles className="text-primary" />
              {advice.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="italic text-muted-foreground">{advice.subtitle}</p>
            <ol className="list-decimal list-inside space-y-3 bg-background/50 p-4 rounded-md">
              {advice.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
