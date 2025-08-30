// src/components/dashboard/activity-list.tsx
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
import type { ClientTransaction, ClientFinancialTask } from "@/lib/types";
import { cn, getIconForCategory } from "@/lib/utils";
import { ArrowRightLeft, LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ActivityListProps {
  transactions?: ClientTransaction[];
  tasks?: ClientFinancialTask[];
  title: string;
  description: string;
  Icon?: LucideIcon;
}

export function ActivityList({
  transactions,
  tasks,
  title,
  description,
  Icon = ArrowRightLeft,
}: ActivityListProps) {
  const { formatCurrency } = useAuth();

  const hasContent = (transactions && transactions.length > 0) || (tasks && tasks.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasContent ? (
          <Table>
            <TableHeader>
                {transactions && (
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                )}
                {tasks && (
                    <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                    </TableRow>
                )}
            </TableHeader>
            <TableBody>
              {transactions?.map((transaction) => {
                const ItemIcon = getIconForCategory(transaction.category);
                return (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-md">
                        <ItemIcon className="h-4 w-4 text-muted-foreground" />
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
              )})}
              {tasks?.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium">{task.title}</div>
                  </TableCell>
                   <TableCell>
                     <Badge variant={task.status === 'Done' ? 'outline' : 'secondary'}>{task.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                     {task.dueDate ? new Date(task.dueDate + "T00:00:00").toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }) : 'No due date'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No activity found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
