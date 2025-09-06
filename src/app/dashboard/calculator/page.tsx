// src/app/dashboard/calculator/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import { Calculator, Target, TrendingUp, CreditCard, Coins, Send, Loader } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { convertCurrency } from "@/lib/currency-actions";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";

function InvestmentCalculator({ values, setValues, onUseFutureValue }: any) {
  const { formatCurrency } = useAuth();
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
     <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><TrendingUp /> Investment Growth</CardTitle>
        <CardDescription>Project the future value of your investments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="initial">Initial Investment ($)</Label>
                <Input id="initial" type="number" value={initial} onChange={(e) => setValues({ initial: e.target.value })} placeholder="0"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="contribution">Monthly Contribution ($)</Label>
                <Input id="contribution" type="number" value={contribution} onChange={(e) => setValues({ contribution: e.target.value })} placeholder="0"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="rate">Annual Return Rate (%)</Label>
                <Input id="rate" type="number" value={rate} onChange={(e) => setValues({ rate: e.target.value })} placeholder="0"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="years">Years to Grow</Label>
                <Input id="years" type="number" value={years} onChange={(e) => setValues({ years: e.target.value })} placeholder="0"/>
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
      </CardContent>
    </Card>
  );
}

function SavingsGoalCalculator({ values, setValues, onUseContribution }: any) {
    const { formatCurrency } = useAuth();
    const { target, current, years } = values;
    const searchParams = useSearchParams();

    const targetParam = searchParams.get('target');
    const currentParam = searchParams.get('current');

    useEffect(() => {
        if (targetParam) {
            setValues({ target: targetParam });
        }
        if (currentParam) {
            setValues({ current: currentParam });
        }
    }, [targetParam, currentParam, setValues]);


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
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target /> Savings Goal Planner</CardTitle>
                <CardDescription>Calculate how much you need to save to reach your goal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="target">Goal Amount ($)</Label>
                        <Input id="target" type="number" value={target} onChange={(e) => setValues({ target: e.target.value })} placeholder="0"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="current">Current Savings ($)</Label>
                        <Input id="current" type="number" value={current} onChange={(e) => setValues({ current: e.target.value })} placeholder="0"/>
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
            </CardContent>
        </Card>
    );
}

function DebtPayoffCalculator({ values, setValues, onUsePayment }: any) {
  const { formatCurrency } = useAuth();
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
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CreditCard /> Debt Payoff Planner</CardTitle>
        <CardDescription>See how fast you can become debt-free.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="debtAmount">Total Debt ($)</Label>
                <Input id="debtAmount" type="number" value={debtAmount} onChange={(e) => setValues({ debtAmount: e.target.value })} placeholder="0"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="interestRate">Annual Rate (%)</Label>
                <Input id="interestRate" type="number" value={interestRate} onChange={(e) => setValues({ interestRate: e.target.value })} placeholder="0"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="monthlyPayment">Monthly Payment ($)</Label>
                <Input id="monthlyPayment" type="number" value={monthlyPayment} onChange={(e) => setValues({ monthlyPayment: e.target.value })} placeholder="0"/>
            </div>
        </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Send className="mr-2" /> Use for Savings
        </Button>
       </div>
      </CardContent>
    </Card>
  );
}

