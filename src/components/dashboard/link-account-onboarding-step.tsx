
// src/components/dashboard/link-account-onboarding-step.tsx
"use client";

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const countries: { [key: string]: { name: string; provider: string; continent: string } } = {
    'us': { name: "United States", provider: "Plaid", continent: "North America" },
    'ca': { name: "Canada", provider: "Plaid", continent: "North America" },
    'gb': { name: "United Kingdom", provider: "Truelayer", continent: "Europe" },
    'de': { name: "Germany", provider: "Truelayer", continent: "Europe" },
    'fr': { name: "France", provider: "Truelayer", continent: "Europe" },
    'es': { name: "Spain", provider: "Truelayer", continent: "Europe" },
    'ie': { name: "Ireland", provider: "Truelayer", continent: "Europe" },
    'ng': { name: "Nigeria", provider: "Mono", continent: "Africa" },
    'gh': { name: "Ghana", provider: "Mono", continent: "Africa" },
    'ke': { name: "Kenya", provider: "Mono", continent: "Africa" },
    'za': { name: "South Africa", provider: "Mono", continent: "Africa" },
    'other': { name: "Other", provider: "Manual", continent: "Other" }
};

const groupedCountries = Object.entries(countries).reduce((acc, [code, data]) => {
    const { continent } = data;
    if (!acc[continent]) {
        acc[continent] = [];
    }
    acc[continent].push({ code, ...data });
    return acc;
}, {} as { [key: string]: (typeof countries[string] & { code: string })[] });


interface LinkAccountStepProps {
  onSkip: () => void;
}

export function LinkAccountStep({ onSkip }: LinkAccountStepProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const { toast } = useToast();
  const { getTruelayerAuthUrl } = useAuth();
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [permissionProvider, setPermissionProvider] = useState("");
  
  const handleConnect = () => {
    if (!selectedCountry) {
      toast({
        variant: "destructive",
        title: "No Country Selected",
        description: "Please select a country to continue.",
      });
      return;
    }

    const provider = countries[selectedCountry].provider;
    setPermissionProvider(provider);
    setIsPermissionDialogOpen(true);
  };

  const handlePermissionAllow = () => {
    setIsPermissionDialogOpen(false);
    
    if (permissionProvider === 'Truelayer') {
        const authUrl = getTruelayerAuthUrl();
        if (!authUrl) {
            toast({
                variant: 'destructive',
                title: "Configuration Error",
                description: "Could not generate Truelayer authentication URL.",
            });
            return;
        }
        
        // This will redirect the main window to the Truelayer login page.
        // After auth, Truelayer will redirect back to our callback URL.
        // The callback logic should then redirect to the dashboard.
        window.top!.location.href = authUrl;
    } else {
        toast({
            title: "Connection Skipped",
            description: `Connections for ${permissionProvider} are not implemented in this prototype. You can link your account later.`,
        });
        onSkip();
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger id="country-select">
            <SelectValue placeholder="Choose a country..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedCountries).map(([continent, continentCountries]) => (
              <SelectGroup key={continent}>
                <SelectLabel>{continent}</SelectLabel>
                {continentCountries.map(({ code, name }) => (
                  <SelectItem key={code} value={code}>{name}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Based on your selection, we will use the appropriate provider (e.g., Plaid for the US, Truelayer for Europe, Mono for Africa) to connect your account.
        </p>
      </div>
      <div className="flex gap-4 mt-6">
        <Button onClick={handleConnect} disabled={!selectedCountry}>
          Connect Bank
        </Button>
        <Button variant="outline" onClick={onSkip}>
          Skip for now
        </Button>
      </div>
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Connect with {permissionProvider}</DialogTitle>
            <DialogDescription className="text-center pt-2">
              FinPulse uses {permissionProvider}, a secure third-party service, to connect to your bank.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="font-semibold text-center">FinPulse is requesting permission to access:</p>
            <ul className="space-y-3 text-sm text-muted-foreground p-4 border rounded-md">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold text-foreground">Account Details:</span> Account name, type, and currency.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold text-foreground">Account Balances:</span> Real-time balance information.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold text-foreground">Transaction History:</span> Up to 24 months of transaction data.
                </span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground text-center">
              You will be redirected to {permissionProvider} to securely log in to your bank.
            </p>
            <p className="text-xs text-muted-foreground text-center flex items-center gap-2 justify-center">
              <Lock className="h-4 w-4" /> Your credentials will not be shared with FinPulse.
            </p>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>Deny</Button>
            <Button onClick={handlePermissionAllow}>Allow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
