// src/components/dashboard/add-budget-dialog.tsx
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
import type { Budget } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface AddBudgetDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddBudget: (newBudget: Omit<Budget, "id" | "createdAt">) => Promise<void>;
  existingCategories: string[];
}

export function AddBudgetDialog({
  isOpen,
  onOpenChange,
  onAddBudget,
  existingCategories,
}: AddBudgetDialogProps) {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = [
    "Groceries",
    "Dining Out",
    "Transport",
    "Shopping",
    "Housing",
    "Entertainment",
    "Health",
    "Other",
  ].filter(cat => !existingCategories.includes(cat));


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category || !limit) {
      setError("Please select a category and set a limit.");
      return;
    }

    const limitAmount = parseFloat(limit);
    if (isNaN(limitAmount) || limitAmount <= 0) {
      setError("Please enter a valid limit amount.");
      return;
    }

    setLoading(true);

    try {
        await onAddBudget({ category, limit: limitAmount });
        onOpenChange(false);
        setCategory("");
        setLimit("");
    } catch (err) {
        setError("Failed to add budget. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setCategory("");
        setLimit("");
        setError(null);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Budget</DialogTitle>
            <DialogDescription>
              Set a spending limit for a category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category
              </Label>
               <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">
                Monthly Limit
              </Label>
              <Input
                id="limit"
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="e.g., 500"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Add Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
