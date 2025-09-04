// src/components/dashboard/advisor-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getGoals } from "@/lib/db";
import { generateAdvisorPrompt } from "@/lib/actions";
import type { Goal } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  prompt: z.string().min(20, "Please provide more detail for better advice."),
  goalId: z.string().optional(),
});

interface AdvisorFormProps {
  onGetAdvice: (prompt: string, goalId: string | null) => void;
  loading: boolean;
  initialGoalId?: string | null;
}

export function AdvisorForm({ onGetAdvice, loading, initialGoalId }: AdvisorFormProps) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function fetchGoals() {
      if (user) {
        const dbGoals = (await getGoals('active')) as Goal[];
        setGoals(dbGoals);
      }
    }
    fetchGoals();
  }, [user]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      goalId: initialGoalId || "none",
    },
  });
  
  useEffect(() => {
    if (initialGoalId) {
      form.setValue("goalId", initialGoalId);
    }
  }, [initialGoalId, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedGoal = goals.find(g => g.id === values.goalId);
    let fullPrompt = values.prompt;
    if (selectedGoal) {
        fullPrompt += `\n\nThis advice should be tailored to helping me achieve my specific goal: "${selectedGoal.title}", for which I am trying to save ${selectedGoal.target} and have currently saved ${selectedGoal.current}.`;
    }
    onGetAdvice(fullPrompt, values.goalId === 'none' ? null : values.goalId || null);
  }
  
  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
        const generatedPrompt = await generateAdvisorPrompt();
        form.setValue('prompt', generatedPrompt);
    } catch(e) {
        console.error("Failed to generate prompt", e);
        form.setError('prompt', { message: "Could not generate prompt. Please try again." });
    } finally {
        setIsGenerating(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Your Financial Situation & Goals</FormLabel>
                    <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleGeneratePrompt} disabled={isGenerating}>
                        {isGenerating ? <Loader className="mr-2 h-3 w-3 animate-spin"/> : <Wand2 className="mr-2 h-3 w-3" />}
                        Generate with AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your current financial situation, income, expenses, and what you want to achieve. The more detail, the better the advice!"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    For example: "I'm a 25-year-old software developer earning $80k/year. I have $10k in savings, $5k in student loans, and my monthly rent is $1500. I want to buy a house in 5 years."
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to a Specific Goal (Optional)</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal to link this advice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Linking a goal provides the AI with more context for a tailored plan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Get My Plan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