function CurrencyConverter({ values, setValues, onUseConversion }: any) {
  const { amount, fromCurrency, toCurrency } = values;
  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL", "NGN", "GHS"];
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedAmount = useDebounce(amount, 500);

  const handleConversion = useCallback(async () => {
    const numAmount = parseFloat(debouncedAmount);
    if (isNaN(numAmount) || numAmount <= 0 || !fromCurrency || !toCurrency) {
      setConvertedAmount(0);
      return;
    }
    
    if (fromCurrency === toCurrency) {
        setConvertedAmount(numAmount);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await convertCurrency({
        from: fromCurrency,
        to: toCurrency,
        amount: numAmount,
      });
      setConvertedAmount(result.convertedAmount);
    } catch (e: any) {
      setError(e.message || "Failed to fetch exchange rate.");
      setConvertedAmount(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedAmount, fromCurrency, toCurrency]);

  useEffect(() => {
    handleConversion();
  }, [handleConversion]);


  const formatLocalCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(amount);
  };


  return (
    <Card className="flex flex-col">
       <CardHeader>
        <CardTitle className="flex items-center gap-2"><Coins /> Currency Converter</CardTitle>
        <CardDescription>Convert between major currencies using live rates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow">
        <div className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="amount-converter">Amount</Label>
            <Input id="amount-converter" type="number" value={amount} onChange={(e) => setValues({ amount: e.target.value })} placeholder="0.00"/>
            </div>
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
        <div className="p-6 bg-muted rounded-lg text-center space-y-3 min-h-[148px] flex flex-col justify-center">
            {loading ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader className="animate-spin" />
                    <span>Converting...</span>
                </div>
            ) : error ? (
                <p className="text-destructive text-sm">{error}</p>
            ) : (
            <>
                <p className="text-muted-foreground">Converted Amount</p>
                <p className="text-4xl font-bold text-primary">{formatLocalCurrency(convertedAmount, toCurrency)}</p>
                <div className="flex justify-center gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => onUseConversion(convertedAmount)}>
                        <Send className="mr-2" /> Use Value
                    </Button>
                </div>
            </>
            )}
        </div>
        <p className="text-xs text-muted-foreground text-center">Rates provided by exchangerate.host.</p>
      </CardContent>
    </Card>
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
  
  // Unified state for all calculators
  const [investmentValues, setInvestmentValues] = useState({ initial: "", contribution: "", rate: "", years: "" });
  const [savingsValues, setSavingsValues] = useState({ target: "", current: "", years: "" });
  const [debtValues, setDebtValues] = useState({ debtAmount: "", interestRate: "", monthlyPayment: "" });
  const [currencyValues, setCurrencyValues] = useState({ amount: "1", fromCurrency: "USD", toCurrency: "EUR" });
  
  const [activeTab, setActiveTab] = useState('investment');

  const setPartialState = useCallback((setter: React.Dispatch<React.SetStateAction<any>>) => (newValues: object) => {
      setter((prev: object) => ({...prev, ...newValues}));
  }, []);

  // Handlers to connect calculators
  const handleUseFutureValue = (value: number, destination: 'savings' | 'debt') => {
      if (destination === 'savings') {
          setSavingsValues(prev => ({...prev, current: value.toFixed(2)}));
      } else {
          setDebtValues(prev => ({...prev, debtAmount: value.toFixed(2)}));
      }
  }

  const handleUseContribution = (value: number) => {
      setInvestmentValues(prev => ({...prev, contribution: value.toFixed(2)}));
  }

  const handleUsePayment = (value: string) => {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) return;
      setSavingsValues(prev => ({...prev, years: '5' })); // Default to 5 years
      handleUseContribution(numericValue);
  }

  const handleUseConversion = (value: number) => {
    const valStr = value.toFixed(2);
    setInvestmentValues(prev => ({...prev, initial: valStr}));
    setSavingsValues(prev => ({...prev, target: valStr}));
    setDebtValues(prev => ({...prev, debtAmount: valStr}));
  }


  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <Calculator className="h-8 w-8" />
              Financial Calculators
            </h2>
            <p className="text-muted-foreground">
              Plan your financial future with these powerful tools.
            </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <InvestmentCalculator values={investmentValues} setValues={setPartialState(setInvestmentValues)} onUseFutureValue={handleUseFutureValue} />
            <SavingsGoalCalculator values={savingsValues} setValues={setPartialState(setSavingsValues)} onUseContribution={handleUseContribution} />
            <DebtPayoffCalculator values={debtValues} setValues={setPartialState(setDebtValues)} onUsePayment={handleUsePayment} />
            <CurrencyConverter values={currencyValues} setValues={setPartialState(setCurrencyValues)} onUseConversion={handleUseConversion} />
        </div>
      </div>
    </main>
  );
}
