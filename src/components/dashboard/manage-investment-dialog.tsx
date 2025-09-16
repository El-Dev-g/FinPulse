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
import { Loader } from "lucide-react";
import type { ClientInvestment } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ManageInvestmentDialogProps {
  investment: ClientInvestment | null;
  isOpen: boolean;
  onOpenChange: () => void;
  onBuy: (investment: ClientInvestment, quantity: number, price: number) => Promise<void>;
  onSell: (investment: ClientInvestment, quantity: number, price: number) => Promise<void>;
}

function BuySellForm({
    investment,
    action,
    onSubmit,
}: {
    investment: ClientInvestment;
    action: "buy" | "sell";
    onSubmit: (quantity: number, price: number) => void;
}) {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

    setLoading(true);
    try {
      await onSubmit(numQuantity, numPrice);
    } catch (err) {
      setError(`Failed to ${action} shares.`);
    } finally {
      setLoading(false);
    }
  };

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
}: ManageInvestmentDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage {investment?.symbol} Holding</DialogTitle>
            <DialogDescription>
              Buy or sell shares for this position. Current holding: {investment?.quantity} shares.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="buy">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>
            <TabsContent value="buy">
                {investment && <BuySellForm investment={investment} action="buy" onSubmit={(quantity, price) => onBuy(investment, quantity, price)} />}
            </TabsContent>
            <TabsContent value="sell">
                {investment && <BuySellForm investment={investment} action="sell" onSubmit={(quantity, price) => onSell(investment, quantity, price)} />}
            </TabsContent>
          </Tabs>
      </DialogContent>
    </Dialog>
  );
}
