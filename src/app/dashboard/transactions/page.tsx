// src/app/dashboard/transactions/page.tsx
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
import { transactionsData as initialTransactions } from "@/lib/placeholder-data";
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
import { ArrowRightLeft, Download, Plus } from "lucide-react";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import type { Transaction } from "@/lib/placeholder-data";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] =
    useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const categories = [
    "all",
    ...Array.from(new Set(initialTransactions.map((t) => t.category))),
  ];

  const filteredTransactions = transactions
    .filter((transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (transaction) =>
        categoryFilter === "all" || transaction.category === categoryFilter
    );

  const handleAddTransaction = (
    newTransaction: Omit<Transaction, "id" | "Icon">
  ) => {
    const transactionWithId: Transaction = {
      ...newTransaction,
      id: `txn_${transactions.length + 1}`,
      Icon: ArrowRightLeft, // Default icon, can be improved
    };
    setTransactions([transactionWithId, ...transactions]);
  };

  const handleExportCSV = () => {
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

  return (
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
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setIsAddTransactionDialogOpen(true)}>
              <Plus className="mr-2" />
              Add Transaction
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
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
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
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AddTransactionDialog
        isOpen={isAddTransactionDialogOpen}
        onOpenChange={setIsAddTransactionDialogOpen}
        onAddTransaction={handleAddTransaction}
        categories={categories.filter((c) => c !== "all" && c !== "Income")}
      />
    </main>
  );
}
