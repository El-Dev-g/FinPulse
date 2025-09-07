// src/app/dashboard/link-account/page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Landmark, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const countries: { [key: string]: { name: string; provider: string; } } = {
    'us': { name: "United States", provider: "Plaid" },
    'gb': { name: "United Kingdom", provider: "Plaid" },
    'ca': { name: "Canada", provider: "Plaid" },
    'ng': { name: "Nigeria", provider: "Mono" },
    'gh': { name: "Ghana", provider: "Mono" },
    'ke': { name: "Kenya", provider: "Mono" },
    'za': { name: "South Africa", provider: "Mono" },
    'other': { name: "Other", provider: "Manual" }
};

export default function LinkAccountPage() {
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const { toast } = useToast();

    const handleConnect = () => {
        if (!selectedCountry) {
            toast({
                variant: 'destructive',
                title: "No Country Selected",
                description: "Please select a country to continue.",
            });
            return;
        }

        const provider = countries[selectedCountry].provider;
        
        toast({
            title: `Connecting with ${provider}...`,
            description: "In a real application, this would open the secure connection flow for the selected financial provider.",
        });

        // Here you would trigger the actual SDK for the provider (Plaid Link, Mono Connect, etc.)
    }


  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Landmark className="h-8 w-8" />
            Link Bank Account
          </h2>
          <p className="text-muted-foreground">
            Securely connect your bank accounts to automatically sync transactions.
          </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Connect an Account</CardTitle>
                <CardDescription>
                    Select your country to begin the secure connection process. We use trusted partners like Plaid and Mono to protect your data.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="country-select">Select Your Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger id="country-select">
                            <SelectValue placeholder="Choose a country..." />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(countries).map(([code, { name }]) => (
                                <SelectItem key={code} value={code}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <p className="text-xs text-muted-foreground">
                    Based on your selection, we will use the appropriate provider (e.g., Plaid for the US, Mono for Nigeria) to connect your account.
                 </p>
            </CardContent>
            <CardFooter>
                <Button onClick={handleConnect} disabled={!selectedCountry}>
                    Continue to Connect
                    <ArrowRight className="ml-2" />
                </Button>
            </CardFooter>
        </Card>
        
         <Card>
            <CardHeader>
                <CardTitle>Is it secure?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                    Yes. FinPulse never sees or stores your bank login credentials. When you connect your account, you are using a secure portal from our trusted partners (like Plaid or Mono).
                </p>
                <p>
                    We only receive read-only access to your transaction history and account balances.
                </p>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
