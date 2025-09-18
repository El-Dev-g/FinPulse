
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader, TrendingUp, TrendingDown, AlertCircle, Plus, Repeat, Heart, ArrowUpRight, Info, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockPriceChart } from '@/components/dashboard/stock-price-chart';
import { format, parseISO } from 'date-fns';
import type { NewsArticle } from '@/lib/types';
import { RecurringPurchaseCard } from '@/components/dashboard/recurring-purchase-card';


type StockDetails = {
    symbol: string;
    price: number;
    change: number;
    dayLow: number;
    dayHigh: number;
    volume: number;
    logo: string;
    name: string;
    description: string;
    sector: string;
    industry: string;
    ceo: string;
    marketCap: string;
    peRatio: string;
    dividendYield: string;
    week52High: string;
    week52Low: string;
    history: {
        date: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    }[];
    news: NewsArticle[];
};

function FinancialsStat({ label, value }: { label: string, value: string | number}) {
    return (
        <div className="flex justify-between py-4 border-b px-4 sm:px-6">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}

function formatMarketCap(marketCap: string) {
    const num = parseInt(marketCap);
    if (isNaN(num)) return "N/A";
    if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
}

export default function StockDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { formatCurrency, currency } = useAuth();
    const symbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;

    const [stockData, setStockData] = useState<StockDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    const fetchData = useCallback(async () => {
        if (!symbol) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getStockDetails(symbol as string);

            if (result.error || !result.data) {
                throw new Error(result.error || "Could not load data for this stock.");
            }
            
            setStockData(result.data);

        } catch (e: any) {
            console.error("Failed to fetch stock data:", e);
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const isPositiveChange = stockData ? stockData.change >= 0 : true;

    if (loading) {
        return (
            <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
                <Loader className="h-12 w-12 animate-spin text-primary" />
            </main>
        )
    }
    
    if (error) {
        return (
             <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center text-center">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Stock Data</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                 <Button asChild variant="outline" className="mt-6">
                    <Link href="/dashboard/investments">
                        <ArrowLeft className="mr-2" />
                        Back to Portfolio
                    </Link>
                </Button>
            </main>
        )
    }

    if (!stockData) {
        return null;
    }
    
    const formatPublishedDate = (dateString: string) => {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        const date = new Date(`${year}-${month}-${day}`);
        return format(date, 'LLL dd, yyyy');
    }

    const mockGhsRate = 15.0; // Example rate
    const priceInGhs = stockData.price * mockGhsRate;
    const ghsCurrencyFormat = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });

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
                             <h2 className="text-lg font-bold tracking-tight font-headline">{stockData.symbol}</h2>
                             <p className="text-sm text-muted-foreground">{stockData.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => setIsFavorite(!isFavorite)}>
                            <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500 text-red-500")} />
                        </Button>
                    </div>

                    <Tabs defaultValue="about" className="w-full">
                        <TabsList className="w-full justify-start border-b gap-4 px-4 sm:px-6" variant="underline">
                            <TabsTrigger value="about">About</TabsTrigger>
                            <TabsTrigger value="financials">Financials</TabsTrigger>
                            <TabsTrigger value="news">News</TabsTrigger>
                        </TabsList>
                        
                        <div className="px-4 sm:px-6 mt-6">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={stockData.logo || `https://ui-avatars.com/api/?name=${symbol}`} alt={symbol as string} />
                                    <AvatarFallback>{(symbol as string).slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="text-4xl font-bold">{formatCurrency(stockData.price)}</p>
                                    {currency === 'USD' && (
                                        <p className="text-sm text-muted-foreground">~{ghsCurrencyFormat.format(priceInGhs)}</p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <p className={cn("font-semibold text-base", isPositiveChange ? "text-green-600" : "text-destructive")}>
                                            {isPositiveChange ? '+' : ''}{formatCurrency(stockData.change)} ({isPositiveChange ? '+' : ''}{((stockData.change) / ((stockData.price) - (stockData.change)) * 100).toFixed(2)}%)
                                        </p>
                                        <p className="text-sm text-muted-foreground">today</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <TabsContent value="about" className="w-full mt-6 px-4 sm:px-6 space-y-6">
                             <StockPriceChart data={stockData.history} isPositive={isPositiveChange}/>
                            <div className="pt-6">
                                <RecurringPurchaseCard />
                            </div>
                            {stockData.industry && (
                                 <div className="space-y-2">
                                    <h3 className="text-lg font-semibold font-headline">Featured In</h3>
                                    <Button variant="outline" className="bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30 text-primary dark:text-primary-foreground/80 hover:bg-primary/20 dark:hover:bg-primary/30">
                                        <Zap className="mr-2 h-4 w-4"/> {stockData.industry}
                                    </Button>
                                </div>
                            )}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold font-headline">About {stockData.symbol}</h3>
                                <p className="text-muted-foreground text-sm">{stockData.description}</p>
                            </div>
                             <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">CEO</h4>
                                <p className="font-semibold">{stockData.ceo || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Sector</h4>
                                <p className="font-semibold">{stockData.sector || 'N/A'}</p>
                            </div>
                            <Button variant="link" className="p-0 text-primary dark:text-green-400">Read More</Button>
                        </TabsContent>
                         <TabsContent value="financials" className="w-full mt-6 p-0">
                            <div className="text-sm border-t">
                                <FinancialsStat label="Open" value={formatCurrency(stockData.dayHigh > 0 ? stockData.history.at(-1)?.open ?? 0 : 0)} />
                                <FinancialsStat label="High" value={formatCurrency(stockData.dayHigh)} />
                                <FinancialsStat label="Low" value={formatCurrency(stockData.dayLow)} />
                                <FinancialsStat label="52 Wk High" value={formatCurrency(parseFloat(stockData.week52High))} />
                                <FinancialsStat label="52 Wk Low" value={formatCurrency(parseFloat(stockData.week52Low))} />
                                <FinancialsStat label="Volume" value={stockData.volume.toLocaleString()} />
                                <FinancialsStat label="Avg Vol" value="N/A" />
                                <FinancialsStat label="Mkt Cap" value={formatMarketCap(stockData.marketCap)} />
                                <FinancialsStat label="P/E Ratio" value={stockData.peRatio} />
                                <FinancialsStat label="Div/Yield" value={stockData.dividendYield === "N/A" ? "N/A" : `${(parseFloat(stockData.dividendYield) * 100).toFixed(2)}%`} />
                            </div>
                        </TabsContent>
                         <TabsContent value="news" className="w-full mt-6 p-0">
                            <div className="space-y-0 border-t">
                                {stockData.news && stockData.news.length > 0 ? (
                                    stockData.news.map((article, index) => (
                                        <a key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-4 sm:p-6 border-b hover:bg-muted/50">
                                            <div className="flex gap-4 items-start">
                                                <div className="flex-grow">
                                                    <p className="font-semibold leading-snug">{article.title}</p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                        <span>{formatPublishedDate(article.time_published)}</span>
                                                        <span className="flex items-center gap-1.5 text-primary"><ArrowUpRight className="h-3 w-3" />{article.source}</span>
                                                    </div>
                                                </div>
                                                {article.banner_image && (
                                                    <div className="relative w-24 h-16 flex-shrink-0">
                                                        <Image
                                                            src={article.banner_image}
                                                            alt={article.title}
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
                                        <p className="text-muted-foreground">No recent news found for {stockData.symbol}.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <div className="sticky bottom-0 mt-auto bg-transparent p-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <Avatar className="h-12 w-12 hidden sm:flex">
                        <AvatarImage src={stockData.logo || `https://ui-avatars.com/api/?name=${symbol}`} alt={symbol as string} />
                        <AvatarFallback>{(symbol as string).slice(0, 2)}</AvatarFallback>
                    </Avatar>
                     <Button className="w-full h-14 text-base flex-grow" asChild style={{backgroundColor: '#006A44'}}>
                        <Link href={`/dashboard/investments/trade?symbol=${symbol}&action=buy`}>
                            <Plus className="mr-2" />
                            Buy
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}
