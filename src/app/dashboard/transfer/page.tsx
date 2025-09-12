
// src/app/dashboard/transfer/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Wallet, Loader, Copy, Check, ArrowRight, ArrowLeftRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Account, Transaction } from "@/lib/types";
import { addTransaction, getTransactions } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getIconForCategory } from "@/lib/utils";
import { cn } from "@/lib/utils";

const LOCAL_STORAGE_KEY = "finpulse_connected_accounts";

function SendMoneyForm({ accounts, onTransaction: onTransactionSent }: { accounts: Account[]; onTransaction: () => void }) {
  const { formatCurrency } = useAuth();
  const { toast } = useToast();
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  
  const selectedAccount = accounts.find((acc) => acc.id === fromAccountId);

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !recipientName || !recipientAccount || !amount) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all required fields.' });
      return;
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to send.' });
      return;
    }
    
    if (selectedAccount.balance && sendAmount > selectedAccount.balance) {
        toast({ variant: 'destructive', title: 'Insufficient Funds', description: `You do not have enough funds in your ${selectedAccount.name} account.` });
        return;
    }

    setLoading(true);

    try {
      // 1. Simulate sending money by creating a transaction
      await addTransaction({
        description: `Transfer to ${recipientName}`,
        amount: -sendAmount,
        category: "Transfer",
        date: new Date().toISOString().split("T")[0],
        source: selectedAccount.id,
      });

      // 2. Update the local storage balance
      const newBalance = (selectedAccount.balance || 0) - sendAmount;
      const storedAccounts = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allAccounts = storedAccounts ? JSON.parse(storedAccounts) : [];
      const updatedAccounts = allAccounts.map((acc: Account) => 
        acc.id === fromAccountId ? { ...acc, balance: newBalance } : acc
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAccounts));
      
      onTransactionSent();

      toast({
        title: "Transfer Successful!",
        description: `${formatCurrency(sendAmount)} has been sent to ${recipientName}.`,
      });
      
      // Reset form
      setFromAccountId("");
      setRecipientName("");
      setRecipientAccount("");
      setAmount("");
      setReference("");

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Transfer Failed', description: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSendMoney} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fromAccount">From Account</Label>
        <Select value={fromAccountId} onValueChange={setFromAccountId}>
          <SelectTrigger id="fromAccount">
            <SelectValue placeholder="Select an account to send from..." />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                <div className="flex justify-between w-full">
                  <span>{acc.name} (...{acc.last4})</span>
                  <span className="text-muted-foreground">{formatCurrency(acc.balance || 0)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipient Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name</Label>
            <Input id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Jane Doe" required/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientAccount">Account Number</Label>
            <Input id="recipientAccount" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} placeholder="0123456789" required />
          </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="text-base">Amount &amp; Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Send</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g., For dinner" />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={loading || !fromAccountId}>
        {loading ? <Loader className="mr-2 animate-spin" /> : <Send className="mr-2" />}
        Send Money
      </Button>
    </form>
  );
}


