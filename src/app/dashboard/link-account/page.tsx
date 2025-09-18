// src/app/dashboard/link-account/page.tsx
"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Landmark, Loader, MoreVertical, Wallet, Trash2, Copy, Check, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Account } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAccounts, deleteAccount } from '@/lib/db';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Continents = "Africa" | "Asia" | "Europe" | "North America" | "South America";
const continents: Continents[] = ["Africa", "Asia", "Europe", "North America", "South America"];


function AccountDetailsRow({ label, value, onCopy }: { label: string; value: string, onCopy: () => void }) {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        onCopy();
        setTimeout(() => setCopied(false), 2000);
    }
    
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono">{value}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}

function LinkAccountPageContent() {
    const [loading, setLoading] = useState(true);
    const [connectedAccounts, setConnectedAccounts] = useState<Account[]>([]);
    const [isUnlinking, setIsUnlinking] = useState<Account | null>(null);
    const [selectedContinent, setSelectedContinent] = useState<Continents | "">("");

    const { user, formatCurrency } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const fetchAccounts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const accountsFromDb = (await getAccounts()) as Account[];
            setConnectedAccounts(accountsFromDb);
        } catch (error) {
            console.error("Could not fetch accounts:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load your connected accounts.'});
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);


    const handleUnlink = async () => {
        if (!isUnlinking) return;
        try {
            await deleteAccount(isUnlinking.id);
            toast({ title: 'Account Unlinked', description: `${isUnlinking.name} has been disconnected.` });
            fetchAccounts();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not unlink account.' });
        } finally {
            setIsUnlinking(null);
        }
    }

    const handleConnectAccount = () => {
        if (!selectedContinent) return;
        router.push(`/dashboard/link-account/select-bank?continent=${selectedContinent}`);
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Connected Accounts</CardTitle>
                        <CardDescription>These are the accounts currently syncing with FinPulse.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {connectedAccounts.length > 0 ? (
                            <div className="space-y-4">
                                {connectedAccounts.map(account => (
                                    <Collapsible key={account.id} asChild>
                                        <div className="rounded-lg border">
                                            <div className="flex items-center p-4">
                                                <div className="flex items-center gap-4 flex-grow">
                                                    <Landmark className="h-6 w-6 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-semibold">{account.name} (...{account.last4})</p>
                                                        <p className="text-sm text-muted-foreground">{account.type} - {formatCurrency(account.balance || 0)}</p>
                                                    </div>
                                                </div>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="mr-2">
                                                        Details
                                                        <ChevronDown className="h-4 w-4 ml-2 transition-transform ui-open:rotate-180" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem>Refresh</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => setIsUnlinking(account)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Unlink
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <CollapsibleContent>
                                                <div className="border-t p-4 space-y-3">
                                                    <AccountDetailsRow label="Account Holder" value={account.bankUserName} onCopy={() => toast({ title: "Copied account holder name!" })} />
                                                    <AccountDetailsRow label="Account Number" value={account.accountNumber} onCopy={() => toast({ title: "Copied account number!" })} />
                                                    <AccountDetailsRow label="Bank Name" value={account.bank} onCopy={() => toast({ title: "Copied bank name!" })} />
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                ))}
                            </div>
                        ) : (
                            <Alert>
                                <Wallet className="h-4 w-4" />
                                <AlertTitle>No bank accounts connected yet</AlertTitle>
                                <AlertDescription>
                                    Connect an account to automatically sync your transactions and balances.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Connect a New Account</CardTitle>
                        <CardDescription>Select your region to find your bank.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="continent-select">1. Select your continent</Label>
                             <Select value={selectedContinent} onValueChange={(value) => setSelectedContinent(value as Continents)}>
                                <SelectTrigger id="continent-select">
                                    <SelectValue placeholder="Choose your continent..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {continents.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={!selectedContinent}>
                                    <Landmark className="mr-2" />
                                    Connect New Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader className="items-center text-center">
                                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full inline-block">
                                        <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400"/>
                                    </div>
                                    <AlertDialogTitle>
                                        You are entering a secure connection
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You will be securely redirected to our trusted partner, to link your bank account. FinPulse never stores your bank login credentials. By continuing, you agree to our partner's terms of service.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                                    <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleConnectAccount} className="w-full">
                                        Agree & Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </div>
            <AlertDialog open={!!isUnlinking} onOpenChange={() => setIsUnlinking(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will unlink the {isUnlinking?.name} account. You will no longer see its balance or receive automatic transactions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnlink} className="bg-destructive hover:bg-destructive/90">
                           Yes, Unlink Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}


export default function LinkAccountPage() {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Landmark className="h-8 w-8" />
                        Link Bank Account
                    </h2>
                    <p className="text-muted-foreground">
                        Securely connect your accounts to automatically sync transactions.
                    </p>
                </div>
                <Suspense fallback={<Loader className="animate-spin" />}>
                  <LinkAccountPageContent />
                </Suspense>
            </div>
        </main>
    );
}
