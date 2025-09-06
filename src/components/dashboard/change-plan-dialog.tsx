// src/components/dashboard/change-plan-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import content from "@/content/landing-page.json";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ChangePlanDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ChangePlanDialog({ isOpen, onOpenChange }: ChangePlanDialogProps) {
  const { setSubscriptionStatus, subscriptionStatus } = useAuth();
  const { toast } = useToast();
  const { pricing } = content;

  const handlePlanSelection = (planTitle: string) => {
    if (planTitle === "Pro") {
      setSubscriptionStatus('active');
      toast({
        title: "Plan Changed!",
        description: "You've successfully upgraded to the Pro plan."
      });
    } else {
      setSubscriptionStatus('free');
       toast({
        title: "Plan Changed!",
        description: "You've been downgraded to the Free plan."
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-headline">{pricing.title}</DialogTitle>
          <DialogDescription className="text-center">
            {pricing.description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8 items-start pt-4">
          {pricing.plans.map((plan, index) => {
            const isCurrentPlan = (plan.title === 'Pro' && subscriptionStatus !== 'free') || (plan.title === 'Free' && subscriptionStatus === 'free');
            return (
              <Card
                key={index}
                className={cn("flex flex-col h-full", plan.isFeatured && "border-primary shadow-lg")}
              >
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">{plan.title}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.frequency}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-4">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                   <Button onClick={() => handlePlanSelection(plan.title)} className="w-full" size="lg" variant={plan.isFeatured ? 'default' : 'outline'} disabled={isCurrentPlan}>
                      {isCurrentPlan ? "Current Plan" : plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
