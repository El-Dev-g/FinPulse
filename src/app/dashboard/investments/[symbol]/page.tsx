
// src/app/dashboard/investments/[symbol]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { getStockDetails } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader, AlertCircle, ShoppingCart, ArrowUpRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockPriceChart } from '@/components/dashboard/stock-price-chart';
import { format, parseISO } from 'date-fns';
import type { NewsArticle, StockDetails } from '@/lib/types';
import BrokerErrorBanner from '@/components/dashboard/broker-error-banner';

function FinancialsStat({ label, value }: { label: string, value: string | number | undefined}) {
    if (value === undefined || value === null) return null;
    return (
        <div className="flex justify-between py-4 border-b px-4 sm:px-6">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}

export default function StockDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { formatCurrency } = useAuth();
    const symbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;

    const [stockData, setStockData] = useState<StockDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!symbol) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getStockDetails(symbol as string);

            if (result.error || !result.data?.asset) {
                throw new Error(result.error || "Could not load data for this stock. Please ensure your Alpaca API keys are set correctly.");
            }
            
            setStockData(result.data as StockDetails);

        } catch (e: any) {
            console.error("Failed to fetch stock data:", e);
            setError(e.message || "An unexpected error occurred. This symbol may not be tradable on Alpaca.");
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    if (loading) {
        return (
            <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
                <Loader className="h-12 w-12 animate-spin text-primary" />
            </main>
        )
    }
    
    if (error || !stockData) {
        return (
             <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center text-center">
                <div className="max-w-md w-full">
                  <BrokerErrorBanner error={error} />
                </div>
                 <Button asChild variant="outline" className="mt-6">
                    <Link href="/dashboard/investments">
                        <ArrowLeft className="mr-2" />
                        Back to Portfolio
                    </Link>
                </Button>
            </main>
        )
    }

    const latestQuote = stockData?.bars && stockData.bars.length > 0 ? stockData.bars[stockData.bars.length - 1] : stockData.latestQuote;
    const prevQuote = stockData?.bars && stockData.bars.length > 1 ? stockData.bars[stockData.bars.length - 2] : null;
    const priceChange = latestQuote && prevQuote ? latestQuote.c - prevQuote.c : 0;
    const priceChangePercent = prevQuote && prevQuote.c > 0 && latestQuote ? (priceChange / prevQuote.c) * 100 : 0;
    const isPositiveChange = priceChange >= 0;
    
    const formatPublishedDate = (dateString: string) => {
        return format(parseISO(dateString), 'LLL dd, yyyy');
    }

    return (
        <main className="flex-1 flex flex-col">
            <div className="flex-grow space-y-6 overflow-y-auto pb-40">
                <div className="w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                         <Button asChild variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                            <Link href="/dashboard/investments">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="text-center">
                             <h2 className="text-lg font-bold tracking-tight font-headline">{stockData.asset.symbol}</h2>
                             <p className="text-sm text-muted-foreground">{stockData.asset.name}</p>
                        </div>
                        <div className="h-9 w-9" />
                    </div>

                    <Tabs defaultValue="about" className="w-full">
                        <TabsList className="w-full justify-start border-b gap-4 px-4 sm:px-6" variant="underline">
                            <TabsTrigger value="about">Chart</TabsTrigger>
                            <TabsTrigger value="financials">Details</TabsTrigger>
                            <TabsTrigger value="news">News</TabsTrigger>
                        </TabsList>
                        
                        <div className="px-4 sm:px-6 mt-6">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={`https://c-alpha.imgix.net/logos/${symbol}.svg`} alt={symbol as string} />
                                    <AvatarFallback>{(symbol as string).slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="text-4xl font-bold">{formatCurrency(latestQuote?.c || 0)}</p>
                                    <div className="flex items-center gap-2">
                                        <p className={cn("font-semibold text-base", isPositiveChange ? "text-green-600" : "text-destructive")}>
                                            {isPositiveChange ? '+' : ''}{formatCurrency(priceChange)} ({isPositiveChange ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                                        </p>
                                        <p className="text-sm text-muted-foreground">today</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <TabsContent value="about" className="w-full mt-6 px-4 sm:px-6 space-y-6">
                            {stockData.bars && stockData.bars.length > 0 ? (
                                <StockPriceChart data={stockData.bars.map(b => ({ date: b.t, close: b.c }))} isPositive={isPositiveChange}/>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">No chart data available.</div>
                            )}
                            {stockData.asset.industry && (
                                 <div className="space-y-2">
                                    <h3 className="text-lg font-semibold font-headline">Industry</h3>
                                    <Button variant="outline" className="bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30 text-primary dark:text-primary-foreground/80 hover:bg-primary/20 dark:hover:bg-primary/30">
                                        <Zap className="mr-2 h-4 w-4"/> {stockData.asset.industry}
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                         <TabsContent value="financials" className="w-full mt-6 p-0">
                            <div className="text-sm border-t">
                                <FinancialsStat label="Open" value={formatCurrency(latestQuote?.o)} />
                                <FinancialsStat label="High" value={formatCurrency(latestQuote?.h)} />
                                <FinancialsStat label="Low" value={formatCurrency(latestQuote?.l)} />
                                <FinancialsStat label="Volume" value={latestQuote?.v.toLocaleString()} />
                                <FinancialsStat label="Tradable" value={stockData.asset.tradable ? 'Yes' : 'No'} />
                                <FinancialsStat label="Marginable" value={stockData.asset.marginable ? 'Yes' : 'No'} />
                                <FinancialsStat label="Shortable" value={stockData.asset.shortable ? 'Yes' : 'No'} />
                                <FinancialsStat label="Exchange" value={stockData.asset.exchange} />
                            </div>
                        </TabsContent>
                         <TabsContent value="news" className="w-full mt-6 p-0">
                            <div className="space-y-0 border-t">
                                {stockData.news && stockData.news.length > 0 ? (
                                    stockData.news.map((article: NewsArticle) => (
                                        <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-4 sm:p-6 border-b hover:bg-muted/50">
                                            <div className="flex gap-4 items-start">
                                                <div className="flex-grow">
                                                    <p className="font-semibold leading-snug">{article.headline}</p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                        <span>{formatPublishedDate(article.created_at)}</span>
                                                        <span className="flex items-center gap-1.5 text-primary"><ArrowUpRight className="h-3 w-3" />{article.author}</span>
                                                    </div>
                                                </div>
                                                {article.images?.[0]?.url && (
                                                    <div className="relative w-24 h-16 flex-shrink-0">
                                                        <Image
                                                            src={article.images[0].url}
                                                            alt={article.headline}
                                                            fill
                                                            className="object-cover rounded-md"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="h-40 flex items-center justify-center border-b">
                                        <p className="text-muted-foreground">No recent news found for {stockData.asset.symbol}.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <div className="sticky bottom-0 mt-auto bg-transparent p-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                     <Button className="w-full h-14 text-base flex-grow" onClick={() => router.push(`/dashboard/investments/trade?symbol=${symbol}`)} disabled={!latestQuote}>
                        <ShoppingCart className="mr-2" />
                        Trade
                    </Button>
                </div>
            </div>
        </main>
    )
}
