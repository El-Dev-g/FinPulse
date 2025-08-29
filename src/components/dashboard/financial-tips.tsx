"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Loader, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { generateAdviceAction } from "@/lib/actions";
import { useSearchParams, useRouter } from "next/navigation";

const formSchema = z.object({
  spendingHabits: z
    .string()
    .min(20, "Please describe your spending habits in at least 20 characters."),
  financialGoals: z
    .string()
    .min(20, "Please describe your financial goals in at least 20 characters."),
});

export function FinancialTips() {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spendingHabits: "",
      financialGoals: "",
    },
  });

  useEffect(() => {
    const goal = searchParams.get("goal");
    if (goal) {
      form.setValue("financialGoals", `My primary goal is to ${goal}.`);
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setAdvice(null);
    const result = await generateAdviceAction(values);
    setLoading(false);
    
    if (result.success && result.advice) {
      setAdvice(result.advice);
      const goalId = searchParams.get("goalId");
      if (goalId) {
        // Redirect back to the goals page with the advice
        router.push(
          `/dashboard/goals?goalId=${goalId}&advice=${encodeURIComponent(
            result.advice
          )}`
        );
      }
    } else {
      setError(result.message || "An unexpected error occurred.");
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              AI Financial Advisor
            </CardTitle>
            <CardDescription>
              Get personalized tips to improve your financial health.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="spendingHabits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Spending Habits</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I spend a lot on dining out, online shopping for clothes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="financialGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Financial Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I want to save for a house down payment, pay off my student loans..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(advice || error) && (
              <div className="p-4 bg-muted/50 rounded-lg border border-muted-foreground/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Your Personalized Advice
                </h4>
                {advice && <p className="text-sm whitespace-pre-wrap">{advice}</p>}
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Advice
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