function InternalTransferForm({ accounts, onTransaction: onTransactionSent }: { accounts: Account[]; onTransaction: () => void }) {
  const { formatCurrency } = useAuth();
  const { toast } = useToast();
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  const fromAccount = accounts.find((acc) => acc.id === fromAccountId);
  const toAccount = accounts.find((acc) => acc.id === toAccountId);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || !amount) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select both accounts and enter an amount.' });
      return;
    }
    if (fromAccountId === toAccountId) {
      toast({ variant: 'destructive', title: 'Invalid Transfer', description: 'Cannot transfer to the same account.' });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to transfer.' });
      return;
    }
    
    if (fromAccount.balance && transferAmount > fromAccount.balance) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: `You do not have enough funds in your ${fromAccount.name} account.` });
      return;
    }

    setLoading(true);

    try {
      // 1. Create debit transaction
      await addTransaction({
        description: `Transfer to ${toAccount.name}`,
        amount: -transferAmount,
        category: "Transfer",
        date: new Date().toISOString().split("T")[0],
        source: fromAccount.id,
      });

      // 2. Create credit transaction
      await addTransaction({
        description: `Transfer from ${fromAccount.name}`,
        amount: transferAmount,
        category: "Transfer",
        date: new Date().toISOString().split("T")[0],
        source: toAccount.id,
      });

      // 3. Update local storage balances
      const storedAccounts = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allAccounts = storedAccounts ? JSON.parse(storedAccounts) : [];
      const updatedAccounts = allAccounts.map((acc: Account) => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: (acc.balance || 0) - transferAmount };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: (acc.balance || 0) + transferAmount };
        }
        return acc;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAccounts));
      
      onTransactionSent();

      toast({
        title: "Transfer Successful!",
        description: `${formatCurrency(transferAmount)} has been moved to ${toAccount.name}.`,
      });
      
      // Reset form
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
      setReference("");

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Transfer Failed', description: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleTransfer} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="internalFromAccount">From</Label>
        <Select value={fromAccountId} onValueChange={setFromAccountId}>
          <SelectTrigger id="internalFromAccount">
            <SelectValue placeholder="Select an account..." />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                <div className="flex justify-between w-full">
                  <span>{acc.name} (...{acc.last4})</span>
                  <span className="text-muted-foreground">{formatCurrency(acc.balance || 0)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
       <div className="space-y-2">
        <Label htmlFor="internalToAccount">To</Label>
        <Select value={toAccountId} onValueChange={setToAccountId} disabled={!fromAccountId}>
          <SelectTrigger id="internalToAccount">
            <SelectValue placeholder="Select an account..." />
          </SelectTrigger>
          <SelectContent>
            {accounts.filter(acc => acc.id !== fromAccountId).map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                <div className="flex justify-between w-full">
                  <span>{acc.name} (...{acc.last4})</span>
                  <span className="text-muted-foreground">{formatCurrency(acc.balance || 0)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

       <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="internal-amount">Amount to Transfer</Label>
            <Input id="internal-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internal-reference">Reference (Optional)</Label>
            <Input id="internal-reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g., Savings top-up" />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={loading || !fromAccountId || !toAccountId}>
        {loading ? <Loader className="mr-2 animate-spin" /> : <ArrowLeftRight className="mr-2" />}
        Transfer Money
      </Button>
    </form>
  );
}



function ReceiveMoneyDetails({ accounts }: { accounts: Account[] }) {
    const { formatCurrency } = useAuth();
    const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || "");
    const [copied, setCopied] = useState<string | null>(null);

    const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);

    const handleCopy = (textToCopy: string, field: string) => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    if (accounts.length === 0) {
        return <NoAccountsMessage />;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="receiveAccount">Share details for account:</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger id="receiveAccount">
                        <SelectValue placeholder="Select an account..." />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                            <div className="flex justify-between w-full">
                                <span>{acc.name} (...{acc.last4})</span>
                                <span className="text-muted-foreground">{formatCurrency(acc.balance || 0)}</span>
                            </div>
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {selectedAccount && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                        <CardDescription>Share these details to receive money.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Account Holder</Label>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{selectedAccount.bankUserName}</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopy(selectedAccount.bankUserName, 'name')}>
                                    {copied === 'name' ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <Label>Account Number</Label>
                             <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{selectedAccount.accountNumber.replace(/\*(\s)/g, '• ')}</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopy(selectedAccount.accountNumber, 'number')}>
                                     {copied === 'number' ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                         <div className="flex justify-between items-center">
                            <Label>Bank Name</Label>
                             <div className="flex items-center gap-2">
                                <span className="text-sm">{selectedAccount.bank}</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopy(selectedAccount.bank, 'bank')}>
                                     {copied === 'bank' ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            )}
        </div>
    )
}

