import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { goalsData } from "@/lib/placeholder-data";

export function GoalTracker() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Goals</CardTitle>
        <CardDescription>
          Track your progress towards your financial milestones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goalsData.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <div key={goal.id}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">{goal.title}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(goal.current)}
                    </span>{" "}
                    / {formatCurrency(goal.target)}
                  </p>
                </div>
                <Progress value={progress} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
