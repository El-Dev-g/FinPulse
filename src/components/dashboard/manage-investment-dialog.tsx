
// src/components/dashboard/manage-investment-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Wallet, ArrowRight } from "lucide-react";
import type { ClientInvestment, Account } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import Link from "next/link";

interface ManageInvestmentDialogProps {
  investment: ClientInvestment | null;
  isOpen: boolean;
  onOpenChange: () => void;
  onBuy: (investment: ClientInvestment, quantity: number, price: number, accountId?: string) => Promise<void>;
  onSell: (investment: ClientInvestment, quantity: number, price: number, accountId?: string) => Promise<void>;
  accounts: Account[];
  defaultTab?: 'buy' | 'sell';
}

function BuySellForm({
    investment,
    action,
    accounts,
    onSubmit,
    onDone,
}: {
    investment: ClientInvestment;
    action: "buy" | "sell";
    accounts: Account[];
    onSubmit: (quantity: number, price: number, accountId?: string) => Promise<void>;
    onDone: () => void;
}) {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [accountId, setAccountId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formatCurrency } = useAuth();
  
  useEffect(() => {
    // Set default price to current market price
    if (investment?.currentPrice) {
        setPrice(String(investment.currentPrice.toFixed(2)));
    }
  }, [investment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);

    if (isNaN(numQuantity) || numQuantity <= 0 || isNaN(numPrice) || numPrice <= 0) {
      setError("Please enter valid numbers for quantity and price.");
      return;
    }
    
    if (action === 'sell' && !accountId) {
      setError("Please select an account to deposit the funds.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(numQuantity, numPrice, accountId === 'none' ? undefined : accountId);
      onDone(); // Close dialog on success
    } catch (err: any) {
      setError(err.message || `Failed to ${action} shares.`);
    } finally {
      setLoading(false);
    }
  };

  const accountLabel = action === 'buy' ? 'Source Account (Optional)' : 'Destination Account';
  const accountPlaceholder = action === 'buy' ? 'Select a source account...' : 'Select a destination account...';

  return (
     <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`${action}-quantity`}>Quantity</Label>
                    <Input id={`${action}-quantity`} type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${action}-price`}>Price per Share ($)</Label>
                    <Input id={`${action}-price`} type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor={`${action}-sourceAccount`}>{accountLabel}</Label>
                {accounts.length > 0 ? (
                    <Select value={accountId} onValueChange={setAccountId}>
                        <SelectTrigger id={`${action}-sourceAccount`}>
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
                        <AlertDescription>
                            Connect an account to move funds.
                        </AlertDescription>
                         <Button asChild variant="link" className="p-0 h-auto mt-2">
                            <Link href="/dashboard/link-account">
                                Link Account Now <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </Alert>
                )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} className="capitalize">
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {action} Shares
            </Button>
        </div>
     </form>
  )
}

export function ManageInvestmentDialog({
  investment,
  isOpen,
  onOpenChange,
  onBuy,
  onSell,
  accounts,
  defaultTab = 'buy',
}: ManageInvestmentDialogProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
        if(isOpen) {
            setActiveTab(defaultTab);
        }
    }, [isOpen, defaultTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage {investment?.symbol} Holding</DialogTitle>
            <DialogDescription>
              Current holding: {investment?.quantity} shares.
            </DialogDescription>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'buy' | 'sell')}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>
            <TabsContent value="buy">
                {investment && <BuySellForm investment={investment} action="buy" accounts={accounts} onSubmit={(q,p,id) => onBuy(investment, q, p, id)} onDone={onOpenChange} />}
            </TabsContent>
            <TabsContent value="sell">
                {investment && <BuySellForm investment={investment} action="sell" accounts={accounts} onSubmit={(q,p,id) => onSell(investment, q, p, id)} onDone={onOpenChange} />}
            </TabsContent>
          </Tabs>
      </DialogContent>
    </Dialog>
  );
}
