
// src/components/dashboard/add-goal-dialog.tsx
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
import { Loader, Landmark, Plus, FolderKanban, Target } from "lucide-react";
import type { Goal, AIPlan, Account, FinancialTask, Project } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getAccounts, getTasks, updateTasks, addTask, getProjects } from "@/lib/db";
import { MultiSelect, type OptionType } from "@/components/ui/multi-select";
import { AddTaskDialog } from "./add-task-dialog";


interface AddGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddGoal: (newGoal: Omit<Goal, "id" | "current" | "createdAt" | "status">, current?: number, linkedTaskIds?: string[]) => Promise<void>;
  isSubmitting?: boolean;
  aiPlans?: AIPlan[];
}

export function AddGoalDialog({
  isOpen,
  onOpenChange,
  onAddGoal,
  isSubmitting = false,
  aiPlans = [],
}: AddGoalDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [adviceId, setAdviceId] = useState<string>("none");
  const [projectId, setProjectId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accounts state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Tasks state
  const [unassignedTasks, setUnassignedTasks] = useState<OptionType[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  const { toast } = useToast();
  
  const fetchData = useCallback(async () => {
    if (user && isOpen) {
        const [accountsFromDb, tasksFromDb, projectsFromDb] = await Promise.all([
            getAccounts() as Promise<Account[]>,
            getTasks() as Promise<FinancialTask[]>,
            getProjects() as Promise<Project[]>,
        ]);
        setAccounts(accountsFromDb);
        setProjects(projectsFromDb);
        const filteredTasks = tasksFromDb
            .filter(task => !task.goalId && !task.projectId)
            .map(task => ({ value: task.id, label: task.title }));
        setUnassignedTasks(filteredTasks);
    }
  }, [user, isOpen]);

  useEffect(() => {
    fetchData();
  }, [isOpen, fetchData]);

  const handleAccountLink = (accountId: string) => {
    if (accountId === 'none') {
        setCurrent("");
        return;
    }
    const account = accounts.find(acc => acc.id === accountId);
    if (account && account.balance) {
        setCurrent(String(account.balance));
        toast({
            title: "Balance Pre-filled",
            description: `Current amount set to ${account.balance} from ${account.name}.`
        })
    }
  }
  
  const handleAddNewTask = async (newTask: Omit<FinancialTask, "id" | "status" | "createdAt">) => {
    const newTaskId = await addTask({ ...newTask, status: "To Do" });
    // Add the new task to the selected list automatically
    setSelectedTaskIds(prev => [...prev, newTaskId]);
    await fetchData(); // Refresh the list of unassigned tasks
  }

  const resetDialog = () => {
    setTitle("");
    setTarget("");
    setCurrent("");
    setAdviceId("none");
    setProjectId(undefined);
    setSelectedTaskIds([]);
    setError(null);
    setLoading(false);
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !target) {
      setError("Please fill out title and target.");
      return;
    }

    const targetAmount = parseFloat(target);
    const currentAmount = parseFloat(current) || 0;
    
    if (isNaN(targetAmount) || targetAmount <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }
     if (currentAmount > targetAmount) {
      setError("Current amount cannot be greater than target amount.");
      return;
    }

    setLoading(true);

    const selectedPlan = aiPlans.find(p => p.id === adviceId);

    try {
      await onAddGoal({ 
        title, 
        target: targetAmount,
        advice: selectedPlan ? selectedPlan.advice : undefined,
        projectId: projectId === 'none' ? undefined : projectId,
      }, currentAmount, selectedTaskIds);
      onOpenChange(false);
      resetDialog();
    } catch (err) {
       setError("Failed to add goal. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetDialog();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Financial Goal</DialogTitle>
            <DialogDescription>
              What's your next financial milestone?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             {accounts.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="linkedAccount">Seed With Account Balance (Optional)</Label>
                    <Select onValueChange={handleAccountLink}>
                        <SelectTrigger id="linkedAccount">
                            <SelectValue placeholder="Select an account..." />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="none">Don't link an account</SelectItem>
                            {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    <div className="flex items-center gap-2">
                                        <Landmark className="h-4 w-4 text-muted-foreground" />
                                        <span>{acc.name} (...{acc.last4})</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
             )}

            <div className="space-y-2">
              <Label htmlFor="title">
                Goal Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Save for Vacation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="current">
                    Current Amount
                  </Label>
                  <Input
                    id="current"
                    type="number"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    placeholder="e.g., 0"
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
                  />
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="tasks">Link Tasks (Optional)</Label>
                    <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => setIsAddTaskDialogOpen(true)}>
                        <Plus className="mr-1 h-3 w-3" /> New Task
                    </Button>
                </div>
                <MultiSelect
                    options={unassignedTasks}
                    selected={selectedTaskIds}
                    onChange={setSelectedTaskIds}
                    placeholder="Select unassigned tasks..."
                />
            </div>

            {projects.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="projectId">Link to a Project (Optional)</Label>
                     <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger id="projectId">
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
           
            {aiPlans.length > 0 && (
                <div className="space-y-2">
                <Label htmlFor="advice">Link an AI Plan (Optional)</Label>
                    <Select value={adviceId} onValueChange={setAdviceId}>
                        <SelectTrigger id="advice">
                            <SelectValue placeholder="Select a pre-generated plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {aiPlans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                    {plan.advice.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading || isSubmitting}>
              {(loading || isSubmitting) && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Add Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <AddTaskDialog 
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onAddTask={handleAddNewTask}
        goals={[]}
    />
    </>
  );
}
