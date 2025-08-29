// src/app/dashboard/catalog/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Plus, Trash2, ListTree } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Category } from "@/lib/types";
import { getCategories, addCategory, deleteCategory } from "@/lib/db";
import { getIconForCategory } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const dbCategories = (await getCategories()) as Category[];
      setCategories(dbCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsAdding(true);
    try {
      await addCategory({ name: newCategoryName.trim() });
      setNewCategoryName("");
      fetchData();
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id);
      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setDeletingCategory(null);
    }
  };


  return (
    <>
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <ListTree className="h-8 w-8" />
              Category Manager
            </h2>
            <p className="text-muted-foreground">
              Add, edit, or remove your spending categories.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add a New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="flex gap-4">
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Subscriptions"
                  disabled={isAdding}
                />
                <Button type="submit" disabled={isAdding || !newCategoryName.trim()}>
                  {isAdding ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2" />}
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Your Categories</CardTitle>
                <CardDescription>The default 'Income' category cannot be deleted.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.length > 0 ? (
                    categories.map((cat) => {
                      const Icon = getIconForCategory(cat.name);
                      return (
                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
                          <div className="flex items-center gap-3">
                              <div className="bg-muted p-2 rounded-md">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <span className="font-medium">{cat.name}</span>
                          </div>
                          {cat.name !== "Income" ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeletingCategory(cat)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          ) : (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-10">
                      <p>You haven't added any custom categories yet.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
       <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(isOpen) => !isOpen && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Deleting this category will not delete existing transactions, but they will no longer be associated with this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, delete category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}