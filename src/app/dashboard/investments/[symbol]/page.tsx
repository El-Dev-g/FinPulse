// src/app/dashboard/investments/[symbol]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStockHistory, getStockData } from '@/lib/actions';
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
import { ArrowLeft, Loader, TrendingUp, TrendingDown, AreaChart, BarChart, Clock, Badge } from 'lucide-react';
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


type HistoricalData = {
    date: string;
    close: number;
}

type StockData = {
    symbol: string;
    price: number;
    change: number;
    dayLow: number;
    dayHigh: number;
    volume: number;
    logo: string;
    name: string;
};

export default function StockDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { formatCurrency } = useAuth();
    const symbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;

    const [history, setHistory] = useState<HistoricalData[]>([]);
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!symbol) return;
        setLoading(true);
        setError(null);
        try {
            const [historyData, quoteDataArr] = await Promise.all([
                getStockHistory(symbol),
                getStockData([symbol])
            ]);

            const quoteData = quoteDataArr[0];
            
            if (!historyData || historyData.length === 0) {
                throw new Error("Could not load historical data for this stock.");
            }
            
            setHistory(historyData.reverse()); // Reverse to have oldest data first
            setStockData({
                symbol: quoteData.symbol,
                price: quoteData.price,
                change: quoteData.change,
                dayLow: quoteData.dayLow,
                dayHigh: quoteData.dayHigh,
                volume: quoteData.volume,
                logo: quoteData.logo,
                name: quoteData.name
            });

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
             <main className="flex-1 p-4 md:p-6 lg:p-8 text-center">
                <h2 className="text-xl font-bold text-destructive">Error</h2>
                <p className="text-muted-foreground mt-2">{error}</p>
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
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/investments">
                            <ArrowLeft className="mr-2" />
                            Back to Portfolio
                        </Link>
                    </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={stockData?.logo} alt={symbol} />
                            <AvatarFallback>{symbol.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight font-headline">{stockData?.name}</h2>
                            <p className="text-muted-foreground">{stockData?.symbol}</p>
                        </div>
                    </div>
                     <div className="text-left sm:text-right">
                        <p className="text-3xl font-bold">{formatCurrency(stockData?.price || 0)}</p>
                        <p className={cn("font-semibold", isPositiveChange ? "text-green-600" : "text-destructive")}>
                            {isPositiveChange ? '+' : ''}{formatCurrency(stockData?.change || 0)} ({isPositiveChange ? '+' : ''}{((stockData?.change || 0) / ((stockData?.price || 0) - (stockData?.change || 0)) * 100).toFixed(2)}%)
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Price History</CardTitle>
                        <CardDescription>Performance over the last 3 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(str) => format(parseISO(str), 'MMM d')} />
                                <YAxis domain={['dataMin', 'dataMax']} tickFormatter={(num) => formatCurrency(num)} />
                                <Tooltip 
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <p className="font-bold">{formatCurrency(payload[0].value as number)}</p>
                                                <p className="text-sm text-muted-foreground">{format(parseISO(label), 'PPP')}</p>
                                            </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="close" name="Closing Price" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                 <div className="grid md:grid-cols-3 gap-6 mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Day High</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatCurrency(stockData?.dayHigh || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Day Low</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatCurrency(stockData?.dayLow || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Volume</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{(stockData?.volume || 0).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                 </div>

            </div>
        </main>
    )
}
