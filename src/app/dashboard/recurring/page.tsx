// src/app/dashboard/recurring/page.tsx
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  recurringTransactionsData as initialRecurringTransactions,
  transactionsData,
} from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Repeat, ArrowRightLeft } from "lucide-react";
import { AddRecurringTransactionDialog } from "@/components/dashboard/add-recurring-transaction-dialog";
import type { RecurringTransaction } from "@/lib/placeholder-data";

export default function RecurringPage() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(
    initialRecurringTransactions
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  const allCategories = Array.from(new Set(transactionsData.map(t => t.category)));

  const handleAddTransaction = (
    newTransaction: Omit<RecurringTransaction, "id" | "Icon">
  ) => {
    const transactionWithId: RecurringTransaction = {
      ...newTransaction,
      id: `recur_${recurring.length + 1}`,
      Icon: ArrowRightLeft, // Default icon
    };
    setRecurring([transactionWithId, ...recurring]);
  };

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <Repeat className="h-8 w-8" />
              Recurring Transactions
            </h2>
            <p className="text-muted-foreground">
              Manage your automated income and expenses.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2" />
              Add Recurring
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Recurring Transactions</CardTitle>
            <CardDescription>
              These transactions are automatically accounted for based on their
              schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurring.length > 0 ? (
                  recurring.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-muted p-2 rounded-md">
                            <transaction.Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="font-medium">
                            {transaction.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {transaction.frequency}
                      </TableCell>
                      <TableCell>{transaction.startDate}</TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-foreground"
                        )}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No recurring transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AddRecurringTransactionDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTransaction={handleAddTransaction}
        categories={allCategories.filter((c) => c !== "all")}
      />
    </main>
  );
}
