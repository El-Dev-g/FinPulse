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
import { Calculator, Target, TrendingUp, CreditCard, Coins, Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper to format currency
const formatCurrency = (amount: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

function InvestmentCalculator({ values, setValues, onUseFutureValue }: any) {
  const { initial, contribution, rate, years } = values;

  const futureValue = useMemo(() => {
    const P = parseFloat(initial);
    const PMT = parseFloat(contribution);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseInt(years) * 12;
    if (isNaN(P) || isNaN(PMT) || isNaN(r) || isNaN(n)) return 0;
    const fv = P * Math.pow(1 + r, n) + PMT * ((Math.pow(1 + r, n) - 1) / r);
    return fv;
  }, [initial, contribution, rate, years]);
  
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
            <Input id="initial" type="number" value={initial} onChange={(e) => setValues({ initial: e.target.value })} placeholder="0"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contribution">Monthly Contribution ($)</Label>
            <Input id="contribution" type="number" value={contribution} onChange={(e) => setValues({ contribution: e.target.value })} placeholder="0"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rate">Annual Return Rate (%)</Label>
            <Input id="rate" type="number" value={rate} onChange={(e) => setValues({ rate: e.target.value })} placeholder="0"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Years to Grow</Label>
            <Input id="years" type="number" value={years} onChange={(e) => setValues({ years: e.target.value })} placeholder="0"/>
          </div>
        </div>
      </div>
      <div className="p-6 bg-muted rounded-lg text-center space-y-3">
        <p className="text-muted-foreground">Projected Future Value</p>
        <p className="text-4xl font-bold text-primary">{formatCurrency(futureValue)}</p>
         <div className="flex justify-center gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => onUseFutureValue(futureValue, 'savings')}>
                <Send className="mr-2" /> Use for Savings
            </Button>
            <Button size="sm" variant="outline" onClick={() => onUseFutureValue(futureValue, 'debt')}>
                <Send className="mr-2" /> Use for Debt
            </Button>
        </div>
      </div>
    </div>
  );
}

function SavingsGoalCalculator({ values, setValues, onUseContribution }: any) {
    const { target, current, years } = values;
    const searchParams = useSearchParams();

    useEffect(() => {
        const targetParam = searchParams.get('target');
        const currentParam = searchParams.get('current');
        if (targetParam) setValues({ target: targetParam });
        if (currentParam) setValues({ current: currentParam });
    }, [searchParams, setValues]);

    const monthlyContribution = useMemo(() => {
        const T = parseFloat(target);
        const C = parseFloat(current);
        const Y = parseInt(years);
        if (isNaN(T) || isNaN(C) || isNaN(Y) || Y <= 0) return 0;
        const remaining = T - C;
        if (remaining <= 0) return 0;
        return remaining / (Y * 12);
    }, [target, current, years]);

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
                        <Input id="target" type="number" value={target} onChange={(e) => setValues({ target: e.target.value })} placeholder="0"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="current">Current Savings ($)</Label>
                        <Input id="current" type="number" value={current} onChange={(e) => setValues({ current: e.target.value })} placeholder="0"/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="years-savings">Years to Save</Label>
                    <Input id="years-savings" type="number" value={years} onChange={(e) => setValues({ years: e.target.value })} placeholder="0"/>
                </div>
            </div>
            <div className="p-6 bg-muted rounded-lg text-center space-y-3">
                <p className="text-muted-foreground">Required Monthly Contribution</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyContribution)}</p>
                 <div className="flex justify-center gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => onUseContribution(monthlyContribution)}>
                        <Send className="mr-2" /> Use for Investment
                    </Button>
                </div>
            </div>
        </div>
    );
}

