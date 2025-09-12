
// src/app/dashboard/link-account/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Landmark, ArrowRight, Trash2, Banknote, Pencil, Loader, Eye, CheckCircle, Lock, User, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { addOrUpdateTransaction, deleteTransactionsBySource } from "@/lib/db";
import { subDays, format } from 'date-fns';
import { SelectAccountsDialog } from "@/components/dashboard/select-accounts-dialog";
import type { Account } from "@/lib/types";
import { Alert, AlertTitle, AlertDescription as AlertDescriptionComponent } from "@/components/ui/alert";


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


const initialAccounts: Account[] = [];
const LOCAL_STORAGE_KEY = 'finpulse_connected_accounts';


function LinkAccountPageContent() {
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [viewingAccount, setViewingAccount] = useState<Account | null>(null);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
    const [newName, setNewName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // State for permission dialog
    const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
    const [permissionProvider, setPermissionProvider] = useState('');
    
    // State for account selection dialog
    const [isSelectAccountsDialogOpen, setIsSelectAccountsDialogOpen] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const [connectionError, setConnectionError] = useState<string | null>(null);

    // Save accounts to localStorage whenever they change
    const updateAndPersistAccounts = useCallback((updatedAccounts: Account[]) => {
        setAccounts(updatedAccounts);
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAccounts));
        } catch (error) {
            console.error("Could not save to localStorage:", error);
        }
    }, []);

    // Load accounts from localStorage on component mount
    useEffect(() => {
        try {
            const storedAccounts = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedAccounts) {
                setAccounts(JSON.parse(storedAccounts));
            } else {
                setAccounts(initialAccounts);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialAccounts));
            }
        } catch (error) {
            console.error("Could not access localStorage:", error);
            setAccounts(initialAccounts);
        }
    }, []);
    
    // Handle the result of the OAuth flow from the bank
    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        
        if (success === 'truelayer_connected') {
            setIsSelectAccountsDialogOpen(true);
            // Clean up the URL
            router.replace('/dashboard/link-account');
        }

        if (error) {
            setConnectionError(`There was an error connecting your account. (${error})`);
            toast({
                variant: 'destructive',
                title: "Connection Failed",
                description: `There was an error connecting your account. (${error})`,
            });
             // Clean up the URL
            router.replace('/dashboard/link-account');
        }
    }, [searchParams, toast, router]);


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
        setPermissionProvider(provider);
        setIsPermissionDialogOpen(true);
    };

    const handlePermissionAllow = () => {
        setIsPermissionDialogOpen(false);
        
        if (permissionProvider === 'Truelayer') {
            // This URI must exactly match one of the URIs configured in the Truelayer developer console.
            const redirectUri = 'https://6000-firebase-studio-1757022081447-us-central1.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev/api/truelayer/callback';
            const authUrl = `https://auth.truelayer-sandbox.com/?response_type=code&client_id=sandbox-finpulse-0b40c2&scope=info%20accounts%20balance%20cards%20transactions%20direct_debits%20standing_orders%20offline_access&redirect_uri=${encodeURIComponent(redirectUri)}&providers=uk-cs-mock%20uk-ob-all%20uk-oauth-all`;
            
            window.open(authUrl, "_top");
        } else {
            toast({
                title: "Permissions Granted",
                description: `Connecting with ${permissionProvider}... In a real app, you would be redirected to your bank.`,
            });
        }
    }

    const handleAddAccounts = async (newAccounts: Account[]) => {
        if (newAccounts.length === 0) return;

        updateAndPersistAccounts([...accounts, ...newAccounts]);

        // Add some mock transactions for each new account
        for (const newAccount of newAccounts) {
             const mockTransactions = [
                { bankTransactionId: `tx_grocery_${newAccount.last4}`, description: 'Grocery Store', amount: -75.42, category: 'Groceries' },
                { bankTransactionId: `tx_paycheck_${newAccount.last4}`, description: 'Paycheck Deposit', amount: 2500, category: 'Income' },
            ];
            for (const trans of mockTransactions) {
                await addOrUpdateTransaction({
                    ...trans,
                    date: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString().split('T')[0],
                    source: newAccount.id,
                });
            }
        }
        
        toast({
            title: `${newAccounts.length} Account(s) Connected!`,
            description: "Your new accounts have been successfully linked.",
        });
    };
    
    const handleOpenEditDialog = (account: Account) => {
        setEditingAccount(account);
        setNewName(account.name);
    }
    
    const handleEditAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAccount) return;
        setIsLoading(true);
        setTimeout(() => {
            const updatedAccounts = accounts.map(acc => acc.id === editingAccount.id ? {...acc, name: newName} : acc);
            updateAndPersistAccounts(updatedAccounts);
            toast({
                title: "Account Updated",
                description: `The account "${editingAccount.bank}" has been renamed to "${newName}".`,
            });
            setEditingAccount(null);
            setNewName('');
            setIsLoading(false);
        }, 1000);
    }

    const handleDeleteAccount = async () => {
        if (!deletingAccount) return;

        await deleteTransactionsBySource(deletingAccount.id);

        const updatedAccounts = accounts.filter(acc => acc.id !== deletingAccount.id);
        updateAndPersistAccounts(updatedAccounts);
        
        toast({
            title: "Account Unlinked",
            description: `The account "${deletingAccount.name}" and its associated transactions have been unlinked.`,
        });
        setDeletingAccount(null);
        router.push('/dashboard');
    }

  return (
    <>
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

        {connectionError && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescriptionComponent>
                    {connectionError}
                </AlertDescriptionComponent>
             </Alert>
        )}

         <Card>
            <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                    These are the accounts currently syncing with FinPulse.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {accounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Banknote className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">{account.name} <span className="text-muted-foreground">...{account.last4}</span></p>
                                <p className="text-sm text-muted-foreground">{account.bank}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                             <Badge variant="outline">{account.type}</Badge>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingAccount(account)}>
                                 <Eye className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(account)}>
                                 <Pencil className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeletingAccount(account)}>
                                 <Trash2 className="h-4 w-4 text-destructive" />
                             </Button>
                        </div>
                    </div>
                ))}
                {accounts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No accounts connected yet.</p>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Connect a New Account</CardTitle>
                <CardDescription>
                    Select your country to begin the secure connection process. We use trusted partners like Plaid, Truelayer, and Mono to protect your data.
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
                 </div>
                 <p className="text-xs text-muted-foreground">
                    Based on your selection, we will use the appropriate provider (e.g., Plaid for the US, Truelayer for Europe, Mono for Africa) to connect your account.
                 </p>
            </CardContent>
            <CardFooter>
                <Button onClick={handleConnect} disabled={!selectedCountry}>
                    Continue to Connect
                    <ArrowRight className="ml-2" />
                </Button>
            </CardFooter>
        </Card>
      </div>
    </main>
    {/* View Details Dialog */}
     <Dialog open={!!viewingAccount} onOpenChange={(isOpen) => !isOpen && setViewingAccount(null)}>
        <DialogContent>
                <DialogHeader>
                    <DialogTitle>{viewingAccount?.name}</DialogTitle>
                    <DialogDescription>{viewingAccount?.bank} - {viewingAccount?.type} Account</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Bank User Name</p>
                        <p className="font-mono">{viewingAccount?.bankUserName}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Account Number</p>
                        <p className="font-mono">{viewingAccount?.accountNumber}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Sync Status</p>
                        <Badge variant="secondary">{viewingAccount?.syncStatus}</Badge>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setViewingAccount(null)}>Close</Button>
                </DialogFooter>
        </DialogContent>
    </Dialog>
    {/* Edit Account Dialog */}
    <Dialog open={!!editingAccount} onOpenChange={(isOpen) => !isOpen && setEditingAccount(null)}>
        <DialogContent>
            <form onSubmit={handleEditAccount}>
                <DialogHeader>
                    <DialogTitle>Edit Account Name</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="account-name">Account Nickname</Label>
                    <Input id="account-name" value={newName} onChange={(e) => setNewName(e.target.value)} disabled={isLoading}/>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setEditingAccount(null)}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader className="mr-2 animate-spin"/>}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    {/* Delete Account Dialog */}
    <AlertDialog open={!!deletingAccount} onOpenChange={setDeletingAccount}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to unlink this account?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will stop syncing new transactions from "{deletingAccount?.name}". All transactions that were automatically added from this source will also be permanently deleted. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                    Unlink Account
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    {/* Permission Dialog */}
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
                             <span className="font-semibold text-foreground">Card Details:</span> Card numbers, limits, and transaction history.
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
    {/* Select Accounts Dialog */}
     <SelectAccountsDialog 
        isOpen={isSelectAccountsDialogOpen}
        onOpenChange={setIsSelectAccountsDialogOpen}
        onAddAccounts={handleAddAccounts}
     />
    </>
  );
}


export default function LinkAccountPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <LinkAccountPageContent />
        </React.Suspense>
    )
}

    