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
import { Loader, Trash, Archive, Undo, Plus } from "lucide-react";
import type { Goal, FinancialTask } from "@/lib/types";
import { getTasks, updateTask, updateTasks, addTask } from "@/lib/db";
import { MultiSelect, type OptionType } from "@/components/ui/multi-select";
import { AddTaskDialog } from "./add-task-dialog";

interface EditGoalDialogProps {
  goal: Goal | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEditGoal: (updatedGoal: Goal, linkedTaskIds: string[], unlinkedTaskIds: string[]) => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Tasks state
  const [allTasks, setAllTasks] = useState<FinancialTask[]>([]);
  const [taskOptions, setTaskOptions] = useState<OptionType[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [initialTaskIds, setInitialTaskIds] = useState<string[]>([]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);


  const isArchived = status === 'archived';

  const fetchData = useCallback(async () => {
    if (goal) {
      const dbTasks = await getTasks() as FinancialTask[];
      setAllTasks(dbTasks);
      
      const currentlyLinkedIds = dbTasks.filter(t => t.goalId === goal.id).map(t => t.id);
      setInitialTaskIds(currentlyLinkedIds);
      setSelectedTaskIds(currentlyLinkedIds);

      const availableTasks = dbTasks.filter(t => !t.goalId || t.goalId === goal.id);
      setTaskOptions(availableTasks.map(t => ({ value: t.id, label: t.title })));
    }
  }, [goal]);


  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setCurrent(goal.current.toString());
      setTarget(goal.target.toString());
      setStatus(goal.status);
      fetchData();
    }
  }, [goal, fetchData]);
  
  const handleAddNewTask = async (newTask: Omit<FinancialTask, "id" | "status" | "createdAt">) => {
    const newTaskId = await addTask({ ...newTask, status: "To Do" });
    // Add the new task to the selected list automatically
    setSelectedTaskIds(prev => [...prev, newTaskId]);
    await fetchData(); // Refresh the list of tasks
  }

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
            const linkedTaskIds = selectedTaskIds.filter(id => !initialTaskIds.includes(id));
            const unlinkedTaskIds = initialTaskIds.filter(id => !selectedTaskIds.includes(id));

            await onEditGoal({
                ...goal,
                title,
                current: currentAmount,
                target: targetAmount,
                status: isArchived ? 'active' : goal.status, // Restore if it was archived
            }, linkedTaskIds, unlinkedTaskIds);
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
              <div className="space-y-2">
                  <div className="flex justify-between items-center">
                      <Label htmlFor="tasks">Linked Tasks</Label>
                      <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => setIsAddTaskDialogOpen(true)}>
                          <Plus className="mr-1 h-3 w-3" /> New Task
                      </Button>
                  </div>
                  <MultiSelect
                      options={taskOptions}
                      selected={selectedTaskIds}
                      onChange={setSelectedTaskIds}
                      placeholder="Select tasks..."
                  />
              </div>
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
      <AddTaskDialog 
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onAddTask={handleAddNewTask}
        goals={[]}
    />
    </>
  );
}