function DebtPayoffCalculator({ values, setValues, onUsePayment }: any) {
  const { debtAmount, interestRate, monthlyPayment } = values;

  const { payoffTime, totalInterest } = useMemo(() => {
    const P = parseFloat(debtAmount);
    const r = parseFloat(interestRate) / 100 / 12;
    const p = parseFloat(monthlyPayment);
    if (isNaN(P) || isNaN(r) || isNaN(p) || r <= 0 || p <= P * r) {
      return { payoffTime: "N/A", totalInterest: 0 };
    }
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Debt Payoff Planner</h3>
        <p className="text-muted-foreground text-sm">See how fast you can become debt-free.</p>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="debtAmount">Total Debt ($)</Label>
                <Input id="debtAmount" type="number" value={debtAmount} onChange={(e) => setValues({ debtAmount: e.target.value })} placeholder="0"/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="interestRate">Annual Rate (%)</Label>
                <Input id="interestRate" type="number" value={interestRate} onChange={(e) => setValues({ interestRate: e.target.value })} placeholder="0"/>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="monthlyPayment">Monthly Payment ($)</Label>
            <Input id="monthlyPayment" type="number" value={monthlyPayment} onChange={(e) => setValues({ monthlyPayment: e.target.value })} placeholder="0"/>
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
       <div className="text-center">
        <Button size="sm" variant="outline" onClick={() => onUsePayment(monthlyPayment)}>
            <Send className="mr-2" /> Use Monthly Payment for Savings
        </Button>
       </div>
    </div>
  );
}

function CurrencyConverter({ values, setValues, onUseConversion }: any) {
  const { amount, fromCurrency, toCurrency } = values;
  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
  
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

  return (
    <div className="space-y-6">
       <div>
        <h3 className="text-xl font-semibold">Currency Converter</h3>
        <p className="text-muted-foreground text-sm">Convert between major currencies.*</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount-converter">Amount</Label>
          <Input id="amount-converter" type="number" value={amount} onChange={(e) => setValues({ amount: e.target.value })} placeholder="0.00"/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from-currency">From</Label>
            <Select value={fromCurrency} onValueChange={(v) => setValues({ fromCurrency: v })}>
                <SelectTrigger id="from-currency"><SelectValue/></SelectTrigger>
                <SelectContent>
                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="to-currency">To</Label>
            <Select value={toCurrency} onValueChange={(v) => setValues({ toCurrency: v })}>
                <SelectTrigger id="to-currency"><SelectValue/></SelectTrigger>
                <SelectContent>
                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-6 bg-muted rounded-lg text-center space-y-3">
        <p className="text-muted-foreground">Converted Amount</p>
        <p className="text-4xl font-bold text-primary">{formatCurrency(convertedAmount, toCurrency)}</p>
         <div className="flex justify-center gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => onUseConversion(convertedAmount)}>
                <Send className="mr-2" /> Use for Any Calculator
            </Button>
        </div>
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

  // Unified state for all calculators
  const [investmentValues, setInvestmentValues] = useState({ initial: "", contribution: "", rate: "", years: "" });
  const [savingsValues, setSavingsValues] = useState({ target: "", current: "", years: "" });
  const [debtValues, setDebtValues] = useState({ debtAmount: "", interestRate: "", monthlyPayment: "" });
  const [currencyValues, setCurrencyValues] = useState({ amount: "", fromCurrency: "USD", toCurrency: "EUR" });

  const setPartialState = (setter: Function) => (newValues: object) => {
      setter((prev: object) => ({...prev, ...newValues}));
  }

  // Handlers to connect calculators
  const handleUseFutureValue = (value: number, destination: 'savings' | 'debt') => {
      if (destination === 'savings') {
          setSavingsValues(prev => ({...prev, current: value.toFixed(2)}));
          setActiveTab('goals');
      } else {
          setDebtValues(prev => ({...prev, debtAmount: value.toFixed(2)}));
          setActiveTab('debt');
      }
  }

  const handleUseContribution = (value: number) => {
      setInvestmentValues(prev => ({...prev, contribution: value.toFixed(2)}));
      setActiveTab('investment');
  }

  const handleUsePayment = (value: string) => {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) return;
      setSavingsValues(prev => ({...prev, years: '5' })); // Default to 5 years
      handleUseContribution(numericValue);
      setActiveTab('goals');
  }

  const handleUseConversion = (value: number) => {
    const valStr = value.toFixed(2);
    setInvestmentValues(prev => ({...prev, initial: valStr}));
    setSavingsValues(prev => ({...prev, target: valStr}));
    setDebtValues(prev => ({...prev, debtAmount: valStr}));
    setActiveTab('investment');
  }


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
                <InvestmentCalculator values={investmentValues} setValues={setPartialState(setInvestmentValues)} onUseFutureValue={handleUseFutureValue} />
              </TabsContent>
              <TabsContent value="goals" className="pt-6">
                <SavingsGoalCalculator values={savingsValues} setValues={setPartialState(setSavingsValues)} onUseContribution={handleUseContribution} />
              </TabsContent>
               <TabsContent value="debt" className="pt-6">
                <DebtPayoffCalculator values={debtValues} setValues={setPartialState(setDebtValues)} onUsePayment={handleUsePayment} />
              </TabsContent>
               <TabsContent value="currency" className="pt-6">
                <CurrencyConverter values={currencyValues} setValues={setPartialState(setCurrencyValues)} onUseConversion={handleUseConversion} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
