// src/app/dashboard/link-account/connect/page.tsx
"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, X, Layers, Landmark, Info, ShieldCheck, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { addAccount } from '@/lib/db';
import type { Account } from '@/lib/types';
import { Logo } from '@/components/logo';

function ConnectPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const bankName = searchParams.get('bank');
    const bankLogo = searchParams.get('logo');

    const handleAllowConnection = async () => {
        if (!bankName) return;

        // In a real app, this would come from the secure connection
        const mockAccount: Omit<Account, 'id' | 'createdAt'> = {
            name: `${bankName} Checking`,
            bank: bankName,
            last4: String(Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)),
            type: 'checking',
            balance: Math.floor(Math.random() * (25000 - 500 + 1) + 500),
            accountNumber: `**** **** **** ${String(Math.floor(Math.random() * (9999 - 1000 + 1) + 1000))}`,
            syncStatus: 'synced',
            bankUserName: 'John Doe',
        };

        try {
            await addAccount(mockAccount);
            toast({
                title: "Connection Successful!",
                description: `${bankName} has been securely linked.`,
                className: "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
            });
            router.push('/dashboard/link-account');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Connection Failed",
                description: "We couldn't link your account. Please try again.",
            });
        }
    }


    return (
        <div className="flex flex-col h-screen bg-muted/30">
            <header className="flex items-center justify-between p-4 border-b bg-background">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/link-account/select-bank?continent=${searchParams.get('continent')}`}>
                        <ArrowLeft />
                    </Link>
                </Button>
                <div className="flex items-center gap-4">
                    {bankLogo && <Image src={bankLogo} alt={bankName || 'Bank'} width={32} height={32} className="rounded-full" />}
                    <span className="text-muted-foreground text-sm">...</span>
                    <div className="p-2 rounded-full border bg-muted">
                        <Layers className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground text-sm">...</span>
                    <div className="p-2 rounded-full border bg-muted">
                        <Landmark className="h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/link-account">
                        <X />
                    </Link>
                </Button>
            </header>
            <main className="flex-grow p-6 space-y-6">
                 <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold font-headline">Connect your account</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        FinPulse's data partner, Plaid, would like 90-day access to your {bankName} account details.
                    </p>
                 </div>

                 <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <Info className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <h2 className="font-semibold">What details am I sharing?</h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    To provide its services, our partner needs permission to access the following information and share it with FinPulse:
                                </p>
                                <ul className="mt-4 space-y-3 text-sm">
                                    <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-green-500" /> Full name</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-green-500" /> Account number and details</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-green-500" /> Balance</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-green-500" /> Transactions, direct debits and standing orders</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </main>
            <footer className="p-4 border-t bg-background">
                <Button className="w-full" size="lg" onClick={handleAllowConnection}>
                    Allow
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3 px-4">
                    By tapping 'Allow', you agree to our partner's <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                </p>
            </footer>
        </div>
    )
}

export default function ConnectPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConnectPageContent />
        </Suspense>
    )
}
