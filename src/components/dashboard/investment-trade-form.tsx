
// src/components/dashboard/investment-trade-form.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Wallet, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { useAuth } from "@/hooks/use-auth";
import type { Account, Investment } from "@/lib/types";

interface InvestmentTradeFormProps {
  holding: Investment | null;
  accounts: Account[];
  currentPrice: number;
  onTrade: (action: 'buy' | 'sell', quantity: number, price: number, accountId?: string) => Promise<void>;
}

function TradeForm({
    action,
    holding,
    accounts,
    currentPrice,
    onSubmit
}: {
    action: 'buy' | 'sell';
    holding: Investment | null;
    accounts: Account[];
    currentPrice: number;
    onSubmit: (quantity: number, price: number, accountId?: string) => Promise<void>;
}) {
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [accountId, setAccountId] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { formatCurrency } = useAuth();
    
    useEffect(() => {
        setPrice(String(currentPrice.toFixed(2)));
    }, [currentPrice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const numQuantity = parseFloat(quantity);
        const numPrice = parseFloat(price);

        if (isNaN(numQuantity) || numQuantity <= 0 || isNaN(numPrice) || numPrice <= 0) {
            setError("Please enter valid numbers for quantity and price.");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(numQuantity, numPrice, accountId === 'none' ? undefined : accountId);
            // Parent component will handle success and navigation
        } catch (err: any) {
            setError(err.message || `Failed to ${action} shares.`);
            setLoading(false); // Stop loading on error to allow user to correct
        }
    };
    
    const maxSellQuantity = holding?.quantity || 0;
    const accountLabel = action === 'buy' ? 'Source Account (Optional)' : 'Destination Account';
    const accountPlaceholder = action === 'buy' ? 'Select a source account...' : 'Select a destination account...';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {action === 'sell' && (
                <Alert>
                    <AlertTitle>Available to Sell</AlertTitle>
                    <AlertDescription>You currently hold {maxSellQuantity} shares.</AlertDescription>
                </Alert>
            )}

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
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${action}-price`}>Price per Share ($)</Label>
                    <Input id={`${action}-price`} type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor={`${action}-account`}>{accountLabel}</Label>
                {accounts.length > 0 ? (
                    <Select value={accountId} onValueChange={setAccountId} required={action === 'sell'}>
                        <SelectTrigger id={`${action}-account`}>
                            <SelectValue placeholder={accountPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {action === 'buy' && <SelectItem value="none">Manual Entry (no account)</SelectItem>}
                            {accounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    <div className="flex justify-between w-full">
                                        <span>{acc.name} (...{acc.last4})</span>
                                        <span className="text-muted-foreground ml-2">{formatCurrency(acc.balance || 0)}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Alert>
                        <Wallet className="h-4 w-4" />
                        <AlertTitle>No Bank Account Linked</AlertTitle>
                        <AlertDescription>Connect an account to move funds.</AlertDescription>
                        <Button asChild variant="link" className="p-0 h-auto mt-2">
                            <Link href="/dashboard/link-account">
                                Link Account Now <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </Alert>
                )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="w-full capitalize">
                    {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {action} Shares
                </Button>
            </div>
        </form>
    );
}

export function InvestmentTradeForm({ holding, accounts, currentPrice, onTrade }: InvestmentTradeFormProps) {
    const defaultTab = holding ? 'buy' : 'buy'; // Default to buy, could be smarter

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell" disabled={!holding}>Sell</TabsTrigger>
            </TabsList>
            <TabsContent value="buy">
                <TradeForm
                    action="buy"
                    holding={holding}
                    accounts={accounts}
                    currentPrice={currentPrice}
                    onSubmit={(quantity, price, accountId) => onTrade('buy', quantity, price, accountId)}
                />
            </TabsContent>
            <TabsContent value="sell">
                <TradeForm
                    action="sell"
                    holding={holding}
                    accounts={accounts}
                    currentPrice={currentPrice}
                    onSubmit={(quantity, price, accountId) => onTrade('sell', quantity, price, accountId)}
                />
            </TabsContent>
        </Tabs>
    );
}
