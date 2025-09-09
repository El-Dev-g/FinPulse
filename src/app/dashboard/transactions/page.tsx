
// src/app/dashboard/transactions/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Download, Plus, Loader, Lock, RefreshCcw, MoreHorizontal, Trash2 } from "lucide-react";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import type { ClientTransaction, Transaction } from "@/lib/types";
import { addTransaction, getTransactions, deleteTransaction } from "@/lib/db";
import { processTransactions, getIconForCategory } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ProBadge } from "@/components/pro-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";


export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] =
    useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<ClientTransaction | null>(null);
  const { user, formatCurrency, isPro } = useAuth();
  const { toast } = useToast();
  
  const fetchTransactions = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const dbTransactions = await getTransactions();
      const processed = processTransactions(dbTransactions as Transaction[]);
      setTransactions(processed);
    } catch (error) {
      console.error("Error fetching transactions: ", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const categories = [
    "all",
    ...Array.from(new Set(transactions.map((t) => t.category))),
  ];

  const filteredTransactions = transactions
    .filter((transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (transaction) =>
        categoryFilter === "all" || transaction.category === categoryFilter
    );

  const handleAddTransaction = async (
    newTransaction: Omit<Transaction, "id" | "Icon" | "createdAt">
  ) => {
    await addTransaction(newTransaction);
    fetchTransactions(); // Refetch
  };

  const handleSyncTransactions = async () => {
    setIsSyncing(true);
    // In a real app, this would trigger a webhook or function to fetch from a bank API.
    // For this prototype, we'll just re-fetch from our database to simulate a refresh.
    try {
      await fetchTransactions();
      toast({
        title: "Sync Complete!",
        description: "Your transactions are up-to-date.",
      });
    } catch (error) {
      console.error("Error syncing transactions:", error);
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Could not refresh your transactions at this time.",
      });
    } finally {
      setIsSyncing(false);
    }
  };


  const handleExportCSV = () => {
    if (!isPro) return; // This should be redundant due to the button being disabled, but it's good practice.
    const headers = ["ID", "Description", "Amount", "Date", "Category"];
    const csvRows = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [
          t.id,
          `"${t.description.replace(/"/g, '""')}"`,
          t.amount,
          t.date,
          t.category,
        ].join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;
    try {
      await deleteTransaction(deletingTransaction.id);
      toast({
        title: "Transaction Deleted",
        description: `The transaction "${deletingTransaction.description}" has been deleted.`,
      });
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the transaction.",
      });
    } finally {
      setDeletingTransaction(null);
    }
  }


  return (
    <>
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Transactions
            </h2>
            <p className="text-muted-foreground">
              View and manage all your financial activities.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSyncTransactions} disabled={isSyncing || loading}>
                {isSyncing ? <Loader className="mr-2 animate-spin" /> : <RefreshCcw className="mr-2" />}
                Sync
            </Button>
            <Button onClick={() => setIsAddTransactionDialogOpen(true)}>
              <Plus className="mr-2" />
              Add Manually
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <Input
                placeholder="Search by description..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex gap-2 w-full md:w-auto">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Button variant="outline" onClick={handleExportCSV} disabled={!isPro} className="w-full">
                          {!isPro ? <Lock className="mr-2" /> : <Download className="mr-2" />}
                          Export
                          {!isPro && (
                            <div className="absolute -top-2 -right-2">
                              <ProBadge />
                            </div>
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!isPro && (
                      <TooltipContent>
                        <p>Upgrade to Pro to export your data.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => {
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
                      <TableCell className="text-muted-foreground">
                        {transaction.date}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
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
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setDeletingTransaction(transaction)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <AddTransactionDialog
        isOpen={isAddTransactionDialogOpen}
        onOpenChange={setIsAddTransactionDialogOpen}
        onAddTransaction={handleAddTransaction}
      />
    </main>
      <AlertDialog
        open={!!deletingTransaction}
        onOpenChange={() => setDeletingTransaction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction for "{deletingTransaction?.description}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, delete transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
