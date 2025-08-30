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
import { Calculator, Target, TrendingUp, CreditCard, Coins } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function InvestmentCalculator() {
  const [initial, setInitial] = useState("");
  const [contribution, setContribution] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

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
            <Input id="initial" type="number" value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="0"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contribution">Monthly Contribution ($)</Label>
            <Input id="contribution" type="number" value={contribution} onChange={(e) => setContribution(e.target.value)} placeholder="0"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rate">Annual Return Rate (%)</Label>
            <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Years to Grow</Label>
            <Input id="years" type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="0"/>
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
    const [target, setTarget] = useState("");
    const [current, setCurrent] = useState("");
    const [years, setYears] = useState("");

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
                        <Input id="target" type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="current">Current Savings ($)</Label>
                        <Input id="current" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="0"/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="years-savings">Years to Save</Label>
                    <Input id="years-savings" type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="0"/>
                </div>
            </div>
            <div className="p-6 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground">Required Monthly Contribution</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyContribution)}</p>
            </div>
        </div>
    );
}

function DebtPayoffCalculator() {
  const [debtAmount, setDebtAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");

  const { payoffTime, totalInterest } = useMemo(() => {
    const P = parseFloat(debtAmount);
    const r = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const p = parseFloat(monthlyPayment);

    if (isNaN(P) || isNaN(r) || isNaN(p) || r <= 0 || p <= P * r) {
      return { payoffTime: "N/A", totalInterest: 0 };
    }
    
    // Loan amortization formula to find number of payments (n)
    const n = -(Math.log(1 - (P * r) / p)) / Math.log(1 + r);
    const totalMonths = Math.ceil(n);

    if (!isFinite(totalMonths) || totalMonths <= 0) {
       return { payoffTime: "N/A", totalInterest: 0 };
    }

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    const payoffTime = `${years > 0 ? `${years}y` : ''} ${months > 0 ? `${months}m` : ''}`.trim() || 'Instantly';

    const totalPaid = p * totalMonths;
    const totalInterest = totalPaid - P;

    return { payoffTime, totalInterest };
  }, [debtAmount, interestRate, monthlyPayment]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Debt Payoff Planner</h3>
        <p className="text-muted-foreground text-sm">See how fast you can become debt-free.</p>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap_4">
            <div className="space-y-2">
                <Label htmlFor="debtAmount">Total Debt ($)</Label>
                <Input id="debtAmount" type="number" value={debtAmount} onChange={(e) => setDebtAmount(e.target.value)} placeholder="0"/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="interestRate">Annual Rate (%)</Label>
                <Input id="interestRate" type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="0"/>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="monthlyPayment">Monthly Payment ($)</Label>
            <Input id="monthlyPayment" type="number" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} placeholder="0"/>
        </div>
      </div>
       <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Payoff Time</p>
                <p className="text-3xl font-bold text-primary">{payoffTime}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Total Interest</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalInterest)}</p>
            </div>
       </div>
    </div>
  );
}

function CurrencyConverter() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");

  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
  
  // Note: Using fixed rates as we can't fetch live data.
  const exchangeRates: { [key: string]: { [key: string]: number } } = {
    USD: { EUR: 0.93, GBP: 0.79, JPY: 157.2, CAD: 1.37, AUD: 1.5 },
    EUR: { USD: 1.08, GBP: 0.85, JPY: 169.5, CAD: 1.48, AUD: 1.62 },
    GBP: { USD: 1.27, EUR: 1.18, JPY: 199.5, CAD: 1.74, AUD: 1.9 },
    JPY: { USD: 0.0064, EUR: 0.0059, GBP: 0.005, CAD: 0.0087, AUD: 0.0095 },
    CAD: { USD: 0.73, EUR: 0.68, GBP: 0.57, JPY: 114.7, AUD: 1.1 },
    AUD: { USD: 0.67, EUR: 0.62, GBP: 0.53, JPY: 104.8, CAD: 0.91 },
  };

  const convertedAmount = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !fromCurrency || !toCurrency) return 0;
    if (fromCurrency === toCurrency) return numAmount;
    
    const rate = exchangeRates[fromCurrency]?.[toCurrency] || 0;
    return numAmount * rate;
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
       <div>
        <h3 className="text-xl font-semibold">Currency Converter</h3>
        <p className="text-muted-foreground text-sm">Convert between major currencies.*</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount-converter">Amount</Label>
          <Input id="amount-converter" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from-currency">From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger id="from-currency"><SelectValue/></SelectTrigger>
                <SelectContent>
                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="to-currency">To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger id="to-currency"><SelectValue/></SelectTrigger>
                <SelectContent>
                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-6 bg-muted rounded-lg text-center">
        <p className="text-muted-foreground">Converted Amount</p>
        <p className="text-4xl font-bold text-primary">{formatCurrency(convertedAmount, toCurrency)}</p>
      </div>
       <p className="text-xs text-muted-foreground text-center">*Rates are for illustrative purposes only and may not be current.</p>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="investment">
                    <TrendingUp className="mr-2"/>
                    Investment
                </TabsTrigger>
                <TabsTrigger value="goals">
                    <Target className="mr-2"/>
                    Savings Goals
                </TabsTrigger>
                <TabsTrigger value="debt">
                    <CreditCard className="mr-2"/>
                    Debt Payoff
                </TabsTrigger>
                 <TabsTrigger value="currency">
                    <Coins className="mr-2"/>
                    Currency
                </TabsTrigger>
              </TabsList>
              <TabsContent value="investment" className="pt-6">
                <InvestmentCalculator />
              </TabsContent>
              <TabsContent value="goals" className="pt-6">
                <SavingsGoalCalculator />
              </TabsContent>
               <TabsContent value="debt" className="pt-6">
                <DebtPayoffCalculator />
              </TabsContent>
               <TabsContent value="currency" className="pt-6">
                <CurrencyConverter />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
