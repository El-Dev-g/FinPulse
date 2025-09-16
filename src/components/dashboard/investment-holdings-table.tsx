
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import type { ClientInvestment } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

interface InvestmentHoldingsTableProps {
  investments: ClientInvestment[];
  onEdit: (investment: ClientInvestment) => void;
  onDelete: (investment: ClientInvestment) => void;
}

export function InvestmentHoldingsTable({ investments, onEdit, onDelete }: InvestmentHoldingsTableProps) {
  const { formatCurrency } = useAuth();

  return (
    <div className="flow-root">
      <ul role="list" className="-my-4 divide-y divide-border">
        {investments.map((inv) => (
          <li key={inv.id}>
            <Link href={`/dashboard/investments/${inv.symbol}`} className="flex items-center justify-between py-4 group">
                <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={inv.logoUrl} alt={inv.symbol} />
                    <AvatarFallback>{inv.symbol.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-6 truncate">{inv.symbol}</p>
                    <p className="text-sm text-muted-foreground truncate">{inv.name}</p>
                </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-base font-semibold">{formatCurrency(inv.currentValue)}</p>
                        <p className="text-xs text-muted-foreground">{inv.quantity} shares</p>
                    </div>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.preventDefault()}
                        >
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
