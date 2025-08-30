// src/components/dashboard/add-budget-dialog.tsx
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Plus } from "lucide-react";
import type { Budget, Category } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getCategories, addCategory } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import { AddCategoryDialog } from "./add-category-dialog";

interface AddBudgetDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddBudget: (newBudget: Omit<Budget, "id" | "createdAt">) => Promise<void>;
  isSubmitting?: boolean;
  existingCategories: string[];
}

export function AddBudgetDialog({
  isOpen,
  onOpenChange,
  onAddBudget,
  isSubmitting = false,
  existingCategories,
}: AddBudgetDialogProps) {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const fetchCategories = async () => {
    if (user && isOpen) {
      const allCategories = (await getCategories()) as Category[];
      const filtered = allCategories.filter(
        (c) => !existingCategories.includes(c.name) && c.name !== "Income"
      );
      setAvailableCategories(filtered);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user, isOpen, existingCategories]);


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
  
  const handleAddCategory = async (name: string) => {
    await addCategory({ name });
    await fetchCategories(); // Refetch categories
    setCategory(name); // Select the newly added category
  };

  return (
    <>
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
              <div className="flex gap-2">
               <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setIsAddCategoryOpen(true)}>
                    <Plus className="h-4 w-4" />
                </Button>
               </div>
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
            <Button type="submit" disabled={loading || isSubmitting}>
              {(loading || isSubmitting) && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Add Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <AddCategoryDialog 
        isOpen={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onAddCategory={handleAddCategory}
    />
    </>
  );
}
