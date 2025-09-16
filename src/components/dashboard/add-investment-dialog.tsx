
// src/components/dashboard/add-investment-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, ArrowRight, Wallet } from "lucide-react";
import type { Investment, Account } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { useAuth } from "@/hooks/use-auth";

interface AddInvestmentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddInvestment: (newInvestment: Omit<Investment, "id" | "createdAt">, accountId?: string) => Promise<void>;
  accounts: Account[];
}

export function AddInvestmentDialog({ isOpen, onOpenChange, onAddInvestment, accounts }: AddInvestmentDialogProps) {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [accountId, setAccountId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formatCurrency } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!symbol || !quantity || !purchasePrice) {
      setError("Please fill out all fields.");
      return;
    }

    const numQuantity = parseFloat(quantity);
    const numPurchasePrice = parseFloat(purchasePrice);

    if (isNaN(numQuantity) || numQuantity <= 0 || isNaN(numPurchasePrice) || numPurchasePrice <= 0) {
      setError("Please enter valid numbers for quantity and price.");
      return;
    }
    
    if (accountId === "none") {
      setAccountId(undefined);
    }

    setLoading(true);

    try {
      await onAddInvestment({
        symbol: symbol.toUpperCase(),
        quantity: numQuantity,
        purchasePrice: numPurchasePrice,
      }, accountId);
      
      onOpenChange(false);
      setSymbol("");
      setQuantity("");
      setPurchasePrice("");
      setAccountId(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to add investment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setSymbol("");
        setQuantity("");
        setPurchasePrice("");
        setAccountId(undefined);
        setError(null);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Investment</DialogTitle>
            <DialogDescription>
              Enter the details of your investment holding.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g., AAPL, GOOGL"
                className="uppercase"
                autoCapitalize="characters"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="e.g., 150.25"
                />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="sourceAccount">Source Account (Optional)</Label>
                {accounts.length > 0 ? (
                    <Select value={accountId} onValueChange={setAccountId}>
                        <SelectTrigger id="sourceAccount">
                            <SelectValue placeholder="Select an account..." />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="none">Manual Entry (no account)</SelectItem>
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
                            Connect an account to automatically deduct funds.
                        </AlertDescription>
                         <Button asChild variant="link" className="p-0 h-auto mt-2">
                            <Link href="/dashboard/link-account">
                                Link Account Now <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </Alert>
                )}
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Add Holding
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
