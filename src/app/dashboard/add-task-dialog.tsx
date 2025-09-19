// src/components/dashboard/add-task-dialog.tsx
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Target, FolderKanban } from "lucide-react";
import type { FinancialTask, Goal, Project } from "@/lib/types";
import { getGoals, getProjects } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTask: (newTask: Omit<FinancialTask, "id" | "status" | "createdAt">) => Promise<void>;
  defaultProjectId?: string;
  defaultGoalId?: string;
  goals?: Goal[];
}

export function AddTaskDialog({
  isOpen,
  onOpenChange,
  onAddTask,
  defaultProjectId,
  defaultGoalId,
  goals: initialGoals = [],
}: AddTaskDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [projects, setProjects] = useState<Project[]>([]);
  const [goalId, setGoalId] = useState<string | undefined>(defaultGoalId);
  const [projectId, setProjectId] = useState<string | undefined>(defaultProjectId);

  const fetchData = useCallback(async () => {
    if (user && isOpen && goals.length === 0) {
      const [dbGoals, dbProjects] = await Promise.all([
        getGoals('active'),
        getProjects(),
      ]);
      setGoals(dbGoals as Goal[]);
      setProjects(dbProjects as Project[]);
    }
  }, [user, isOpen, goals.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
      setGoalId(defaultGoalId);
      setProjectId(defaultProjectId);
  }, [defaultGoalId, defaultProjectId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title) {
      setError("Please fill out the title.");
      return;
    }

    setLoading(true);

    try {
        const taskData: Omit<FinancialTask, "id" | "status" | "createdAt"> = { 
            title, 
            dueDate, 
            dueTime, 
            goalId: goalId === 'none' ? undefined : goalId,
            projectId: projectId === 'none' ? undefined : projectId,
        };

        await onAddTask(taskData);
        onOpenChange(false);
        setTitle("");
        setDueDate("");
        setDueTime("");
        setGoalId(undefined);
        setProjectId(undefined);
    } catch (err) {
        setError("Failed to add task. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const canLinkGoal = !projectId;
  const canLinkProject = !goalId;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setTitle("");
        setDueDate("");
        setDueTime("");
        setError(null);
        setGoalId(undefined);
        setProjectId(undefined);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              What do you need to get done?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Task Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Pay electricity bill"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">
                  Due Date (Optional)
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime">
                  Time (Optional)
                </Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  disabled={!dueDate}
                />
              </div>
            </div>
             {goals.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="goalId-task" className={!canLinkGoal ? 'text-muted-foreground' : ''}>
                      Link to Goal (Optional)
                    </Label>
                     <Select value={goalId} onValueChange={setGoalId} disabled={!canLinkGoal}>
                        <SelectTrigger id="goalId-task">
                           <SelectValue placeholder="Select a goal..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                             {goals.map((goal) => (
                                <SelectItem key={goal.id} value={goal.id}>
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        <span>{goal.title}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
             {projects.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="projectId-task" className={!canLinkProject ? 'text-muted-foreground' : ''}>
                      Link to Project (Optional)
                    </Label>
                     <Select value={projectId} onValueChange={setProjectId} disabled={!canLinkProject}>
                        <SelectTrigger id="projectId-task">
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
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
