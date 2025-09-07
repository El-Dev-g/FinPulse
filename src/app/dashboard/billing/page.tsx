// src/app/dashboard/billing/page.tsx
"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Download, FileText, ExternalLink, Loader, AlertTriangle, Edit, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import content from "@/content/landing-page.json";


const billingHistory = [
  {
    date: "2024-06-01",
    description: "Pro Plan - Monthly Subscription",
    amount: 9.99,
    invoiceId: "inv_12345",
  },
  {
    date: "2024-05-01",
    description: "Pro Plan - Monthly Subscription",
    amount: 9.99,
    invoiceId: "inv_12344",
  },
  {
    date: "2024-04-01",
    description: "Pro Plan - Monthly Subscription",
    amount: 9.99,
    invoiceId: "inv_12343",
  },
];

function PaymentMethodForm() {
    const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
    const [expiry, setExpiry] = useState("12 / 26");
    const [cvc, setCvc] = useState("123");
    const [loading, setLoading] = useState(false);
    const [isCardUpdated, setIsCardUpdated] = useState(false);
    const { toast } = useToast();
    const { setSubscriptionStatus, subscriptionStatus } = useAuth();


    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i=0, len=match.length; i<len; i+=4) {
            parts.push(match.substring(i, i+4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };
    
    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 3) {
            return `${v.slice(0, 2)} / ${v.slice(2, 4)}`;
        }
        return v;
    }

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardNumber(formatCardNumber(e.target.value));
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpiry(formatExpiry(e.target.value));
    };

    const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value.replace(/[^0-9]/gi, '');
        setCvc(v.slice(0, 4));
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setIsCardUpdated(true);
            if(subscriptionStatus === 'past_due') {
                setSubscriptionStatus('active');
                toast({
                    title: "Payment Successful!",
                    description: "Your subscription has been renewed.",
                });
            } else {
                 toast({
                    title: "Success!",
                    description: "Your payment method has been updated.",
                });
            }
        }, 1500);
    }
    
    const isPastDue = subscriptionStatus === 'past_due';

    if (isCardUpdated && !isPastDue) {
        const last4 = cardNumber.slice(-4);
        return (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Card ending in {last4}</p>
                        <p className="text-sm text-muted-foreground">Expires {expiry}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsCardUpdated(false)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Change
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative flex items-center">
                        <CreditCard className="absolute left-3 h-5 w-5 text-muted-foreground" />
                        <Input id="cardNumber" value={cardNumber} onChange={handleCardChange} placeholder="0000 0000 0000 0000" className="pl-10" disabled={loading} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input id="expiry" value={expiry} onChange={handleExpiryChange} placeholder="MM / YY" disabled={loading}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" value={cvc} onChange={handleCvcChange} placeholder="123" disabled={loading}/>
                    </div>
                </div>
                <Button type="submit" className={cn("w-full", isPastDue && "bg-destructive hover:bg-destructive/90")} disabled={loading}>
                    {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {isPastDue ? "Pay Now & Renew Subscription" : "Update Payment Method"}
                </Button>
            </div>
        </form>
    );
}

function ChangePlanDropdown() {
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
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                    {subscriptionStatus !== 'free' ? "Change Plan" : "Upgrade to Pro"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Available Plans</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {pricing.plans.map((plan) => {
                    const isCurrentPlan = (plan.title === 'Pro' && subscriptionStatus !== 'free') || (plan.title === 'Free' && subscriptionStatus === 'free');
                    return (
                        <DropdownMenuItem
                            key={plan.title}
                            disabled={isCurrentPlan}
                            onSelect={() => handlePlanSelection(plan.title)}
                            className="p-3"
                        >
                            <div className="flex justify-between items-center w-full">
                                <div>
                                    <p className="font-semibold">{plan.title} - {plan.price}{plan.frequency}</p>
                                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                                </div>
                                {isCurrentPlan && <Check className="h-4 w-4 text-primary" />}
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


export default function BillingPage() {
  const { isPro, subscriptionStatus, setSubscriptionStatus, formatCurrency } = useAuth();
  const { toast } = useToast();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
        title: "Feature Unavailable",
        description: `In a real app, this would download invoice ${invoiceId}.`,
    });
  }

  const handleCancelSubscription = () => {
    setSubscriptionStatus('free');
    toast({
        title: "Subscription Canceled",
        description: "Your Pro plan has been canceled. You've been downgraded to the Free plan.",
    });
    setIsCancelDialogOpen(false);
  }

  return (
    <>
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Billing & Subscription
          </h2>
          <p className="text-muted-foreground">
            Manage your plan, payment methods, and view your billing history.
          </p>
        </div>
        
        {subscriptionStatus === 'past_due' && (
             <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle />
                        Payment Method Action Required
                    </CardTitle>
                    <CardDescription>
                        Your last payment for the Pro plan failed. Please update your payment method to continue enjoying Pro features and avoid account downgrade.
                    </CardDescription>
                </CardHeader>
            </Card>
        )}

        <Card>
          <CardHeader className="md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Your Current Plan</CardTitle>
              <CardDescription>You are currently on the {isPro ? "Pro" : "Free"} Plan.</CardDescription>
            </div>
             <ChangePlanDropdown />
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted/50 rounded-lg">
                <div className='flex justify-between items-center'>
                     <p className="text-xl font-semibold">{isPro ? "FinPulse Pro" : "FinPulse Free"}</p>
                     {subscriptionStatus === 'active' && <Badge variant="secondary">Active</Badge>}
                     {subscriptionStatus === 'past_due' && <Badge variant="destructive">Past Due</Badge>}
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                    {subscriptionStatus === 'active' ? "Your subscription will renew on July 1, 2024." : subscriptionStatus === 'past_due' ? "Your Pro features will be disabled soon." : "Upgrade to unlock powerful features."}
                </p>
            </div>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>The card used for your subscription payments.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <PaymentMethodForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              Review your past payments and download invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((item) => (
                  <TableRow key={item.invoiceId}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(item.invoiceId)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {isPro && (
             <Card>
                <CardHeader>
                    <CardTitle>Prototype Controls</CardTitle>
                    <CardDescription>
                        Use these buttons to simulate subscription states for testing purposes.
                    </CardDescription>
                </CardHeader>
                <CardFooter className='gap-4'>
                    <Button variant="outline" onClick={() => setSubscriptionStatus('past_due')}>Simulate Failed Payment</Button>
                    <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)}>Cancel Subscription</Button>
                </CardFooter>
            </Card>
        )}
      </div>
    </main>
    <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately downgrade your account to the Free plan. You will lose access to all Pro features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep My Plan</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, cancel my subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
