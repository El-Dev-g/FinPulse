
// src/components/dashboard/candlestick-chart.tsx
"use client";

import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { scaleLinear } from 'd3-scale';
import { useAuth } from '@/hooks/use-auth';

interface CandlestickChartProps {
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isGrowing = open < close;
  const color = isGrowing ? 'hsl(var(--chart-1))' : 'hsl(var(--destructive))';
  const ratio = Math.abs(height / (open - close));

  return (
    <g stroke={color} fill={isGrowing ? 'transparent' : color} strokeWidth="1">
      <path
        d={`M${x},${y} L${x},${y + height} M${x + width / 2},${y} L${x + width / 2},${y - (high - Math.max(open, close)) * ratio
          } M${x + width / 2},${y + height} L${x + width / 2},${y + height + (Math.min(open, close) - low) * ratio}`}
      />
      <rect x={x} y={y} width={width} height={height} />
    </g>
  );
};


const CustomTooltip = ({ active, payload, label }: any) => {
    const { formatCurrency } = useAuth();
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
           <p className="font-bold text-base">{format(parseISO(label), 'PPP')}</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm mt-2">
            <span className="text-muted-foreground">Open:</span>
            <span className="font-mono text-right">{formatCurrency(data.open)}</span>
            <span className="text-muted-foreground">High:</span>
            <span className="font-mono text-right">{formatCurrency(data.high)}</span>
            <span className="text-muted-foreground">Low:</span>
            <span className="font-mono text-right">{formatCurrency(data.low)}</span>
            <span className="text-muted-foreground">Close:</span>
            <span className="font-mono text-right">{formatCurrency(data.close)}</span>
            <span className="text-muted-foreground">Volume:</span>
            <span className="font-mono text-right">{data.volume.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
};

export const CandlestickChart = ({ data }: CandlestickChartProps) => {
  const { formatCurrency } = useAuth();

  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));
  const yDomain = [minPrice * 0.98, maxPrice * 1.02];

  const yAxisScale = scaleLinear().domain(yDomain).range([300, 0]);

  const candleData = data.map(d => ({
    ...d,
    candle: [d.open, d.close],
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={candleData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={(str) => format(parseISO(str), 'MMM d')} />
        <YAxis 
            orientation="right" 
            domain={yDomain} 
            tickFormatter={(num) => formatCurrency(num)} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="candle"
          shape={(props: any) => {
            const { x, width } = props;
            const { open, close, low, high } = props.payload;
            const y = yAxisScale(Math.max(open, close));
            const height = Math.abs(yAxisScale(open) - yAxisScale(close));

            return (
              <Candlestick
                {...props}
                x={x}
                y={y}
                width={width}
                height={height}
                low={low}
                high={high}
                open={open}
                close={close}
              />
            );
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
