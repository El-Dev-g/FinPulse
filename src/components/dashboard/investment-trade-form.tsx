
// src/components/dashboard/investment-trade-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { useAuth } from "@/hooks/use-auth";
import type { AlpacaAccount, ClientInvestment } from "@/lib/types";

interface InvestmentTradeFormProps {
  holding: ClientInvestment | null;
  account: AlpacaAccount | null;
  currentPrice: number;
  onTrade: (action: 'buy' | 'sell', quantity: number, price: number, type: 'market' | 'limit', time_in_force: 'day' | 'gtc') => Promise<void>;
  defaultAction?: 'buy' | 'sell';
}

function TradeForm({
    action,
    holding,
    account,
    currentPrice,
    onSubmit
}: {
    action: 'buy' | 'sell';
    holding: ClientInvestment | null;
    account: AlpacaAccount | null;
    currentPrice: number;
    onSubmit: (quantity: number, price: number, type: 'market' | 'limit', time_in_force: 'day' | 'gtc') => Promise<void>;
}) {
    const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
    const [quantity, setQuantity] = useState("");
    const [limitPrice, setLimitPrice] = useState("");
    const [timeInForce, setTimeInForce] = useState<'day' | 'gtc'>('day');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { formatCurrency } = useAuth();
    
    useEffect(() => {
        setLimitPrice(String(currentPrice.toFixed(2)));
    }, [currentPrice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const numQuantity = parseFloat(quantity);

        if (isNaN(numQuantity) || numQuantity <= 0) {
            setError("Please enter a valid quantity.");
            return;
        }

        const numLimitPrice = orderType === 'limit' ? parseFloat(limitPrice) : 0;
        if (orderType === 'limit' && (isNaN(numLimitPrice) || numLimitPrice <= 0)) {
            setError("Please enter a valid limit price.");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(numQuantity, numLimitPrice, orderType, timeInForce);
            // Parent component will handle success and navigation
        } catch (err: any) {
            setError(err.message || `Failed to ${action} shares.`);
            setLoading(false); // Stop loading on error to allow user to correct
        }
    };
    
    const maxSellQuantity = holding?.qty || 0;
    const estimatedCost = (parseFloat(quantity) || 0) * (orderType === 'limit' ? (parseFloat(limitPrice) || 0) : currentPrice);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Order Type</Label>
                    <Select value={orderType} onValueChange={(v) => setOrderType(v as 'market' | 'limit')}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="market">Market</SelectItem>
                            <SelectItem value="limit">Limit</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                  <div className="space-y-2">
                    <Label>Time in Force</Label>
                    <Select value={timeInForce} onValueChange={(v) => setTimeInForce(v as 'day' | 'gtc')}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="gtc">Good 'til Canceled</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`${action}-quantity`}>Quantity</Label>
                    <Input 
                        id={`${action}-quantity`} 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        placeholder="0" 
                        max={action === 'sell' ? maxSellQuantity : undefined}
                        step="1"
                    />
                </div>
                {orderType === 'limit' && (
                    <div className="space-y-2">
                        <Label htmlFor={`${action}-limit-price`}>Limit Price ($)</Label>
                        <Input id={`${action}-limit-price`} type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="0.00" />
                    </div>
                )}
            </div>
            
            {action === 'sell' && (
                <Alert variant="default">
                    <AlertDescription>You have {maxSellQuantity} shares available to sell.</AlertDescription>
                </Alert>
            )}

            <Alert variant="default">
                <AlertDescription className="flex justify-between items-center">
                    <span>{action === 'buy' ? 'Estimated Cost:' : 'Estimated Proceeds:'}</span>
                    <span className="font-bold">{formatCurrency(estimatedCost)}</span>
                </AlertDescription>
                <AlertDescription className="flex justify-between items-center mt-1">
                    <span>Buying Power:</span>
                    <span className="font-bold">{formatCurrency(parseFloat(account?.buying_power || '0'))}</span>
                </AlertDescription>
            </Alert>


            {error && <p className="text-sm text-destructive mt-4">{error}</p>}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="w-full capitalize">
                    {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Submit {action} Order
                </Button>
            </div>
        </form>
    );
}

export function InvestmentTradeForm({ holding, account, currentPrice, onTrade, defaultAction = 'buy' }: InvestmentTradeFormProps) {
    const [activeTab, setActiveTab] = useState(defaultAction);

    useEffect(() => {
        setActiveTab(defaultAction);
    }, [defaultAction]);

    return (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'buy' | 'sell')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell" disabled={!holding}>Sell</TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="pt-4">
                <TradeForm
                    action="buy"
                    holding={holding}
                    account={account}
                    currentPrice={currentPrice}
                    onSubmit={(quantity, price, type, tif) => onTrade('buy', quantity, price, type, tif)}
                />
            </TabsContent>
            <TabsContent value="sell" className="pt-4">
                <TradeForm
                    action="sell"
                    holding={holding}
                    account={account}
                    currentPrice={currentPrice}
                    onSubmit={(quantity, price, type, tif) => onTrade('sell', quantity, price, type, tif)}
                />
            </TabsContent>
        </Tabs>
    );
}
