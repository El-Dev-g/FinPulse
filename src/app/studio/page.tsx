// src/app/studio/page.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StudioPage() {
  const { user } = useAuth();

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Welcome to the Studio, {user?.displayName || "Admin"}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your application.
          </p>
        </div>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Studio Dashboard</CardTitle>
           <CardDescription>
            This is the main dashboard for the admin studio. More widgets and analytics will be added here soon.
           </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Analytics and Metrics Coming Soon</p>
           </div>
        </CardContent>
       </Card>
    </main>
  );
}
