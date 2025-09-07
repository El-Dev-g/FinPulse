// src/app/dashboard/alerts/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Loader,
  TriangleAlert,
  Info,
  Lightbulb,
  LucideIcon,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getSmartAlerts, type SmartAlert } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const alertIcons: { [key in SmartAlert["severity"]]: LucideIcon } = {
  High: TriangleAlert,
  Medium: Info,
  Low: Lightbulb,
};

const alertColors: { [key in SmartAlert["severity"]]: string } = {
  High: "border-destructive/50 bg-destructive/5 text-destructive",
  Medium: "border-yellow-500/50 bg-yellow-500/5",
  Low: "border-blue-500/50 bg-blue-500/5",
};

function UpgradeToPro() {
  return (
    <Card className="mt-8 text-center">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 font-headline">
          <Sparkles className="h-6 w-6 text-primary" />
          Unlock Smart Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This is a Pro feature. Upgrade your plan to get AI-powered insights and alerts to keep your finances on track.
        </p>
        <Button>Upgrade to Pro</Button>
      </CardContent>
    </Card>
  );
}


export default function AlertsPage() {
  const { user, isPro } = useAuth();
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!user || !isPro) {
        setLoading(false);
        return;
    };
    setLoading(true);
    setError(null);
    try {
      const smartAlerts = await getSmartAlerts();
      setAlerts(smartAlerts);
    } catch (err: any) {
      console.error("Error fetching smart alerts:", err);
      setError("We couldn't fetch your smart alerts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user, isPro]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const highPriorityAlerts = alerts.filter((a) => a.severity === "High");
  const mediumPriorityAlerts = alerts.filter((a) => a.severity === "Medium");
  const lowPriorityAlerts = alerts.filter((a) => a.severity === "Low");

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Smart Alerts
            </h2>
            <p className="text-muted-foreground">
              AI-powered insights to keep your finances on track.
            </p>
          </div>
          {isPro && (
             <Button onClick={fetchAlerts} disabled={loading}>
              {loading ? (
                <Loader className="mr-2 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          )}
        </div>

        {!isPro ? (
            <UpgradeToPro />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Analyzing your financial data...
            </p>
          </div>
        ) : error ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-destructive">
                An Error Occurred
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        ) : alerts.length === 0 ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>All Clear!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We didn't find any issues that require your attention right now.
                Good job!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {highPriorityAlerts.length > 0 && (
              <AlertSection
                title="High Priority"
                alerts={highPriorityAlerts}
              />
            )}
            {mediumPriorityAlerts.length > 0 && (
              <AlertSection
                title="For Your Information"
                alerts={mediumPriorityAlerts}
              />
            )}
            {lowPriorityAlerts.length > 0 && (
              <AlertSection title="Opportunities" alerts={lowPriorityAlerts} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function AlertSection({
  title,
  alerts,
}: {
  title: string;
  alerts: SmartAlert[];
}) {
  return (
    <section>
      <h3 className="text-xl font-semibold mb-4 font-headline">{title}</h3>
      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const Icon = alertIcons[alert.severity];
          return (
            <Card
              key={index}
              className={alertColors[alert.severity]}
            >
              <CardHeader>
                <CardTitle className="flex items-start gap-3 text-base">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  {alert.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground pl-8">
                  {alert.description}
                </p>
                {alert.actionableLink && (
                  <div className="pl-8 mt-3">
                    <Button asChild variant="link" className="p-0 h-auto">
                        <a href={alert.actionableLink.href}>{alert.actionableLink.text}</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
