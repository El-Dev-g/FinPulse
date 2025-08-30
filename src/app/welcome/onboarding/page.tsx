// src/app/welcome/onboarding/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader, Rocket, Award, ShieldCheck } from "lucide-react";
import { AddGoalDialog } from "@/components/dashboard/add-goal-dialog";
import { AddBudgetDialog } from "@/components/dashboard/add-budget-dialog";
import { addGoal, addBudget } from "@/lib/db";
import type { Goal, Budget } from "@/lib/types";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    setProgress((api.selectedScrollSnap() / (api.scrollSnapList().length -1)) * 100);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setProgress((api.selectedScrollSnap() / (api.scrollSnapList().length-1)) * 100);
    });
  }, [api]);
  
  const handleAddGoal = async (newGoal: Omit<Goal, "id" | "current" | "createdAt">) => {
    await addGoal({ ...newGoal, current: 0 });
    api?.scrollNext();
  };
  
  const handleAddBudget = async (newBudget: Omit<Budget, "id" | "createdAt">) => {
    await addBudget(newBudget);
    api?.scrollNext();
  };


  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }
  

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <Progress value={progress} className="mb-4 h-2" />
          <p className="text-sm text-muted-foreground">
            Step {current + 1} of {count}
          </p>
        </div>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {/* Step 1: Welcome */}
            <CarouselItem>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <Rocket className="w-16 h-16 text-primary" />
                  <h2 className="text-3xl font-headline font-bold">
                    Welcome to FinPulse, {user.displayName}!
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    You're about to take a giant leap towards financial clarity.
                    Let's get you set up in just a few quick steps.
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
            
            {/* Step 2: Set Goal */}
            <CarouselItem>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <Award className="w-16 h-16 text-primary" />
                  <h2 className="text-3xl font-headline font-bold">
                    Set Your First Financial Goal
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    What's a major financial milestone you're aiming for?
                    Saving for a vacation, a new car, or a house down payment?
                  </p>
                  <Button onClick={() => setIsAddGoalDialogOpen(true)}>
                    Create a Goal
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>

            {/* Step 3: Set Budget */}
            <CarouselItem>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <ShieldCheck className="w-16 h-16 text-primary" />
                  <h2 className="text-3xl font-headline font-bold">
                    Create Your First Budget
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Tracking your spending is key. Let's create a budget for a
                    common category like "Groceries" or "Dining Out".
                  </p>
                   <Button onClick={() => setIsAddBudgetDialogOpen(true)}>
                    Create a Budget
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
            
             {/* Step 4: Finish */}
            <CarouselItem>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <Rocket className="w-16 h-16 text-primary" />
                  <h2 className="text-3xl font-headline font-bold">
                    You're All Set!
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    You've taken the first important steps. You can always add more goals and budgets later. Ready to see your new financial dashboard?
                  </p>
                   <Button onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>

          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      
       <AddGoalDialog
        isOpen={isAddGoalDialogOpen}
        onOpenChange={setIsAddGoalDialogOpen}
        onAddGoal={handleAddGoal}
        aiPlans={[]}
      />
      <AddBudgetDialog
        isOpen={isAddBudgetDialogOpen}
        onOpenChange={setIsAddBudgetDialogOpen}
        onAddBudget={handleAddBudget}
        existingCategories={[]}
      />
    </div>
  );
}
