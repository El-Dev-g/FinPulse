// src/app/pricing/page.tsx
"use client";

import { useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Check, Loader } from "lucide-react";
import content from "@/content/landing-page.json";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function PricingPage() {
  const { pricing } = content;
  const { user, loading, setSubscriptionStatus, subscriptionStatus } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  if (loading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handlePlanSelection = (planTitle: string) => {
    if (planTitle === "Pro") {
      setSubscriptionStatus('active');
    } else {
      setSubscriptionStatus('free');
    }
    router.push('/dashboard/billing');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="container mx-auto px-4 h-20 flex items-center justify-between border-b">
        <Link href="/">
          <Logo />
        </Link>
        <Button asChild variant="ghost">
          <Link href={user ? "/dashboard" : "/"}>Back to {user ? "Dashboard" : "Home"}</Link>
        </Button>
      </header>
       <main className="flex-grow">
         <section id="pricing" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-5xl font-headline font-bold">
                {pricing.title}
              </h1>
              <p className="text-lg mt-4 text-foreground/70">
                {pricing.description}
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mb-10">
              <Label htmlFor="billing-cycle" className={cn(billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>Monthly</Label>
              <Switch
                id="billing-cycle"
                checked={billingCycle === 'annually'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
              />
              <Label htmlFor="billing-cycle" className={cn(billingCycle === 'annually' ? 'text-foreground' : 'text-muted-foreground')}>
                Annually
                <span className="text-xs text-primary font-semibold ml-2 bg-primary/10 px-2 py-1 rounded-full">{pricing.annualDiscount}</span>
              </Label>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
              {pricing.plans.map((plan, index) => {
                const isCurrentPlan = (plan.title === 'Pro' && subscriptionStatus !== 'free') || (plan.title === 'Free' && subscriptionStatus === 'free');
                const price = billingCycle === 'annually' && plan.annualPrice ? plan.annualPrice : plan.price;
                const frequency = billingCycle === 'annually' && plan.annualFrequency ? plan.annualFrequency : plan.frequency;
                
                return (
                <Card
                  key={index}
                  className={cn("flex flex-col h-full", plan.isFeatured && "border-primary shadow-lg ring-2 ring-primary/50")}
                >
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">{plan.title}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-5xl font-bold">{price}</span>
                      <span className="text-muted-foreground">{frequency}</span>
                       {billingCycle === 'annually' && plan.monthlyEquivalent && (
                        <p className="text-sm text-muted-foreground mt-1">{plan.monthlyEquivalent} per month</p>
                      )}
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
              )})}
            </div>
             <div className="text-center mt-12 text-sm text-muted-foreground">
                <p>Have questions? <Link href="/contact" className="underline hover:text-primary">Contact our support team</Link>.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
