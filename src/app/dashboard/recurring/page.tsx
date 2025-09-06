// src/app/dashboard/recurring/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Repeat, Loader, MoreHorizontal } from "lucide-react";
import { AddRecurringTransactionDialog } from "@/components/dashboard/add-recurring-transaction-dialog";
import { EditRecurringTransactionDialog } from "@/components/dashboard/edit-recurring-transaction-dialog";
import type { RecurringTransaction, ClientRecurringTransaction } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { addRecurringTransaction, getRecurringTransactions, updateRecurringTransaction, deleteRecurringTransaction } from "@/lib/db";
import { processRecurringTransactions, getIconForCategory } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RecurringPage() {
  const { user, formatCurrency } = useAuth();
  const [recurring, setRecurring] = useState<ClientRecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ClientRecurringTransaction | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const dbRecurring = await getRecurringTransactions();
      const processed = processRecurringTransactions(dbRecurring as RecurringTransaction[]);
      setRecurring(processed);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  const handleAddTransaction = async (
    newTransaction: Omit<RecurringTransaction, "id" | "Icon" | "createdAt">
  ) => {
    await addRecurringTransaction(newTransaction);
    fetchData();
  };

  const handleEditTransaction = async (
    updatedTransaction: Omit<RecurringTransaction, 'Icon' | 'createdAt'>
  ) => {
    await updateRecurringTransaction(updatedTransaction.id, updatedTransaction);
    fetchData();
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    await deleteRecurringTransaction(transactionId);
    fetchData();
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
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurring.length > 0 ? (
                  recurring.map((transaction) => {
                    const Icon = getIconForCategory(transaction.category);
                    return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-muted p-2 rounded-md">
                            <Icon className="h-4 w-4 text-muted-foreground" />
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
                       <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setEditingTransaction(transaction)}>
                              Edit
                            </DropdownMenuItem>
                             <DropdownMenuItem
                              onSelect={() => handleDeleteTransaction(transaction.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No recurring transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <AddRecurringTransactionDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTransaction={handleAddTransaction}
      />
      <EditRecurringTransactionDialog
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onOpenChange={(isOpen) => !isOpen && setEditingTransaction(null)}
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </main>
  );
}
