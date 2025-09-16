// src/app/dashboard/projects/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, Loader, Lock } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import type { Project, ClientProject } from '@/lib/types';
import { getProjects, addProject, updateProject, deleteProject } from '@/lib/db';
import { AddProjectDialog } from '@/components/dashboard/add-project-dialog';
import { EditProjectDialog } from '@/components/dashboard/edit-project-dialog';
import { ProjectCard } from '@/components/dashboard/project-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProBadge } from "@/components/pro-badge";
import Link from "next/link";
import { processProjects } from '@/lib/utils';

export default function ProjectsPage() {
  const { user, isPro } = useAuth();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProject | null>(null);

  const projectLimit = 10;
  const hasReachedProjectLimit = !isPro && projects.length >= projectLimit;

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

  const handleEditProject = async (id: string, updatedData: Partial<Project>) => {
    await updateProject(id, updatedData);
    fetchData();
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    fetchData();
  };

  return (
    <>
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
        <div className="w-full">
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
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button onClick={() => setIsAddProjectDialogOpen(true)} disabled={hasReachedProjectLimit}>
                      {hasReachedProjectLimit ? <Lock className="mr-2" /> : <Plus className="mr-2" />}
                      New Project
                    </Button>
                    {hasReachedProjectLimit && (
                      <div className="absolute -top-2 -right-2">
                        <ProBadge />
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                {hasReachedProjectLimit && (
                  <TooltipContent>
                    <p>Upgrade to Pro to create unlimited projects.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          
           {hasReachedProjectLimit && (
            <div className="mb-6 p-4 bg-accent/30 border border-accent/50 rounded-lg text-center text-sm">
                <p className="font-semibold text-accent-foreground">You've reached your project limit!</p>
                <p className="text-muted-foreground mt-1">The free plan allows for up to {projectLimit} projects. <Button variant="link" className="p-0 h-auto" asChild><Link href="/dashboard/billing">Upgrade to Pro</Link></Button> to create more.</p>
            </div>
          )}

          {loading ? (
             <div className="flex justify-center items-center h-96">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : projects.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onEdit={() => setEditingProject(project)}
                  onDelete={() => setEditingProject(project)} // Open edit dialog to confirm delete
                />
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
      <EditProjectDialog
        project={editingProject}
        isOpen={!!editingProject}
        onOpenChange={() => setEditingProject(null)}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
      />
    </>
  );
}
