// src/components/dashboard/recent-transactions.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactionsData, Transaction } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";

interface RecentTransactionsProps {
  goalId?: string;
  title?: string;
  description?: string;
  showViewAll?: boolean;
}

export function RecentTransactions({
  goalId,
  title = "Recent Transactions",
  description = "Here are your latest financial activities.",
}: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredTransactions = goalId
    ? transactionsData.filter((t) => t.goalId === goalId)
    : transactionsData.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-md">
                        <transaction.Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.date}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      transaction.amount > 0
                        ? "text-green-600"
                        : "text-foreground"
                    )}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No transactions found for this goal.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
