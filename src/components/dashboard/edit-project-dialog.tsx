// src/components/dashboard/edit-project-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Trash } from "lucide-react";
import type { ClientProject, Project } from "@/lib/types";

interface EditProjectDialogProps {
  project: ClientProject | null;
  isOpen: boolean;
  onOpenChange: () => void;
  onEditProject: (id: string, updatedData: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export function EditProjectDialog({
  project,
  isOpen,
  onOpenChange,
  onEditProject,
  onDeleteProject,
}: EditProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setTargetAmount(String(project.targetAmount));
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    setError(null);
    const numTargetAmount = parseFloat(targetAmount);
    if (isNaN(numTargetAmount) || numTargetAmount <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    setLoading(true);
    try {
      await onEditProject(project.id, { 
        name,
        description,
        targetAmount: numTargetAmount,
      });
      onOpenChange();
    } catch (err) {
      setError("Failed to update project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (project) {
      setLoading(true);
      try {
        await onDeleteProject(project.id);
        setIsDeleteDialogOpen(false);
        onOpenChange();
      } catch (err) {
        setError("Failed to delete project.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          onOpenChange();
          setError(null);
          setLoading(false);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit '{project?.name}'</DialogTitle>
              <DialogDescription>
                Update the details for your project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name-edit">Project Name</Label>
                <Input id="project-name-edit" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-desc-edit">Description</Label>
                <Textarea id="project-desc-edit" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-target-edit">Target Amount</Label>
                <Input
                  id="project-target-edit"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <DialogFooter className="justify-between">
              <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={loading}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the '{project?.name}' project and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
