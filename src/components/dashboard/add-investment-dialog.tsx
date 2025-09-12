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
import { Loader } from "lucide-react";
import type { Investment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface AddInvestmentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddInvestment: (newInvestment: Omit<Investment, "id" | "createdAt">) => Promise<void>;
}

export function AddInvestmentDialog({ isOpen, onOpenChange, onAddInvestment }: AddInvestmentDialogProps) {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

    setLoading(true);

    try {
      await onAddInvestment({
        symbol: symbol.toUpperCase(),
        quantity: numQuantity,
        purchasePrice: numPurchasePrice,
      });
      toast({
        title: "Investment Added",
        description: `${numQuantity} shares of ${symbol.toUpperCase()} have been added to your portfolio.`,
      });
      onOpenChange(false);
      setSymbol("");
      setQuantity("");
      setPurchasePrice("");
    } catch (err) {
      setError("Failed to add investment. Please try again.");
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
