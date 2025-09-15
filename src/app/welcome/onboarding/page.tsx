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
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader, Rocket, Award, ShieldCheck, Landmark } from "lucide-react";
import { AddGoalDialog } from "@/components/dashboard/add-goal-dialog";
import { AddBudgetDialog } from "@/components/dashboard/add-budget-dialog";
import { addGoal, addBudget } from "@/lib/db";
import type { Goal, Budget } from "@/lib/types";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    setProgress(0); // Start progress at 0

    api.on("select", () => {
      const selectedSnap = api.selectedScrollSnap();
      const totalSnaps = api.scrollSnapList().length;
      setCurrent(selectedSnap);
      setProgress((selectedSnap / (totalSnaps - 1)) * 100);
    });
  }, [api]);
  
  const handleAddGoal = async (newGoal: Omit<Goal, "id" | "current" | "createdAt">) => {
    setIsSubmitting(true);
    try {
      await addGoal({ ...newGoal, current: 0 });
      api?.scrollNext();
    } catch(e) {
      console.error("Failed to add goal", e);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddBudget = async (newBudget: Omit<Budget, "id" | "createdAt">) => {
    setIsSubmitting(true);
    try {
      await addBudget(newBudget);
      api?.scrollNext();
    } catch(e) {
      console.error("Failed to add budget", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = () => {
    try {
        localStorage.setItem('onboardingComplete', 'true');
    } catch (error) {
        console.error("Could not save onboarding status to localStorage", error);
    }
    router.push('/dashboard');
  }

  const handleFinishOnboarding = () => {
    completeOnboarding();
  }
  
  const handleSkipOnboarding = () => {
    completeOnboarding();
  }

  const handleConnectBank = () => {
    toast({
      title: "Demo Feature",
      description: "In a real app, this would securely redirect you to your bank.",
    });
     setTimeout(() => {
        api?.scrollNext();
    }, 1500);
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
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="absolute top-6 right-6">
        <Button variant="ghost" onClick={handleSkipOnboarding}>Skip Onboarding</Button>
      </div>
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <Progress value={progress} className="mb-4 h-2" />
          <p className="text-sm text-muted-foreground">
            Step {current + 1} of {count}
          </p>
        </div>
        <Carousel setApi={setApi} className="w-full" opts={{
          watchDrag: false, // Disables manual sliding
        }}>
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
                   <Button onClick={() => api?.scrollNext()}>Let's Go!</Button>
                </CardContent>
              </Card>
            </CarouselItem>

            {/* Step 2: Link Bank */}
            <CarouselItem>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <Landmark className="w-16 h-16 text-primary" />
                  <h2 className="text-3xl font-headline font-bold">
                    Connect Your Bank Account
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Get a complete view of your finances by securely linking your bank account. This enables automatic transaction syncing.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={handleConnectBank}>
                      Connect Securely
                    </Button>
                     <Button variant="outline" onClick={() => api?.scrollNext()}>
                      Skip for now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
            
            {/* Step 3: Set Goal */}
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
                  <div className="flex gap-4">
                    <Button onClick={() => setIsAddGoalDialogOpen(true)}>
                      Create a Goal
                    </Button>
                     <Button variant="outline" onClick={() => api?.scrollNext()}>
                      Skip for now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>

            {/* Step 4: Set Budget */}
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
                   <div className="flex gap-4">
                    <Button onClick={() => setIsAddBudgetDialogOpen(true)}>
                      Create a Budget
                    </Button>
                     <Button variant="outline" onClick={() => api?.scrollNext()}>
                      Skip for now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>

             {/* Step 5: Finish */}
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
                   <Button onClick={handleFinishOnboarding}>
                    Take Me to My Dashboard
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>

          </CarouselContent>
        </Carousel>
      </div>
      
       <AddGoalDialog
        isOpen={isAddGoalDialogOpen}
        onOpenChange={setIsAddGoalDialogOpen}
        onAddGoal={handleAddGoal}
        isSubmitting={isSubmitting}
        aiPlans={[]}
      />
      <AddBudgetDialog
        isOpen={isAddBudgetDialogOpen}
        onOpenChange={setIsAddBudgetDialogOpen}
        onAddBudget={handleAddBudget}
        isSubmitting={isSubmitting}
        existingCategories={[]}
      />
    </div>
  );
}
