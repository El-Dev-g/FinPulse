
// src/components/dashboard/stock-price-chart.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, subDays, startOfDay } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

interface StockPriceChartProps {
  data: {
    date: string;
    close: number;
  }[];
  isPositive: boolean;
}

const timeRangeFilters: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

export const StockPriceChart = ({ data, isPositive }: StockPriceChartProps) => {
  const { formatCurrency } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');

  const chartData = useMemo(() => {
    const now = startOfDay(new Date());
    let startDate: Date;
    
    switch (timeRange) {
      case '1D':
        // For 1D, we might need intraday data which we don't have.
        // We'll show the last few days from daily data instead as a fallback.
        startDate = subDays(now, 5); 
        break;
      case '1W':
        startDate = subDays(now, 7);
        break;
      case '1M':
        startDate = subDays(now, 30);
        break;
      case '3M':
        startDate = subDays(now, 90);
        break;
      case '1Y':
        startDate = subDays(now, 365);
        break;
      case '5Y':
        startDate = subDays(now, 365 * 5);
        break;
      default:
        startDate = subDays(now, 90);
    }

    return data
      .filter(d => parseISO(d.date) >= startDate)
      .map(d => ({
        date: d.date,
        price: d.close
      }));
  }, [data, timeRange]);

  if (!chartData || chartData.length === 0) {
    return (
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Not enough data to display chart.
        </div>
    )
  }

  const gradientId = `colorPrice-${isPositive ? 'positive' : 'negative'}`;
  const strokeColor = isPositive ? 'hsl(var(--chart-1))' : 'hsl(var(--destructive))';

  return (
    <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-green-600 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
            MARKET OPEN
        </div>
        <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                 <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => format(parseISO(str), 'MMM d')}
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                />
                <YAxis 
                    domain={['dataMin', 'dataMax']} 
                    hide 
                />
                <Tooltip 
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                    labelFormatter={(label) => format(parseISO(label), 'PPP')}
                    formatter={(value) => [formatCurrency(value as number), "Price"]}
                />
                <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={strokeColor}
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill={`url(#${gradientId})`} 
                />
            </AreaChart>
        </ResponsiveContainer>

        <div className="flex justify-around mt-4">
            {timeRangeFilters.map(range => (
                <Button
                    key={range}
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "text-muted-foreground",
                        timeRange === range && "bg-muted text-foreground"
                    )}
                    onClick={() => setTimeRange(range)}
                >
                    {range}
                </Button>
            ))}
        </div>
    </div>
  );
};
