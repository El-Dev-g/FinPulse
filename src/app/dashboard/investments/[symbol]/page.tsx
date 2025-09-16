
// src/app/dashboard/investments/[symbol]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { ArrowLeft, Loader, TrendingUp, TrendingDown, AreaChart, BarChart, Clock, Badge, AlertCircle, Plus, Repeat } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CandlestickChart } from '@/components/dashboard/candlestick-chart';


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
    history: {
        date: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    }[];
};

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
                <Alert variant="destructive" className="max-w-lg">
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

    return (
        <main className="flex-1 flex flex-col">
            <div className="flex-grow p-4 md:p-6 lg:p-8 space-y-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                         <Button asChild variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                            <Link href="/dashboard/investments">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={stockData?.logo} alt={symbol as string} />
                                <AvatarFallback>{(symbol as string).slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight font-headline">{stockData?.name}</h2>
                                <p className="text-sm text-muted-foreground">{stockData?.symbol}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <p className="text-4xl font-bold">{formatCurrency(stockData?.price || 0)}</p>
                        <p className={cn("font-semibold text-base", isPositiveChange ? "text-green-600" : "text-destructive")}>
                            {isPositiveChange ? '+' : ''}{formatCurrency(stockData?.change || 0)} ({isPositiveChange ? '+' : ''}{((stockData?.change || 0) / ((stockData?.price || 0) - (stockData?.change || 0)) * 100).toFixed(2)}%)
                        </p>
                    </div>


                    <Card>
                        <CardHeader>
                            <CardTitle>Price History</CardTitle>
                            <CardDescription>Performance over the last 3 months.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stockData && stockData.history.length > 0 ? (
                                <CandlestickChart data={stockData.history} />
                            ) : (
                                <div className="h-[350px] flex items-center justify-center">
                                    <Alert variant="default" className="max-w-md">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>No Chart Data</AlertTitle>
                                        <AlertDescription>
                                            Historical price data could not be loaded for this stock.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Key Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Day High</p>
                                    <p className="font-semibold text-lg">{formatCurrency(stockData?.dayHigh || 0)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Day Low</p>
                                    <p className="font-semibold text-lg">{formatCurrency(stockData?.dayLow || 0)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Volume</p>
                                    <p className="font-semibold text-lg">{(stockData?.volume || 0).toLocaleString()}</p>
                                </div>
                                 <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Sector</p>
                                    <p className="font-semibold text-lg truncate">{stockData?.sector || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>About {stockData?.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{stockData?.description}</p>
                        </CardContent>
                    </Card>

                </div>
            </div>

            <div className="sticky bottom-0 mt-auto bg-background/80 backdrop-blur-sm border-t p-4 space-y-3">
                <Button variant="outline" className="w-full h-14 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 hover:text-green-900 dark:hover:text-green-200" asChild>
                    <Link href="/dashboard/recurring">
                         <Repeat className="mr-2" />
                        Set a recurring purchase
                    </Link>
                </Button>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" className="w-full h-14 text-base" asChild>
                        <Link href={`/dashboard/investments/trade?symbol=${symbol}&action=sell`}>
                            Sell
                        </Link>
                    </Button>
                     <Button className="w-full h-14 text-base" asChild>
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