function NoAccountsMessage() {
    return (
        <Alert>
            <Wallet className="h-4 w-4" />
            <AlertTitle>No Bank Accounts Linked</AlertTitle>
            <AlertDescription>
                You need to link a bank account before you can send or receive money.
            </AlertDescription>
            <div className="mt-4">
                <Button asChild>
                    <Link href="/dashboard/link-account">
                        Link Account Now <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </div>
        </Alert>
    )
}

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [key, setKey] = useState(0); // Used to force-rerender child components
  const [refundCooldowns, setRefundCooldowns] = useState<Record<string, number>>({});
  const { toast, formatCurrency } = useAuth();
  
  const COOLDOWN_SECONDS = 10;

  const fetchAccounts = () => {
    try {
      const storedAccounts = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
      setAccounts([]);
    }
  }

  const fetchTransactions = async () => {
    try {
        const dbTransactions = (await getTransactions()) as Transaction[];
        setTransactions(dbTransactions.filter(t => t.category === 'Transfer' && t.amount < 0).slice(0, 5));
    } catch (error) {
        console.error("Could not fetch transactions:", error);
    }
  }

  const handleTransaction = () => {
    // Re-fetch accounts to update balances
    fetchAccounts();
    fetchTransactions();
    // Force a re-render of children by changing the key
    setKey(prevKey => prevKey + 1);
  }

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const handleRefund = async (transaction: Transaction) => {
    const refundAmount = Math.abs(transaction.amount);
    const sourceAccount = accounts.find(acc => acc.id === transaction.source);

    if (!sourceAccount) {
      toast({ variant: 'destructive', title: 'Refund Failed', description: 'Source account not found.' });
      return;
    }
    
    // Set cooldown
    setRefundCooldowns(prev => ({...prev, [transaction.id]: Date.now()}));

    try {
        // Create refund transaction
        await addTransaction({
            description: `Refund for: ${transaction.description}`,
            amount: refundAmount,
            category: 'Refund',
            date: new Date().toISOString().split('T')[0],
            source: transaction.source,
        });

        // Update local storage balance
        const newBalance = (sourceAccount.balance || 0) + refundAmount;
        const storedAccounts = localStorage.getItem(LOCAL_STORAGE_KEY);
        const allAccounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        const updatedAccounts = allAccounts.map((acc: Account) => 
            acc.id === transaction.source ? { ...acc, balance: newBalance } : acc
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAccounts));

        handleTransaction();

        toast({
            title: "Refund Processed",
            description: `${formatCurrency(refundAmount)} has been refunded to your account.`,
        });

    } catch (error) {
        console.error("Refund failed:", error);
        toast({ variant: 'destructive', title: 'Refund Failed', description: 'An error occurred while processing the refund.' });
    }
    
    // Clear cooldown after timeout
    setTimeout(() => {
        setRefundCooldowns(prev => {
            const newCooldowns = {...prev};
            delete newCooldowns[transaction.id];
            return newCooldowns;
        });
    }, COOLDOWN_SECONDS * 1000);
  };
  
  const isTransactionOnCooldown = (transactionId: string) => {
    const cooldownTime = refundCooldowns[transactionId];
    if (!cooldownTime) return false;
    return (Date.now() - cooldownTime) < COOLDOWN_SECONDS * 1000;
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Send className="h-8 w-8" />
            Send &amp; Receive
          </h2>
          <p className="text-muted-foreground">
            Move money between your accounts and to others.
          </p>
        </div>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send">Send Money</TabsTrigger>
            <TabsTrigger value="internal">Internal Transfer</TabsTrigger>
            <TabsTrigger value="receive">Receive Money</TabsTrigger>
          </TabsList>
          <TabsContent value="send" className="mt-6">
            {accounts.length > 0 ? (
                <SendMoneyForm key={key} accounts={accounts} onTransaction={handleTransaction}/>
            ) : (
                <NoAccountsMessage />
            )}
          </TabsContent>
          <TabsContent value="internal" className="mt-6">
             {accounts.length > 1 ? (
                <InternalTransferForm key={key} accounts={accounts} onTransaction={handleTransaction}/>
             ) : (
                <Alert>
                    <Wallet className="h-4 w-4" />
                    <AlertTitle>Not Enough Accounts</AlertTitle>
                    <AlertDescription>
                        You need at least two linked accounts to make an internal transfer.
                    </AlertDescription>
                     <div className="mt-4">
                        <Button asChild>
                            <Link href="/dashboard/link-account">
                                Link Another Account <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </div>
                </Alert>
             )}
          </TabsContent>
          <TabsContent value="receive" className="mt-6">
            <ReceiveMoneyDetails key={key} accounts={accounts} />
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Recent Outgoing Transfers</CardTitle>
                <CardDescription>Request a refund for a mistaken transfer.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length > 0 ? transactions.map(t => {
                            const Icon = getIconForCategory(t.category);
                            return (
                            <TableRow key={t.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted p-2 rounded-md">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{t.description}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className={cn("text-right font-medium", "text-foreground")}>
                                    {formatCurrency(t.amount)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleRefund(t)}
                                        disabled={isTransactionOnCooldown(t.id)}
                                    >
                                        <RefreshCw className="mr-2" />
                                        {isTransactionOnCooldown(t.id) ? "Pending" : "Request Refund"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No recent transfers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
