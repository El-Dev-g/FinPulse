
// src/app/dashboard/link-account/page.tsx
"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
} from "@/components/ui/alert-dialog";
import { Landmark, Loader, CheckCircle, MoreVertical, Info, ArrowRight, Wallet, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Account } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { addAccount, getAccounts, deleteAccount } from '@/lib/db';


const partner = { name: 'Fintech Partner', termsUrl: '#', privacyUrl: '#' };

function LinkAccountPageContent() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'initial' | 'connecting' | 'success'>('initial');
    const [connectedAccounts, setConnectedAccounts] = useState<Account[]>([]);
    const [newlyFetchedAccounts, setNewlyFetchedAccounts] = useState<Account[]>([]);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isUnlinking, setIsUnlinking] = useState<Account | null>(null);

    const { user, formatCurrency } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const fetchAccounts = useCallback(async () => {
        if (!user) return;
        try {
            const accountsFromDb = (await getAccounts()) as Account[];
            setConnectedAccounts(accountsFromDb);
        } catch (error) {
            console.error("Could not fetch accounts:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load your connected accounts.'});
        }
    }, [user, toast]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        
        async function handleSuccess() {
            setStep('connecting');
            const fetchedAccountsData: Account[] = [
                { id: 'acc1', name: 'Monzo', bank: 'Monzo Bank', bankUserName: 'John Doe', last4: '1234', accountNumber: '**** **** **** 1234', type: 'Checking', balance: 2548.75, syncStatus: 'synced' },
                { id: 'acc2', name: 'Revolut', bank: 'Revolut Ltd', bankUserName: 'John Doe', last4: '5678', accountNumber: '**** **** **** 5678', type: 'Savings', balance: 10500.00, syncStatus: 'synced' },
                { id: 'acc3', name: 'AMEX', bank: 'American Express', bankUserName: 'John Doe', last4: '0005', accountNumber: '**** ****** *0005', type: 'Credit Card', balance: -450.23, syncStatus: 'pending' },
            ];
            
            try {
                // Save new accounts to the database
                await Promise.all(fetchedAccountsData.map(acc => addAccount(acc)));
                setNewlyFetchedAccounts(fetchedAccountsData);
                fetchAccounts(); // Refetch all accounts from DB
                setStep('success');
            } catch (dbError) {
                console.error("Failed to save accounts:", dbError);
                toast({ variant: 'destructive', title: 'Connection Failed', description: 'Could not save your new accounts. Please try again.' });
                setStep('initial');
            } finally {
                // Clean the URL
                router.replace('/dashboard/link-account', { scroll: false });
            }
        }
        
        if (success === 'true') {
            handleSuccess();
        } else if (error) {
            toast({
                variant: 'destructive',
                title: 'Connection Failed',
                description: `Something went wrong: ${error}. Please try again.`
            });
            router.replace('/dashboard/link-account', { scroll: false });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, router, toast, fetchAccounts]);


    const handleConnect = async () => {
        setIsConfirming(false);
        setLoading(true);
        toast({
            title: "Demo Feature",
            description: "In a real app, this would securely redirect you to your bank.",
        });
        setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            params.set('success', 'true');
            router.push(`?${params.toString()}`);
        }, 2000);
    };

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
    
    if (step === 'connecting') {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Finalizing secure connection...</p>
            </div>
        )
    }
    
    if (step === 'success') {
         return (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        Connection Successful!
                    </CardTitle>
                    <CardDescription>We've successfully linked your accounts. You can view and manage them below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {newlyFetchedAccounts.map(acc => (
                                <TableRow key={acc.id}>
                                    <TableCell className="font-medium text-left">{acc.name} (...{acc.last4})</TableCell>
                                    <TableCell>{acc.type}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(acc.balance || 0)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                     <Button asChild className="w-full" onClick={() => setStep('initial')}>
                        <p>Done</p>
                    </Button>
                </CardFooter>
            </Card>
        )
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
                                    <div key={account.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-4">
                                            <Landmark className="h-6 w-6 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold">{account.name} (...{account.last4})</p>
                                                <p className="text-sm text-muted-foreground">{account.type} - {formatCurrency(account.balance || 0)}</p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
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
                    <CardFooter>
                        <Button onClick={() => setIsConfirming(true)} disabled={loading} className="w-full sm:w-auto">
                            {loading ? <Loader className="mr-2 animate-spin" /> : <Landmark className="mr-2" />}
                            Connect New Account
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Connect your account</AlertDialogTitle>
                        <AlertDialogDescription>
                            FinPulse's data partner, <strong>{partner.name}</strong>, would like 90-day access to your account details.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-sm space-y-4">
                       <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
                           <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                           <div>
                            <h4 className="font-semibold text-foreground">What details am I sharing?</h4>
                            <p className="text-muted-foreground">To provide its services, {partner.name} needs permission to access the following information and share it with FinPulse:</p>
                           </div>
                       </div>
                        <ul className="list-disc list-inside pl-4 space-y-1 text-muted-foreground">
                            <li>Full name</li>
                            <li>Account number and sort code</li>
                            <li>Balance</li>
                            <li>Transactions, direct debits and standing orders</li>
                        </ul>
                        <p className="text-xs text-muted-foreground text-center pt-2">
                            By tapping 'Allow', you agree to {partner.name}'s <a href={partner.termsUrl} target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</a> and <a href={partner.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>.
                        </p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConnect}>Allow</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
