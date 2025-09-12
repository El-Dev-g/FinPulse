
// src/app/dashboard/investments/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader, TrendingUp, MoreHorizontal, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Investment, ClientInvestment } from "@/lib/types";
import { getInvestments, addInvestment, updateInvestment, deleteInvestment } from "@/lib/db";
import { getStockData } from "@/lib/actions";
import { InvestmentHoldingsTable } from "@/components/dashboard/investment-holdings-table";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { AddInvestmentDialog } from "@/components/dashboard/add-investment-dialog";
import { EditInvestmentDialog } from "@/components/dashboard/edit-investment-dialog";
import { InvestmentPerformanceChart } from "@/components/dashboard/investment-performance-chart";
import { Alert, AlertTitle, AlertDescription as AlertDescriptionComponent } from "@/components/ui/alert";


export default function InvestmentsPage() {
  const { user, formatCurrency } = useAuth();
  const [investments, setInvestments] = useState<ClientInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<ClientInvestment | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddInvestment = async (investment: Omit<Investment, "id" | "createdAt">) => {
    await addInvestment(investment);
    fetchData();
  };

  const handleEditInvestment = async (id: string, investment: Partial<Investment>) => {
    await updateInvestment(id, investment);
    fetchData();
  };

  const handleDeleteInvestment = async (id: string) => {
    await deleteInvestment(id);
    fetchData();
  };


  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Investment Portfolio
            </h2>
            <p className="text-muted-foreground">
              Track and manage your investment holdings.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2" />
              Add Holding
            </Button>
          </div>
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
             <Card className="text-center py-20">
                <CardHeader>
                    <CardTitle>Your Portfolio is Empty</CardTitle>
                    <CardDescription>
                        Add your first holding to start tracking your investments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="mr-2" />
                        Add Investment
                    </Button>
                </CardContent>
             </Card>
        ) : (
            <div className="space-y-8">
                <PortfolioSummary investments={investments} />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                         <InvestmentHoldingsTable 
                            investments={investments} 
                            onEdit={setEditingInvestment}
                        />
                    </div>
                    <div className="xl:col-span-1">
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
      <EditInvestmentDialog
        investment={editingInvestment}
        isOpen={!!editingInvestment}
        onOpenChange={() => setEditingInvestment(null)}
        onEditInvestment={handleEditInvestment}
        onDeleteInvestment={handleDeleteInvestment}
      />
    </main>
  );
}

