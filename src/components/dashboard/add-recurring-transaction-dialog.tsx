// src/components/dashboard/add-recurring-transaction-dialog.tsx
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
import { Loader } from "lucide-react";
import type { RecurringTransaction, RecurringFrequency, Category } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { getCategories } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";

interface AddRecurringTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTransaction: (newTransaction: Omit<RecurringTransaction, "id" | "Icon" | "createdAt">) => Promise<void>;
}

export function AddRecurringTransactionDialog({
  isOpen,
  onOpenChange,
  onAddTransaction,
}: AddRecurringTransactionDialogProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    async function fetchCategories() {
      if (user) {
        const dbCategories = (await getCategories()) as Category[];
        setAllCategories(dbCategories.filter(c => c.name !== 'Income'));
      }
    }
    fetchCategories();
  }, [user]);

  const resetForm = useCallback(() => {
    setDescription("");
    setAmount("");
    setCategory("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setType("expense");
    setFrequency("monthly");
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description || !amount || !startDate || (type === "expense" && !category)) {
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
        startDate,
        frequency,
      });
      onOpenChange(false);
    } catch (err) {
      setError("Failed to add recurring transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Recurring Transaction</DialogTitle>
            <DialogDescription>
              Set up automated transactions for your regular bills and income.
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
                <RadioGroupItem value="expense" id="r1-recur" />
                <Label htmlFor="r1-recur">Expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="r2-recur" />
                <Label htmlFor="r2-recur">Income</Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Spotify Subscription"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 10.99"
              />
            </div>

            {type === "expense" && (
              <div className="space-y-2">
                 <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                </div>
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
