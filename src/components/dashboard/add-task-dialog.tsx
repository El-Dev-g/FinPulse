
// src/components/dashboard/add-task-dialog.tsx
"use client";

import { useState } from "react";
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
import { Loader } from "lucide-react";
import type { FinancialTask, Goal } from "@/lib/types";

interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTask: (newTask: Omit<FinancialTask, "id" | "status" | "createdAt">) => Promise<void>;
  defaultProjectId?: string;
}

export function AddTaskDialog({
  isOpen,
  onOpenChange,
  onAddTask,
  defaultProjectId,
}: AddTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            projectId: defaultProjectId,
        };

        await onAddTask(taskData);
        onOpenChange(false);
        setTitle("");
        setDueDate("");
        setDueTime("");
    } catch (err) {
        setError("Failed to add task. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setTitle("");
        setDueDate("");
        setDueTime("");
        setError(null);
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
