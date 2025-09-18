
// src/components/dashboard/investment-holdings-table.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from "@/hooks/use-auth";
import type { ClientInvestment } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface InvestmentHoldingsTableProps {
  investments: ClientInvestment[];
}

export function InvestmentHoldingsTable({ investments }: InvestmentHoldingsTableProps) {
  const { formatCurrency } = useAuth();

  return (
    <div className="flow-root">
      <ul role="list" className="-my-4 divide-y divide-border">
        {investments.map((inv) => {
            const isGain = inv.unrealized_pl >= 0;
            return (
          <li key={inv.id} className="py-4 group">
            <Link href={`/dashboard/investments/${inv.symbol}`} className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-grow">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={inv.logoUrl} alt={inv.symbol} />
                        <AvatarFallback>{inv.symbol.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium leading-6 truncate">{inv.symbol}</p>
                        <p className="text-sm text-muted-foreground truncate">{inv.qty} shares</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-base font-semibold">{formatCurrency(inv.market_value)}</p>
                    <div className={cn("flex items-center justify-end text-xs", isGain ? "text-green-600" : "text-destructive")}>
                        {isGain ? <ArrowUp className="h-3 w-3 mr-1"/> : <ArrowDown className="h-3 w-3 mr-1" />}
                        {formatCurrency(inv.unrealized_pl)} ({inv.unrealized_plpc * 100}%)
                    </div>
                </div>
            </Link>
          </li>
        )})}
      </ul>
    </div>
  );
}
