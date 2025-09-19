
// src/app/dashboard/investments/trade/page.tsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getStockDetails, getPortfolio, submitOrder } from '@/lib/actions';
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
import { ArrowLeft, Loader, AlertCircle, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InvestmentTradeForm } from '@/components/dashboard/investment-trade-form';
import type { AlpacaAccount, ClientInvestment, OrderParams, StockDetails } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import BrokerErrorBanner from '@/components/dashboard/broker-error-banner';

function TradePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, formatCurrency } = useAuth();
    const { toast } = useToast();

    const [symbol, setSymbol] = useState(searchParams.get('symbol') || '');
    const [action, setAction] = useState(searchParams.get('action') || 'buy');

    const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
    const [account, setAccount] = useState<AlpacaAccount | null>(null);
    const [holding, setHolding] = useState<ClientInvestment | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDataForSymbol = useCallback(async (sym: string) => {
        if (!user || !sym) return;
        setLoading(true);
        setError(null);
        setStockDetails(null);
        setHolding(null);
        try {
            const [stockDetailsResult, portfolioResult] = await Promise.all([
                getStockDetails(sym),
                getPortfolio()
            ]);

            if (stockDetailsResult.error || !stockDetailsResult.data?.asset) {
                throw new Error(stockDetailsResult.error || `Could not load data for ${sym}.`);
            }
            if (portfolioResult.error || !portfolioResult.data?.account) {
                 throw new Error(portfolioResult.error || "Could not load account data.");
            }
            
            setStockDetails(stockDetailsResult.data as StockDetails);
            setAccount(portfolioResult.data.account);
            
            const currentHolding = portfolioResult.data.portfolio?.find((inv: any) => inv.symbol === sym);
            setHolding(currentHolding || null);

        } catch (e: any) {
            console.error("Failed to fetch trade page data:", e);
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (symbol) {
            fetchDataForSymbol(symbol);
        }
    }, [symbol, fetchDataForSymbol]);

    const handleTrade = async (tradeAction: 'buy' | 'sell', quantity: number, price: number, type: 'market' | 'limit', time_in_force: 'day' | 'gtc') => {
        if (!symbol) {
             toast({ variant: "destructive", title: "Error", description: "Cannot execute trade, symbol not found." });
             return;
        }
        
        const order: OrderParams = {
            symbol,
            qty: quantity,
            side: tradeAction,
            type,
            time_in_force,
        };

        if (type === 'limit') {
            order.limit_price = price;
        }

        const result = await submitOrder(order);

        if (result.error || !result.data) {
             toast({ variant: "destructive", title: "Order Failed", description: result.error || "An unknown error occurred." });
             throw new Error(result.error || "Order failed");
        } else {
             toast({ title: "Order Submitted", description: `Your ${tradeAction} order for ${quantity} shares of ${symbol} was successfully submitted.` });
             router.push('/dashboard/investments');
        }
    };
    
    const handleSymbolSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const searchSymbol = formData.get('symbol') as string;
        if (searchSymbol) {
            router.push(`/dashboard/investments/trade?symbol=${searchSymbol.toUpperCase()}`);
            setSymbol(searchSymbol.toUpperCase());
        }
    }

    const latestQuote = stockDetails?.bars && stockDetails.bars.length > 0 
        ? stockDetails.bars[stockDetails.bars.length - 1] 
        : stockDetails?.latestQuote;


    return (
        <>
            {error ? (
                <div className="text-center">
                    <BrokerErrorBanner error={error} />
                </div>
            ) : !symbol ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Search for a Stock</CardTitle>
                        <CardDescription>Enter a stock symbol to begin trading.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSymbolSearch} className="flex gap-2">
                            <Input name="symbol" placeholder="e.g., AAPL, GOOG" className="uppercase" autoCapitalize="characters"/>
                            <Button type="submit"><Search className="mr-2"/>Search</Button>
                        </form>
                    </CardContent>
                </Card>
            ) : loading ? (
                <div className="flex justify-center items-center h-96"><Loader className="h-8 w-8 animate-spin" /></div>
            ) : !stockDetails ? (
                 <div className="text-center">
                    <BrokerErrorBanner error={error} />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={`https://c-alpha.imgix.net/logos/${symbol}.svg`} alt={symbol || ''} />
                                <AvatarFallback>{symbol?.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl font-bold tracking-tight font-headline">{stockDetails.asset.name}</CardTitle>
                                <CardDescription>{stockDetails.asset.symbol} - Current Price: {latestQuote ? formatCurrency(latestQuote.c) : 'N/A'}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         {latestQuote ? (
                            <InvestmentTradeForm
                                holding={holding}
                                account={account}
                                currentPrice={latestQuote.c}
                                onTrade={handleTrade}
                                defaultAction={(action === 'buy' || action === 'sell') ? action : 'buy'}
                            />
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>Could not retrieve live price data for this stock.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    );
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
