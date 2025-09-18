
// src/components/dashboard/edit-goal-dialog.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Loader, Trash, Archive, Undo, Plus, FolderKanban } from "lucide-react";
import type { Goal, FinancialTask, Project } from "@/lib/types";
import { getTasks, updateTask, updateTasks, addTask, getProjects } from "@/lib/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface EditGoalDialogProps {
  goal: Goal | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEditGoal: (updatedGoal: Goal) => Promise<void>;
  onArchiveGoal: (goalId: string) => Promise<void>;
  onPermanentDelete: (goalId: string) => Promise<void>;
}

export function EditGoalDialog({
  goal,
  isOpen,
  onOpenChange,
  onEditGoal,
  onArchiveGoal,
  onPermanentDelete,
}: EditGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [projectId, setProjectId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);


  const isArchived = status === 'archived';

  const fetchData = useCallback(async () => {
    if (goal) {
      const dbProjects = await getProjects() as Project[];
      setProjects(dbProjects);
    }
  }, [goal]);


  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setCurrent(goal.current.toString());
      setTarget(goal.target.toString());
      setStatus(goal.status);
      setProjectId(goal.projectId);
      fetchData();
    }
  }, [goal, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !target || !current) {
      setError("Please fill out all fields.");
      return;
    }

    const currentAmount = parseFloat(current);
    const targetAmount = parseFloat(target);

    if (
      isNaN(targetAmount) ||
      targetAmount <= 0 ||
      isNaN(currentAmount) ||
      currentAmount < 0
    ) {
      setError("Please enter valid amounts.");
      return;
    }

    if (currentAmount > targetAmount) {
      setError("Current amount cannot be greater than the target amount.");
      return;
    }

    setLoading(true);

    try {
        if (goal) {
            await onEditGoal({
                ...goal,
                title,
                current: currentAmount,
                target: targetAmount,
                status: isArchived ? 'active' : goal.status, // Restore if it was archived
                projectId: projectId === 'none' ? undefined : projectId,
            });
        }
        onOpenChange(false);
    } catch (err) {
        setError("Failed to update goal. Please try again.");
    } finally {
        setLoading(false);
    }
  };
  
  const handleArchive = async () => {
    if (goal) {
      try {
        await onArchiveGoal(goal.id);
        onOpenChange(false);
      } catch (err) {
        setError("Failed to archive goal.");
      }
    }
  };

  const handleDelete = async () => {
     if (goal) {
      try {
        await onPermanentDelete(goal.id);
        setIsDeleteDialogOpen(false);
        onOpenChange(false);
      } catch (err) {
        setError("Failed to delete goal permanently.");
      }
    }
  }


  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isArchived ? "Archived Goal" : "Edit Financial Goal"}</DialogTitle>
            <DialogDescription>
              {isArchived ? "You can restore this goal or delete it permanently." : "Update the details for your financial goal."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Goal Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Save for Vacation"
                disabled={isArchived}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">
                Current Amount
              </Label>
              <Input
                id="current"
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="e.g., 1500"
                 disabled={isArchived}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">
                Target Amount
              </Label>
              <Input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., 5000"
                 disabled={isArchived}
              />
            </div>
            {!isArchived && (
              <>
                 {projects.length > 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="projectId-edit">Link to a Project (Optional)</Label>
                        <Select value={projectId || 'none'} onValueChange={setProjectId}>
                            <SelectTrigger id="projectId-edit">
                            <SelectValue placeholder="Select a project..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        <div className="flex items-center gap-2">
                                            <FolderKanban className="h-4 w-4 text-muted-foreground" />
                                            <span>{project.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
              </>
            )}
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter className="justify-between">
            <div>
              {isArchived ? (
                <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash className="mr-2" /> Delete Permanently
                </Button>
              ) : (
                 <Button type="button" variant="outline" onClick={handleArchive}>
                    <Archive className="mr-2" /> Archive
                </Button>
              )}
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isArchived ? <><Undo className="mr-2"/>Restore Goal</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this goal and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
