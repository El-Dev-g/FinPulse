// src/app/dashboard/investments/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader, TrendingUp, Search, X, ShoppingCart, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { ClientInvestment, AlpacaAccount, Position } from "@/lib/types";
import { getPortfolio } from "@/lib/actions";
import { InvestmentHoldingsTable } from "@/components/dashboard/investment-holdings-table";
import { Input } from "@/components/ui/input";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { InvestmentPerformanceChart } from "@/components/dashboard/investment-performance-chart";
import BrokerErrorBanner from '@/components/dashboard/broker-error-banner';

export default function InvestmentsPage() {
  const { user, isPro } = useAuth();
  const router = useRouter();
  const [investments, setInvestments] = useState<ClientInvestment[]>([]);
  const [account, setAccount] = useState<AlpacaAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    if (!user || !isPro) {
      setLoading(false);
      return;
    };
    setLoading(true);
    setError(null);
    try {
      const result = await getPortfolio();
      if (result.error || !result.data) {
        setError(result.error || "Could not load portfolio data.");
        setInvestments([]);
        setAccount(null);
      } else {
        const { portfolio: fetchedPortfolio, account: fetchedAccount } = result.data;
        const processedPortfolio = (fetchedPortfolio || []).map((pos: Position) => ({
            ...pos,
            id: pos.asset_id, // Use asset_id as the unique key, as id is not guaranteed
            logoUrl: `https://c-alpha.imgix.net/logos/${pos.symbol}.svg`,
            name: pos.name || pos.symbol, // Fallback to symbol if name is not present
            currentValue: parseFloat(pos.market_value),
        }));

        setInvestments(processedPortfolio);
        setAccount(fetchedAccount || null);
      }
    } catch (e: any) {
      console.error("Error fetching portfolio:", e);
       setError(e.message || "An unexpected error occurred. Please ensure your Alpaca API keys are correctly set in the .env file.");
    } finally {
      setLoading(false);
    }
  }, [user, isPro]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredInvestments = useMemo(() => {
    if (!investments) return [];
    return investments.filter(inv => 
      inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [investments, searchTerm]);


  if (!isPro) {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="w-full">
                 <Card className="mt-8 text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 font-headline">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Unlock Your Investment Portfolio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                        This is a Pro feature. Connect to a brokerage, track your stock portfolio, analyze performance, and execute trades.
                        </p>
                        <Button onClick={() => router.push('/dashboard/billing')}>Upgrade to Pro</Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
  }

  if (loading) {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
            <Loader className="h-12 w-12 animate-spin text-primary" />
        </main>
    )
  }
  
  return (
    <>
    <main className="flex-1 flex flex-col">
        <div className="flex-grow p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-40">
            <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight font-headline">
                        Investment Portfolio
                        </h2>
                        <p className="text-muted-foreground">Track and manage your stock holdings via Alpaca.</p>
                    </div>
                </div>

                {error ? (
                    <BrokerErrorBanner error={error} />
                ) : investments.length === 0 && !loading ? (
                    <div className="text-center py-20">
                        <h3 className="text-lg font-semibold">Your Portfolio is Empty</h3>
                        <p className="text-muted-foreground mt-2">
                            Buy your first stock to start tracking your investments.
                        </p>
                        <Button onClick={() => router.push(`/dashboard/investments/trade?action=buy`)} className="mt-6">
                            <Plus className="mr-2" />
                            Make a Trade
                        </Button>
                    </div>
                ) : (
                  <div className="space-y-6">
                      <PortfolioSummary investments={investments} account={account} />
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
        </div>

        {!loading && !error && (
            <div className="sticky bottom-0 mt-auto bg-background/80 backdrop-blur-sm border-t p-4">
                 <Button className="w-full h-14 text-base flex-grow max-w-lg mx-auto" onClick={() => router.push(`/dashboard/investments/trade`)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Trade
                </Button>
            </div>
        )}
    </main>
    </>
  );
}
