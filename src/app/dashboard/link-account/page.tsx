// src/app/dashboard/link-account/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Landmark, Loader, AlertCircle, CheckCircle, Banknote, CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Account } from '@/lib/types';
import { sha256 } from 'js-sha256';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const LOCAL_STORAGE_KEY = 'finpulse_connected_accounts';

function LinkAccountPageContent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'initial' | 'connecting' | 'selecting' | 'success'>('initial');
    const [accounts, setAccounts] = useState<any[]>([]);

    const { getTruelayerAuthUrl, formatCurrency } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Exchange the authorization code for an access token
    useEffect(() => {
        const exchangeToken = async (code: string) => {
            setStep('connecting');
            setError(null);
            
            const codeVerifier = sessionStorage.getItem('truelayer_code_verifier');
            if (!codeVerifier) {
                setError('Security check failed: code verifier not found. Please try connecting again.');
                setStep('initial');
                return;
            }

            try {
                const response = await fetch('/api/truelayer/callback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        code, 
                        code_verifier: codeVerifier,
                        redirect_uri: process.env.NEXT_PUBLIC_TRUELAYER_REDIRECT_URI,
                    }),
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to exchange code for token.');
                }
                
                // For this prototype, we'll simulate fetching accounts and store them in local storage
                const fetchedAccounts = [
                    { id: sha256('acc1'), name: 'Monzo', bank: 'Monzo Bank', bankUserName: 'John Doe', last4: '1234', accountNumber: '**** **** **** 1234', type: 'Checking', balance: 2548.75, syncStatus: 'synced' },
                    { id: sha256('acc2'), name: 'Revolut', bank: 'Revolut Ltd', bankUserName: 'John Doe', last4: '5678', accountNumber: '**** **** **** 5678', type: 'Savings', balance: 10500.00, syncStatus: 'synced' },
                    { id: sha256('acc3'), name: 'AMEX', bank: 'American Express', bankUserName: 'John Doe', last4: '0005', accountNumber: '**** ****** *0005', type: 'Credit Card', balance: -450.23, syncStatus: 'pending' },
                ];

                setAccounts(fetchedAccounts);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fetchedAccounts));

                setStep('success');

            } catch (err: any) {
                setError(err.message);
                setStep('initial');
            }
        };

        const code = searchParams.get('code');
        const authError = searchParams.get('error');

        if (authError) {
             setError(`Connection failed: ${authError.replace(/_/g, ' ')}. Please try again.`);
        } else if (code) {
            exchangeToken(code);
            // Clean the URL
            router.replace('/dashboard/link-account', { scroll: false });
        }
    }, [searchParams, router]);


    const handleConnect = () => {
        setLoading(true);
        setError(null);
        try {
            const authUrl = getTruelayerAuthUrl();
            router.push(authUrl);
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
        }
    };
    
    if (step === 'connecting') {
        return (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Connecting to Your Bank</CardTitle>
                    <CardDescription>Please wait while we securely connect your account. You may be redirected.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-40">
                        <Loader className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Finalizing secure connection...</p>
                    </div>
                </CardContent>
            </Card>
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
                    <CardDescription>We've successfully linked your accounts. Here is a summary of what we've found.</CardDescription>
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
                            {accounts.map(acc => (
                                <TableRow key={acc.id}>
                                    <TableCell className="font-medium text-left">{acc.name} (...{acc.last4})</TableCell>
                                    <TableCell>{acc.type}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(acc.balance)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                     <p className="text-sm text-muted-foreground">You can now view these balances on your dashboard and use them to seed goals.</p>
                     <Button asChild className="w-full">
                        <a href="/dashboard">
                            Go to Dashboard <ArrowRight className="ml-2" />
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Connect Your Bank Account</CardTitle>
                <CardDescription>
                    Securely link your bank account using Truelayer to automatically sync your transactions and balances.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Connection Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="flex items-start p-4 bg-muted/50 rounded-lg border">
                    <Banknote className="h-10 w-10 text-muted-foreground mr-4" />
                    <div>
                        <h4 className="font-semibold">View all your accounts in one place</h4>
                        <p className="text-sm text-muted-foreground">Get a complete picture of your finances by connecting checking, savings, and credit card accounts.</p>
                    </div>
                </div>
                 <div className="flex items-start p-4 bg-muted/50 rounded-lg border">
                    <CreditCard className="h-10 w-10 text-muted-foreground mr-4" />
                    <div>
                        <h4 className="font-semibold">Automatic Transaction Syncing</h4>
                        <p className="text-sm text-muted-foreground">Your latest transactions will be automatically imported and categorized, saving you manual entry time.</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleConnect} disabled={loading} className="w-full">
                    {loading ? <Loader className="mr-2 animate-spin" /> : <Landmark className="mr-2" />}
                    Connect Securely with Truelayer
                </Button>
            </CardFooter>
        </Card>
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
                        Connect your accounts to get a complete financial overview.
                    </p>
                </div>
                <Suspense fallback={<Loader className="animate-spin" />}>
                  <LinkAccountPageContent />
                </Suspense>
            </div>
        </main>
    );
}
