// src/components/dashboard/past-plans-list.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Advice, ClientAIPlan } from "@/lib/types";
import { History } from "lucide-react";

interface PastPlansListProps {
  plans: ClientAIPlan[];
  onSelectPlan: (plan: Advice) => void;
}

export function PastPlansList({ plans, onSelectPlan }: PastPlansListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Plans
        </CardTitle>
        <CardDescription>
          Review your previously generated plans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plans.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => onSelectPlan(plan.advice)}
                  className="w-full text-left p-3 rounded-md border bg-muted/20 hover:bg-muted/50 transition-colors"
                >
                  <p className="font-semibold text-sm truncate">
                    {plan.advice.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.createdAt.toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-center text-muted-foreground text-sm">
            <p>Your generated plans will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
