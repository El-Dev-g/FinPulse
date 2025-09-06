// src/components/dashboard/edit-recurring-transaction-dialog.tsx
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

interface EditRecurringTransactionDialogProps {
  transaction: RecurringTransaction | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEditTransaction: (updatedTransaction: Omit<RecurringTransaction, 'Icon' | 'createdAt'>) => Promise<void>;
  onDeleteTransaction: (transactionId: string) => Promise<void>;
}

export function EditRecurringTransactionDialog({
  transaction,
  isOpen,
  onOpenChange,
  onEditTransaction,
  onDeleteTransaction,
}: EditRecurringTransactionDialogProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    async function fetchCategories() {
      if (user) {
        const dbCategories = (await getCategories()) as Category[];
        setAllCategories(dbCategories.filter(c => c.name !== 'Income'));
      }
    }
    fetchCategories();
  }, [user]);
  
  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(String(Math.abs(transaction.amount)));
      setCategory(transaction.category);
      setStartDate(transaction.startDate);
      setFrequency(transaction.frequency);
      setType(transaction.amount < 0 ? 'expense' : 'income');
    }
  }, [transaction]);


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
      if (transaction) {
        await onEditTransaction({
            id: transaction.id,
            description,
            amount: type === "expense" ? -transactionAmount : transactionAmount,
            category: type === "income" ? "Income" : category,
            startDate,
            frequency,
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError("Failed to update recurring transaction.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (transaction) {
      await onDeleteTransaction(transaction.id);
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Recurring Transaction</DialogTitle>
            <DialogDescription>
              Update the details of your automated transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup
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
                <RadioGroupItem value="expense" id="r1-recur-edit" />
                <Label htmlFor="r1-recur-edit">Expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="r2-recur-edit" />
                <Label htmlFor="r2-recur-edit">Income</Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="description-edit">Description</Label>
              <Input
                id="description-edit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount-edit">Amount</Label>
              <Input
                id="amount-edit"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {type === "expense" && (
              <div className="space-y-2">
                 <Label htmlFor="category-edit">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category-edit">
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
                <Label htmlFor="frequency-edit">Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                    <SelectTrigger id="frequency-edit">
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
                <Label htmlFor="startDate-edit">Start Date</Label>
                <Input
                    id="startDate-edit"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                </div>
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter className="justify-between">
             <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash className="mr-2" />
                Delete
              </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this recurring transaction.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
