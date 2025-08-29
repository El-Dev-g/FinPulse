// src/app/dashboard/calculator/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Target, TrendingUp } from "lucide-react";

function InvestmentCalculator() {
  const [initial, setInitial] = useState("1000");
  const [contribution, setContribution] = useState("100");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("10");

  const futureValue = useMemo(() => {
    const P = parseFloat(initial);
    const PMT = parseFloat(contribution);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseInt(years) * 12;

    if (isNaN(P) || isNaN(PMT) || isNaN(r) || isNaN(n)) return 0;

    const fv = P * Math.pow(1 + r, n) + PMT * ((Math.pow(1 + r, n) - 1) / r);
    return fv;
  }, [initial, contribution, rate, years]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
       <div>
        <h3 className="text-xl font-semibold">Investment Growth</h3>
        <p className="text-muted-foreground text-sm">Project the future value of your investments.</p>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initial">Initial Investment ($)</Label>
            <Input id="initial" type="number" value={initial} onChange={(e) => setInitial(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contribution">Monthly Contribution ($)</Label>
            <Input id="contribution" type="number" value={contribution} onChange={(e) => setContribution(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rate">Annual Return Rate (%)</Label>
            <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Years to Grow</Label>
            <Input id="years" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="p-6 bg-muted rounded-lg text-center">
        <p className="text-muted-foreground">Projected Future Value</p>
        <p className="text-4xl font-bold text-primary">{formatCurrency(futureValue)}</p>
      </div>
    </div>
  );
}

function SavingsGoalCalculator() {
    const searchParams = useSearchParams();
    const [target, setTarget] = useState("10000");
    const [current, setCurrent] = useState("1000");
    const [years, setYears] = useState("5");

    useEffect(() => {
        const targetParam = searchParams.get('target');
        const currentParam = searchParams.get('current');
        if (targetParam) setTarget(targetParam);
        if (currentParam) setCurrent(currentParam);
    }, [searchParams]);

    const monthlyContribution = useMemo(() => {
        const T = parseFloat(target);
        const C = parseFloat(current);
        const Y = parseInt(years);

        if (isNaN(T) || isNaN(C) || isNaN(Y) || Y <= 0) return 0;

        const remaining = T - C;
        if (remaining <= 0) return 0;
        
        return remaining / (Y * 12);
    }, [target, current, years]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold">Savings Goal Planner</h3>
                <p className="text-muted-foreground text-sm">Calculate how much you need to save to reach your goal.</p>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="target">Goal Amount ($)</Label>
                        <Input id="target" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="current">Current Savings ($)</Label>
                        <Input id="current" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="years-savings">Years to Save</Label>
                    <Input id="years-savings" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
                </div>
            </div>
            <div className="p-6 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground">Required Monthly Contribution</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyContribution)}</p>
            </div>
        </div>
    );
}

// Wrap the main export in a Suspense boundary
export default function CalculatorPage() {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <CalculatorPageContent />
      </React.Suspense>
    );
}

function CalculatorPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'investment';
  const [activeTab, setActiveTab] = useState(tab);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <Calculator className="h-8 w-8" />
              Financial Calculators
            </h2>
            <p className="text-muted-foreground">
              Plan your financial future with these powerful tools.
            </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="investment">
                    <TrendingUp className="mr-2"/>
                    Investment
                </TabsTrigger>
                <TabsTrigger value="goals">
                    <Target className="mr-2"/>
                    Savings Goals
                </TabsTrigger>
              </TabsList>
              <TabsContent value="investment" className="pt-6">
                <InvestmentCalculator />
              </TabsContent>
              <TabsContent value="goals" className="pt-6">
                <SavingsGoalCalculator />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
