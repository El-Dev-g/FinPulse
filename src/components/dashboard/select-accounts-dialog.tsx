
// src/components/dashboard/select-accounts-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Banknote, Landmark, Loader } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Account } from "@/lib/types";

interface SelectAccountsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddAccounts: (accounts: Account[]) => void;
}

// In a real app, this data would come from the Plaid/Truelayer API.
const mockAccounts: Account[] = [
    { 
        id: `acc_truelayer_${new Date().getTime()}_1`,
        name: 'Premier Checking',
        bank: 'Monzo Bank (via Truelayer)',
        last4: '1234',
        type: 'Checking',
        accountNumber: '**** **** **** 1234',
        syncStatus: 'Syncing daily',
        bankUserName: 'user_d',
        balance: 5421.11,
    },
    { 
        id: `acc_truelayer_${new Date().getTime()}_2`,
        name: 'Everyday Savings',
        bank: 'Monzo Bank (via Truelayer)',
        last4: '5678',
        type: 'Savings',
        accountNumber: '**** **** **** 5678',
        syncStatus: 'Syncing daily',
        bankUserName: 'user_d',
        balance: 10832.54,
    },
     { 
        id: `acc_truelayer_${new Date().getTime()}_3`,
        name: 'Platinum Credit Card',
        bank: 'Monzo Bank (via Truelayer)',
        last4: '9012',
        type: 'Credit',
        accountNumber: '**** **** **** 9012',
        syncStatus: 'Syncing daily',
        bankUserName: 'user_d',
        balance: -543.21,
    },
    { 
        id: `acc_truelayer_${new Date().getTime()}_4`,
        name: 'High-Yield Savings',
        bank: 'Starling Bank (via Truelayer)',
        last4: '4321',
        type: 'Savings',
        accountNumber: '**** **** **** 4321',
        syncStatus: 'Syncing daily',
        bankUserName: 'user_d',
        balance: 25000.00,
    }
];

export function SelectAccountsDialog({
  isOpen,
  onOpenChange,
  onAddAccounts,
}: SelectAccountsDialogProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSubmit = () => {
    setLoading(true);
    const accountsToAdd = mockAccounts.filter(acc => selectedAccounts.includes(acc.id));
    
    // Simulate API call
    setTimeout(() => {
        onAddAccounts(accountsToAdd);
        setLoading(false);
        onOpenChange(false);
        setSelectedAccounts([]);
    }, 1000);
  };
  
  const formatLocalCurrency = (amount: number, currency: string = "GBP") => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setSelectedAccounts([]);
        onOpenChange(open);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Accounts to Add</DialogTitle>
          <DialogDescription>
            We found the following accounts at Monzo Bank. Select the ones you want to track in FinPulse.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-80 my-4">
          <div className="space-y-3 pr-4">
            {mockAccounts.map((account) => (
              <label
                key={account.id}
                htmlFor={account.id}
                className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
              >
                <Checkbox
                  id={account.id}
                  checked={selectedAccounts.includes(account.id)}
                  onCheckedChange={() => handleCheckboxChange(account.id)}
                />
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        {account.type === 'Credit' ? <Banknote className="h-4 w-4 text-muted-foreground" /> : <Landmark className="h-4 w-4 text-muted-foreground" />}
                         <p className="font-semibold">{account.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">...{account.last4}</p>
                </div>
                 <p className="text-sm font-semibold">{formatLocalCurrency(account.balance!)}</p>
              </label>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || selectedAccounts.length === 0}>
            {loading && <Loader className="mr-2 animate-spin" />}
            Add {selectedAccounts.length} Account{selectedAccounts.length !== 1 && 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
