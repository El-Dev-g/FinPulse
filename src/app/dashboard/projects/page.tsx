// src/app/dashboard/projects/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Plus } from "lucide-react";

export default function ProjectsPage() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <FolderKanban className="h-8 w-8" />
              Projects
            </h2>
            <p className="text-muted-foreground">
              Manage your large financial undertakings in one place.
            </p>
          </div>
          <Button>
            <Plus className="mr-2" />
            New Project
          </Button>
        </div>

        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
            <Card className="max-w-md mx-auto shadow-none border-none">
                <CardHeader>
                    <CardTitle className="text-xl">No Projects Yet</CardTitle>
                    <CardDescription>
                        Click "New Project" to start planning your next big financial milestone, like a vacation, wedding, or home renovation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>
                        <Plus className="mr-2" />
                        Create Your First Project
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
