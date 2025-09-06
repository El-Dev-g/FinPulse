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
import { CreditCard, Download, FileText, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

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
    

    return (
        <form>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative flex items-center">
                        <CreditCard className="absolute left-3 h-5 w-5 text-muted-foreground" />
                        <Input id="cardNumber" value={cardNumber} onChange={handleCardChange} placeholder="0000 0000 0000 0000" className="pl-10" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input id="expiry" value={expiry} onChange={handleExpiryChange} placeholder="MM / YY" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" value={cvc} onChange={handleCvcChange} placeholder="123" />
                    </div>
                </div>
                <Button type="submit" className="w-full">Update Payment Method</Button>
            </div>
        </form>
    );
}


export default function BillingPage() {
  const { isPro, formatCurrency } = useAuth();
  
  return (
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

        <Card>
          <CardHeader className="md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Your Current Plan</CardTitle>
              <CardDescription>You are currently on the {isPro ? "Pro" : "Free"} Plan.</CardDescription>
            </div>
             <Button asChild>
                <Link href="/#pricing">
                  {isPro ? "Change Plan" : "Upgrade to Pro"}
                  <ExternalLink className="ml-2" />
                </Link>
             </Button>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted/50 rounded-lg">
                <p className="text-xl font-semibold">{isPro ? "FinPulse Pro" : "FinPulse Free"}</p>
                <p className="text-muted-foreground text-sm mt-1">
                    {isPro ? "Your subscription will renew on July 1, 2024." : "Upgrade to unlock powerful features."}
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
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Cancel Subscription</CardTitle>
                <CardDescription>
                    Canceling your Pro plan will downgrade you to the Free plan at the end of your current billing cycle. You will lose access to all Pro features.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button variant="destructive">I understand, cancel my subscription</Button>
            </CardFooter>
        </Card>
      </div>
    </main>
  );
}
