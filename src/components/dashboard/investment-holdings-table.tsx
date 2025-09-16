
// src/components/dashboard/investment-holdings-table.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import type { ClientInvestment } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface InvestmentHoldingsTableProps {
  investments: ClientInvestment[];
  onDelete: (investment: ClientInvestment) => void;
}

export function InvestmentHoldingsTable({ investments, onDelete }: InvestmentHoldingsTableProps) {
  const { formatCurrency } = useAuth();

  return (
    <div className="flow-root">
      <ul role="list" className="-my-4 divide-y divide-border">
        {investments.map((inv) => (
          <li key={inv.id} className="py-4 group">
            <div className="flex items-center justify-between">
                <Link href={`/dashboard/investments/${inv.symbol}`} className="flex items-center space-x-4 flex-grow">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={inv.logoUrl} alt={inv.symbol} />
                        <AvatarFallback>{inv.symbol.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium leading-6 truncate">{inv.symbol}</p>
                        <p className="text-sm text-muted-foreground truncate">{inv.name}</p>
                    </div>
                </Link>
                <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
                    <div className="text-right">
                        <p className="text-base font-semibold">{formatCurrency(inv.currentValue)}</p>
                        <p className="text-xs text-muted-foreground">{inv.quantity} shares</p>
                    </div>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                        >
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onDelete(inv)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Holding
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
