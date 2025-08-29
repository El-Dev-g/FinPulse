// src/components/dashboard/add-transaction-dialog.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Loader, Sparkles } from "lucide-react";
import type { Transaction } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { categorizeTransactionAction } from "@/lib/actions";
import { useDebounce } from "@/hooks/use-debounce";

interface AddTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTransaction: (newTransaction: Omit<Transaction, "id" | "Icon" | "createdAt">) => Promise<void>;
  categories: string[];
}

export function AddTransactionDialog({
  isOpen,
  onOpenChange,
  onAddTransaction,
  categories,
}: AddTransactionDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);

  const debouncedDescription = useDebounce(description, 500);

  const getCategorySuggestion = useCallback(async (description: string) => {
    if (description.length < 5 || type !== 'expense') return;

    setIsCategorizing(true);
    try {
      const result = await categorizeTransactionAction({ description, categories });
      if (result.success && result.category && categories.includes(result.category)) {
        setCategory(result.category);
      }
    } catch (error) {
      console.error("Failed to get category suggestion:", error);
    } finally {
      setIsCategorizing(false);
    }
  }, [categories, type]);

  useEffect(() => {
    if (debouncedDescription) {
      getCategorySuggestion(debouncedDescription);
    }
  }, [debouncedDescription, getCategorySuggestion]);
  
  const resetForm = useCallback(() => {
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("expense");
    setError(null);
    setLoading(false);
    setIsCategorizing(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description || !amount || !date || (type === "expense" && !category)) {
      setError("Please fill out all fields.");
      return;
    }

    const transactionAmount = parseFloat(amount);
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    try {
      await onAddTransaction({
        description,
        amount: type === "expense" ? -transactionAmount : transactionAmount,
        category: type === "income" ? "Income" : category,
        date,
      });
      onOpenChange(false);
    } catch (err) {
        setError("Failed to add transaction. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Enter the details of your transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup
              defaultValue="expense"
              value={type}
              onValueChange={(value) => {
                const newType = value as "expense" | "income";
                setType(newType);
                if (newType === 'income') {
                  setCategory('Income');
                } else {
                  setCategory('');
                }
              }}
              className="flex"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="r1" />
                <Label htmlFor="r1">Expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="r2" />
                <Label htmlFor="r2">Income</Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Coffee with friends"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 15.50"
              />
            </div>

            {type === "expense" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Category</Label>
                   {isCategorizing && (
                     <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 animate-pulse" /> AI Suggesting...
                     </span>
                   )}
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Add Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
