// src/components/dashboard/edit-investment-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Trash } from "lucide-react";
import type { ClientInvestment, Investment } from "@/lib/types";

interface EditInvestmentDialogProps {
  investment: ClientInvestment | null;
  isOpen: boolean;
  onOpenChange: () => void;
  onEditInvestment: (id: string, updatedData: Partial<Investment>) => Promise<void>;
}

export function EditInvestmentDialog({
  investment,
  isOpen,
  onOpenChange,
  onEditInvestment,
}: EditInvestmentDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (investment) {
      setQuantity(String(investment.quantity));
      setPurchasePrice(String(investment.purchasePrice));
    }
  }, [investment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investment) return;
    
    setError(null);
    const numQuantity = parseFloat(quantity);
    const numPurchasePrice = parseFloat(purchasePrice);

    if (isNaN(numQuantity) || numQuantity <= 0 || isNaN(numPurchasePrice) || numPurchasePrice <= 0) {
      setError("Please enter valid numbers for quantity and price.");
      return;
    }

    setLoading(true);

    try {
      await onEditInvestment(investment.id, { 
        quantity: numQuantity,
        purchasePrice: numPurchasePrice,
      });
      onOpenChange();
    } catch (err) {
      setError("Failed to update investment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          onOpenChange();
          setError(null);
          setLoading(false);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit {investment?.symbol} Holding</DialogTitle>
              <DialogDescription>
                Update the details of your investment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="symbol-edit">Stock Symbol</Label>
                <Input id="symbol-edit" value={investment?.symbol || ''} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="quantity-edit">Quantity</Label>
                    <Input
                    id="quantity-edit"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="purchasePrice-edit">Average Cost ($)</Label>
                    <Input
                    id="purchasePrice-edit"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <DialogFooter className="justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
