// src/app/dashboard/billing/page.tsx
"use client";

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
          <CardHeader className="md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>The card used for your subscription payments.</CardDescription>
            </div>
             <Button variant="outline">Update Payment Method</Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                    <p className="font-medium">Visa ending in 1234</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                </div>
                <Badge variant="secondary" className="ml-auto">Primary</Badge>
            </div>
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
