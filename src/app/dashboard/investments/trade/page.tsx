
// src/app/dashboard/investments/trade/page.tsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getStockDetails } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InvestmentTradeForm } from '@/components/dashboard/investment-trade-form';
import { getAccounts, getInvestments, addTransaction, updateAccount, addInvestment, updateInvestment, deleteInvestment } from '@/lib/db';
import type { Account, Investment, ClientInvestment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type StockDetails = {
    symbol: string;
    name: string;
    price: number;
    logo: string;
};

function TradePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, formatCurrency } = useAuth();
    const { toast } = useToast();

    const symbol = searchParams.get('symbol');
    const action = searchParams.get('action');

    const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [holding, setHolding] = useState<Investment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!user || !symbol) {
            setError("No stock symbol provided.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [stockDetailsResult, dbAccounts, dbInvestments] = await Promise.all([
                getStockDetails(symbol),
                getAccounts() as Promise<Account[]>,
                getInvestments() as Promise<Investment[]>
            ]);

            if (stockDetailsResult.error || !stockDetailsResult.data) {
                throw new Error(stockDetailsResult.error || "Could not load data for this stock.");
            }

            setStockDetails({
                symbol: stockDetailsResult.data.symbol,
                name: stockDetailsResult.data.name,
                price: stockDetailsResult.data.price,
                logo: stockDetailsResult.data.logo
            });
            setAccounts(dbAccounts);

            const currentHolding = dbInvestments.find(inv => inv.symbol === symbol);
            setHolding(currentHolding || null);

        } catch (e: any) {
            console.error("Failed to fetch trade page data:", e);
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }, [symbol, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTrade = async (tradeAction: 'buy' | 'sell', quantity: number, price: number, accountId?: string) => {
        if (!symbol) {
             toast({ variant: "destructive", title: "Error", description: "Cannot execute trade, symbol not found." });
             return;
        }
        
        if (tradeAction === 'buy') {
            const cost = quantity * price;
            if (accountId) {
                const sourceAccount = accounts.find(acc => acc.id === accountId);
                if (!sourceAccount || (sourceAccount.balance || 0) < cost) {
                    toast({ variant: "destructive", title: "Insufficient Funds", description: "Not enough funds in the selected account." });
                    throw new Error("Insufficient Funds");
                }
                await updateAccount(accountId, { balance: (sourceAccount.balance || 0) - cost });
            }
            
            if (holding) {
                 const totalShares = holding.quantity + quantity;
                const totalCost = (holding.purchasePrice * holding.quantity) + (price * quantity);
                const newAveragePrice = totalCost / totalShares;
                await updateInvestment(holding.id!, { quantity: totalShares, purchasePrice: newAveragePrice });
            } else {
                await addInvestment({ symbol, quantity, purchasePrice: price });
            }

            await addTransaction({
                description: `Buy ${quantity} ${symbol}`,
                amount: -cost,
                category: "Investments",
                date: new Date().toISOString().split('T')[0],
                source: accountId || 'manual',
            });

            toast({ title: "Purchase Successful", description: `Bought ${quantity} shares of ${symbol}.` });

        } else { // Sell
            if (!holding) {
                toast({ variant: "destructive", title: "Error", description: "You do not own this stock." });
                return;
            }
            if (!accountId) {
                 toast({ variant: "destructive", title: "Error", description: "Please select an account to receive funds." });
                 throw new Error("Destination account not selected");
            }
            if (quantity > holding.quantity) {
                 toast({ variant: "destructive", title: "Error", description: "You cannot sell more shares than you own." });
                 throw new Error("Cannot sell more shares than owned");
            }

            const proceeds = quantity * price;
            const destAccount = accounts.find(acc => acc.id === accountId);
            if (!destAccount) {
                 toast({ variant: "destructive", title: "Error", description: "Destination account not found." });
                 throw new Error("Destination account not found");
            }
            await updateAccount(accountId, { balance: (destAccount.balance || 0) + proceeds });

            if (quantity === holding.quantity) {
                await deleteInvestment(holding.id!);
            } else {
                await updateInvestment(holding.id!, { quantity: holding.quantity - quantity });
            }

            await addTransaction({
                description: `Sell ${quantity} ${symbol}`,
                amount: proceeds,
                category: "Investments",
                date: new Date().toISOString().split('T')[0],
                source: accountId,
            });
            toast({ title: "Sale Successful", description: `Sold ${quantity} shares of ${symbol}.` });
        }
        router.push('/dashboard/investments');
    };


    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader className="h-8 w-8 animate-spin" /></div>
    }

    if (error || !stockDetails) {
        return (
             <div className="text-center">
                <Alert variant="destructive" className="max-w-lg mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Data</AlertTitle>
                    <AlertDescription>{error || "Could not find stock details."}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                 <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={stockDetails.logo} alt={symbol || ''} />
                        <AvatarFallback>{symbol?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight font-headline">{stockDetails.name}</CardTitle>
                        <CardDescription>{stockDetails.symbol} - Current Price: {formatCurrency(stockDetails.price)}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <InvestmentTradeForm 
                    holding={holding}
                    accounts={accounts}
                    currentPrice={stockDetails.price}
                    onTrade={handleTrade}
                    defaultAction={(action === 'buy' || action === 'sell') ? action : 'buy'}
                />
            </CardContent>
        </Card>
    )
}


export default function TradePage() {
    return (
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
            <div className="flex-grow">
                 <div className="mb-6">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/investments">
                            <ArrowLeft className="mr-2" />
                            Back to Portfolio
                        </Link>
                    </Button>
                </div>
                <Suspense fallback={<Loader className="animate-spin" />}>
                    <TradePageContent />
                </Suspense>
            </div>
        </main>
    )
}
