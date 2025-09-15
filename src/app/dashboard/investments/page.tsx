// src/app/dashboard/investments/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
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
import { Plus, Loader, TrendingUp, MoreHorizontal, FileText, Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Investment, ClientInvestment } from "@/lib/types";
import { getInvestments, addInvestment, updateInvestment, deleteInvestment } from "@/lib/db";
import { getStockData } from "@/lib/actions";
import { InvestmentHoldingsTable } from "@/components/dashboard/investment-holdings-table";
import { AddInvestmentDialog } from "@/components/dashboard/add-investment-dialog";
import { EditInvestmentDialog } from "@/components/dashboard/edit-investment-dialog";
import { Alert, AlertTitle, AlertDescription as AlertDescriptionComponent } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function InvestmentsPage() {
  const { user, isPro } = useAuth();
  const [investments, setInvestments] = useState<ClientInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<ClientInvestment | null>(null);
  const [deletingInvestment, setDeletingInvestment] = useState<ClientInvestment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const dbInvestments = (await getInvestments()) as Investment[];
      if (dbInvestments.length === 0) {
        setInvestments([]);
        setLoading(false);
        return;
      }

      const symbols = dbInvestments.map(inv => inv.symbol);
      const stockData = await getStockData(symbols);
      
      const clientInvestments = dbInvestments.map(inv => {
        const data = stockData.find(d => d.symbol === inv.symbol);
        const currentPrice = data?.price || inv.purchasePrice;
        const currentValue = currentPrice * inv.quantity;
        const totalCost = inv.purchasePrice * inv.quantity;
        const gainLoss = currentValue - totalCost;
        const gainLossPercentage = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

        return {
          ...inv,
          id: inv.id!,
          currentPrice,
          currentValue,
          gainLoss,
          gainLossPercentage,
          logoUrl: data?.logo,
          createdAt: inv.createdAt.toDate(),
        };
      });

      setInvestments(clientInvestments);

    } catch (e: any) {
      console.error("Error fetching investments:", e);
      setError("Could not fetch real-time stock data. Prices may not be current. Please ensure your API key is configured correctly in .env");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredInvestments = useMemo(() => {
    return investments.filter(inv => 
      inv.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [investments, searchTerm]);


  const handleAddInvestment = async (investment: Omit<Investment, "id" | "createdAt">) => {
    await addInvestment(investment);
    fetchData();
  };

  const handleEditInvestment = async (id: string, investment: Partial<Investment>) => {
    await updateInvestment(id, investment);
    fetchData();
  };

  const handleDeleteInvestment = async () => {
    if (!deletingInvestment) return;
    await deleteInvestment(deletingInvestment.id);
    setDeletingInvestment(null);
    fetchData();
  };

  if (!isPro) {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                 <Card className="mt-8 text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 font-headline">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Unlock Your Investment Portfolio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                        This is a Pro feature. Upgrade your plan to track your stock portfolio, analyze performance, and more.
                        </p>
                        <Button>Upgrade to Pro</Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
  }


  return (
    <>
    <div className="relative min-h-[calc(100vh-4rem)] md:min-h-0">
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight font-headline">
              Invest
            </h2>
             <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search stocks" 
            className="pl-10 h-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button 
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              className={cn("shrink-0", activeFilter === 'all' && 'bg-primary text-primary-foreground')}
              onClick={() => setActiveFilter('all')}
            >
              The Moneystart Portfolio
            </Button>
            <Button 
              variant={activeFilter === 'motorsport' ? 'default' : 'outline'}
              className="shrink-0"
              onClick={() => setActiveFilter('motorsport')}
            >
              Motorsport: Formula One
            </Button>
        </div>


        {error && (
             <Alert variant="destructive" className="mb-6">
                <FileText className="h-4 w-4" />
                <AlertTitle>Data Fetching Error</AlertTitle>
                <AlertDescriptionComponent>
                    {error} <a href="https://site.financialmodelingprep.com/developer/docs" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Get a free API key</a>.
                </AlertDescriptionComponent>
             </Alert>
        )}

        {loading ? (
            <div className="flex justify-center items-center h-96">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : investments.length === 0 ? (
             <div className="text-center py-20">
                <h3 className="text-lg font-semibold">Your Portfolio is Empty</h3>
                <p className="text-muted-foreground mt-2">
                    Add your first holding to start tracking your investments.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="mt-6">
                    <Plus className="mr-2" />
                    Add Investment
                </Button>
             </div>
        ) : (
             <InvestmentHoldingsTable 
                investments={filteredInvestments} 
                onEdit={setEditingInvestment}
                onDelete={setDeletingInvestment}
            />
        )}
      </div>

       <AddInvestmentDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddInvestment={handleAddInvestment}
      />
      <EditInvestmentDialog
        investment={editingInvestment}
        isOpen={!!editingInvestment}
        onOpenChange={() => setEditingInvestment(null)}
        onEditInvestment={handleEditInvestment}
        onDeleteInvestment={handleDeleteInvestment}
      />
    </main>
    <div className="sticky bottom-6 flex justify-center">
        <div className="bg-foreground text-background rounded-full shadow-lg flex items-center p-1">
            <Button variant="ghost" className="rounded-full gap-2 text-background hover:bg-background/20 hover:text-background">
                <ArrowUpDown className="h-4 w-4" />
                Sort
            </Button>
            <Button variant="ghost" className="rounded-full gap-2 text-background hover:bg-background/20 hover:text-background">
                <SlidersHorizontal className="h-4 w-4" />
                Filter
            </Button>
        </div>
      </div>
    </div>
    <AlertDialog open={!!deletingInvestment} onOpenChange={() => setDeletingInvestment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your holding for {deletingInvestment?.symbol}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvestment} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
