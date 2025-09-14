// src/app/dashboard/projects/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, Loader } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import type { Project, ClientProject } from '@/lib/types';
import { getProjects, addProject, updateProject, deleteProject } from '@/lib/db';
import { AddProjectDialog } from '@/components/dashboard/add-project-dialog';
import { ProjectCard } from '@/components/dashboard/project-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);

  const processProjects = (projects: Project[]): ClientProject[] => {
    return projects.map(p => ({
      ...p,
      createdAt: p.createdAt.toDate(),
    }));
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const dbProjects = (await getProjects()) as Project[];
      setProjects(processProjects(dbProjects));
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddProject = async (newProject: Omit<Project, "id" | "createdAt">) => {
    await addProject(newProject);
    fetchData();
  };

  return (
    <>
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
            <Button onClick={() => setIsAddProjectDialogOpen(true)}>
              <Plus className="mr-2" />
              New Project
            </Button>
          </div>

          {loading ? (
             <div className="flex justify-center items-center h-96">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : projects.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
             <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                <Card className="max-w-md mx-auto shadow-none border-none">
                    <CardHeader>
                        <CardTitle className="text-xl">No Projects Yet</CardTitle>
                        <CardDescription>
                            Click "New Project" to start planning your next big financial milestone, like a vacation, wedding, or home renovation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setIsAddProjectDialogOpen(true)}>
                            <Plus className="mr-2" />
                            Create Your First Project
                        </Button>
                    </CardContent>
                </Card>
            </div>
          )}
        </div>
      </main>
      <AddProjectDialog
        isOpen={isAddProjectDialogOpen}
        onOpenChange={setIsAddProjectDialogOpen}
        onAddProject={handleAddProject}
      />
    </>
  );
}
