// src/components/dashboard/investment-holdings-table.tsx
"use client";

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import type { ClientInvestment } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface InvestmentHoldingsTableProps {
  investments: ClientInvestment[];
  onEdit: (investment: ClientInvestment) => void;
  onDelete: (investment: ClientInvestment) => void;
}

export function InvestmentHoldingsTable({ investments, onEdit, onDelete }: InvestmentHoldingsTableProps) {
  const { formatCurrency } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Holdings</CardTitle>
        <CardDescription>A detailed view of your investment portfolio.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Holding</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead className="text-right">Total Gain/Loss</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((inv) => {
              const isGain = inv.gainLoss >= 0;
              return (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={inv.logoUrl} alt={inv.symbol} />
                            <AvatarFallback>{inv.symbol.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{inv.symbol}</div>
                    </div>
                  </TableCell>
                  <TableCell>{inv.quantity}</TableCell>
                  <TableCell>{formatCurrency(inv.currentPrice)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(inv.currentValue)}</TableCell>
                  <TableCell className={cn("text-right font-medium", isGain ? "text-green-600" : "text-destructive")}>
                    <div className="flex items-center justify-end gap-2">
                        {isGain ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span>{formatCurrency(inv.gainLoss)} ({inv.gainLossPercentage.toFixed(2)}%)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => onEdit(inv)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => onDelete(inv)} className="text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" />
                           Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}