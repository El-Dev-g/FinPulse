// src/components/dashboard/recent-transactions.tsx
"use client";

import React, { useState, useEffect } from 'react';
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
import type { ClientTransaction, Transaction } from '@/lib/types';
import { getTransactions } from '@/lib/db';
import { useAuth } from '@/hooks/use-auth';
import { processTransactions, getIconForCategory } from '@/lib/utils';
import { Loader } from 'lucide-react';

interface RecentTransactionsProps {
  title?: string;
  description?: string;
}

export function RecentTransactions({
  title = "Recent Transactions",
  description = "Here are your latest financial activities.",
}: RecentTransactionsProps) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentTransactions = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const dbTransactions = await getTransactions();
                const processed = processTransactions(dbTransactions as Transaction[]);
                setTransactions(processed.slice(0, 5)); // Get 5 most recent
            } catch (error) {
                console.error("Error fetching recent transactions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentTransactions();
    }, [user]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const Icon = getIconForCategory(transaction.category);
                return (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-md">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.date}
                        </div>
                      </div>
                    </div>
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
              )})}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No recent transactions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
