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
import { Plus, Loader, TrendingUp, FileText, Search, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Investment, ClientInvestment, Transaction } from "@/lib/types";
import { getInvestments, addInvestment, updateInvestment, deleteInvestment, addTransaction } from "@/lib/db";
import { getStockData } from "@/lib/actions";
import { InvestmentHoldingsTable } from "@/components/dashboard/investment-holdings-table";
import { AddInvestmentDialog } from "@/components/dashboard/add-investment-dialog";
import { ManageInvestmentDialog } from "@/components/dashboard/manage-investment-dialog";
import { Alert, AlertTitle, AlertDescription as AlertDescriptionComponent } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { InvestmentPerformanceChart } from "@/components/dashboard/investment-performance-chart";
import { useToast } from "@/hooks/use-toast";

export default function InvestmentsPage() {
  const { user, isPro } = useAuth();
  const [investments, setInvestments] = useState<ClientInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [managingInvestment, setManagingInvestment] = useState<ClientInvestment | null>(null);
  const [deletingInvestment, setDeletingInvestment] = useState<ClientInvestment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

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
          name: data?.name || inv.symbol,
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
      inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [investments, searchTerm]);


  const handleAddInvestment = async (investment: Omit<Investment, "id" | "createdAt">) => {
    // 1. Add the holding
    await addInvestment(investment);

    // 2. Add a corresponding transaction
    const cost = investment.quantity * investment.purchasePrice;
    await addTransaction({
        description: `Buy ${investment.quantity} shares of ${investment.symbol}`,
        amount: -cost,
        category: "Investments",
        date: new Date().toISOString().split('T')[0],
        source: 'manual',
    });

    toast({
      title: "Investment Added",
      description: `${investment.quantity} shares of ${investment.symbol.toUpperCase()} added.`,
    });
    fetchData();
  };

  const handleDeleteInvestment = async () => {
    if (!deletingInvestment) return;
    await deleteInvestment(deletingInvestment.id);
    setDeletingInvestment(null);
    toast({
        title: "Holding Sold",
        description: `All shares of ${deletingInvestment.symbol} have been removed from your portfolio.`,
    });
    fetchData();
  };
  
  const handleBuyShares = async (investment: ClientInvestment, quantity: number, price: number) => {
    const totalShares = investment.quantity + quantity;
    const totalCost = (investment.purchasePrice * investment.quantity) + (price * quantity);
    const newAveragePrice = totalCost / totalShares;
    
    // 1. Update the holding
    await updateInvestment(investment.id, {
        quantity: totalShares,
        purchasePrice: newAveragePrice
    });

    // 2. Add transaction
    await addTransaction({
        description: `Buy ${quantity} shares of ${investment.symbol}`,
        amount: -(quantity * price),
        category: "Investments",
        date: new Date().toISOString().split('T')[0],
        source: 'manual',
    });
    
    toast({
        title: "Shares Purchased",
        description: `Bought ${quantity} shares of ${investment.symbol}.`,
    });
    fetchData();
  };
  
  const handleSellShares = async (investment: ClientInvestment, quantity: number, price: number) => {
    if (quantity > investment.quantity) {
        toast({ variant: 'destructive', title: "Error", description: "Cannot sell more shares than you own."});
        return;
    }

    const proceeds = quantity * price;

    if (quantity === investment.quantity) {
        // Selling all shares, delete the holding
        await deleteInvestment(investment.id);
    } else {
        // Selling partial shares, update quantity
        // Average cost basis does not change on sale
        await updateInvestment(investment.id, {
            quantity: investment.quantity - quantity,
        });
    }

    // Add income transaction
    await addTransaction({
        description: `Sell ${quantity} shares of ${investment.symbol}`,
        amount: proceeds,
        category: "Investments",
        date: new Date().toISOString().split('T')[0],
        source: 'manual',
    });

    toast({
        title: "Shares Sold",
        description: `Sold ${quantity} shares of ${investment.symbol}.`,
    });
    fetchData();
  }


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
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">
                Investment Portfolio
                </h2>
                <p className="text-muted-foreground">Track and manage your stock holdings.</p>
            </div>
             <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Holding
            </Button>
        </div>

        {error && (
             <Alert variant="destructive" className="mb-6">
                <FileText className="h-4 w-4" />
                <AlertTitle>Data Fetching Error</AlertTitle>
                <AlertDescriptionComponent>
                    {error}. You can get a free key from the Alpha Vantage website.
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
            <div className="space-y-6">
                <PortfolioSummary investments={investments} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                         <Card>
                            <CardHeader>
                                <CardTitle>Holdings</CardTitle>
                                <CardDescription>Your current investment positions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative mb-4">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="Search holdings..." 
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                  />
                                  {searchTerm && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                      onClick={() => setSearchTerm('')}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <InvestmentHoldingsTable 
                                    investments={filteredInvestments} 
                                    onEdit={setManagingInvestment}
                                    onDelete={setDeletingInvestment}
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <InvestmentPerformanceChart investments={investments} />
                    </div>
                </div>
            </div>
        )}
      </div>

       <AddInvestmentDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddInvestment={handleAddInvestment}
      />
      <ManageInvestmentDialog
        investment={managingInvestment}
        isOpen={!!managingInvestment}
        onOpenChange={() => setManagingInvestment(null)}
        onBuy={handleBuyShares}
        onSell={handleSellShares}
      />
    </main>
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
