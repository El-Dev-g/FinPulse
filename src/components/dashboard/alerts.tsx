
// src/components/dashboard/alerts.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, Loader, TriangleAlert } from "lucide-react";

export type AlertData = {
  id: string;
  variant: "default" | "destructive";
  title: string;
  message: string;
};

interface AlertsProps {
  alerts: AlertData[];
  loading: boolean;
}

export function Alerts({ alerts, loading }: AlertsProps) {
  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Checking for alerts...</span>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null; // Don't render anything if there are no alerts
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const Icon = alert.variant === 'destructive' ? TriangleAlert : Info;
        return (
          <Alert key={alert.id} variant={alert.variant}>
            <Icon className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
