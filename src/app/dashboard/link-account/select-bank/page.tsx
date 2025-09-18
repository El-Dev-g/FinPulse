// src/app/dashboard/link-account/select-bank/page.tsx
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Loader, Search, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MOCK_BANKS from '@/lib/mock-banks.json';

type Bank = {
  name: string;
  logo: string;
};

type Country = {
  name: string;
  banks: Bank[];
};

type Continents = "Africa" | "Asia" | "Europe" | "North America" | "South America";

function SelectBankPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const continent = searchParams.get('continent') as Continents | null;
    const [bankSearchTerm, setBankSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const handleConnectBank = (bankName: string) => {
        setLoading(true);
        // Simulate API call and redirect
        setTimeout(() => {
            router.push(`/dashboard/link-account?success=true&bank=${encodeURIComponent(bankName)}`);
        }, 1500);
    }
    
    const filteredBanks = useMemo(() => {
        if (!continent) return [];
        const continentData: Country[] = MOCK_BANKS[continent];
        if (!continentData) return [];

        const allBanks = continentData.flatMap(country => country.banks);

        if (!bankSearchTerm) return allBanks;

        return allBanks.filter(bank => 
            bank.name.toLowerCase().includes(bankSearchTerm.toLowerCase())
        );
    }, [continent, bankSearchTerm]);

    if (!continent) {
        return (
            <div className="text-center">
                <p className="text-destructive">No continent selected.</p>
                <Button variant="link" asChild><Link href="/dashboard/link-account">Go back</Link></Button>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/link-account">
                        <ArrowLeft className="mr-2"/>
                        Back
                    </Link>
                </Button>
            </div>
            <h2 className="text-2xl font-bold font-headline mb-2">Select Your Bank in {continent}</h2>
            <p className="text-muted-foreground mb-6">Search for your bank to securely connect your account.</p>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="bank-search"
                    placeholder="Search for a bank..."
                    className="pl-9"
                    value={bankSearchTerm}
                    onChange={(e) => setBankSearchTerm(e.target.value)}
                />
                {bankSearchTerm && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setBankSearchTerm('')}
                    >
                    <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <ScrollArea className="h-[60vh] mt-4 rounded-md border">
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader className="animate-spin" />
                            <p className="ml-2">Connecting...</p>
                        </div>
                    ) : filteredBanks.length > 0 ? filteredBanks.map((bank, index) => (
                        <button key={index} onClick={() => handleConnectBank(bank.name)} className="w-full flex items-center p-3 gap-4 rounded-md hover:bg-muted">
                            <Image src={bank.logo} alt={bank.name} width={40} height={40} className="rounded-full" data-ai-hint="bank logo" />
                            <span>{bank.name}</span>
                        </button>
                    )) : (
                        <p className="text-center text-sm text-muted-foreground py-10">No banks found for your search.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

export default function SelectBankPage() {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-xl mx-auto">
                <Suspense fallback={<Loader className="animate-spin"/>}>
                    <SelectBankPageContent />
                </Suspense>
            </div>
        </main>
    );
}
