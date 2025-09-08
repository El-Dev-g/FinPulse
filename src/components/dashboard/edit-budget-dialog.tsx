// src/components/dashboard/edit-budget-dialog.tsx
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
import type { Budget, ClientBudget } from "@/lib/types";

interface EditBudgetDialogProps {
  budget: ClientBudget | null;
  isOpen: boolean;
  onOpenChange: (budget: ClientBudget | null) => void;
  onEditBudget: (id: string, updatedData: Partial<Omit<Budget, "id" | "createdAt">>) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
}

export function EditBudgetDialog({
  budget,
  isOpen,
  onOpenChange,
  onEditBudget,
  onDeleteBudget,
}: EditBudgetDialogProps) {
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (budget) {
      setLimit(String(budget.limit));
    }
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget) return;
    
    setError(null);

    const limitAmount = parseFloat(limit);
    if (isNaN(limitAmount) || limitAmount <= 0) {
      setError("Please enter a valid limit amount.");
      return;
    }

    setLoading(true);

    try {
      await onEditBudget(budget.id, { limit: limitAmount });
      onOpenChange(null);
    } catch (err) {
      setError("Failed to update budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (budget) {
      setLoading(true);
      try {
        await onDeleteBudget(budget.id);
        setIsDeleteDialogOpen(false);
        onOpenChange(null);
      } catch (err) {
        setError("Failed to delete budget.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          onOpenChange(null);
          setError(null);
          setLoading(false);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit '{budget?.category}' Budget</DialogTitle>
              <DialogDescription>
                Update the spending limit for this category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-edit">Category</Label>
                <Input id="category-edit" value={budget?.category || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit-edit">Monthly Limit</Label>
                <Input
                  id="limit-edit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="e.g., 500"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <DialogFooter className="justify-between">
              <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={loading}>
                <Trash className="mr-2 h-4 w-4" />
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
              This action cannot be undone. This will permanently delete the '{budget?.category}' budget.
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
