// src/app/dashboard/organizer/page.tsx
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";
import {
  tasksData as initialTasks,
  type FinancialTask,
  type TaskStatus,
} from "@/lib/placeholder-data";
import { AddTaskDialog } from "@/components/dashboard/add-task-dialog";

const columns: TaskStatus[] = ["To Do", "In Progress", "Done"];

export default function OrganizerPage() {
  const [tasks, setTasks] = useState<FinancialTask[]>(initialTasks);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  const handleAddTask = (newTask: Omit<FinancialTask, "id" | "status">) => {
    const taskWithId: FinancialTask = {
      ...newTask,
      id: `task_${tasks.length + 1}`,
      status: "To Do",
    };
    setTasks([...tasks, taskWithId]);
  };

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
              <ClipboardList className="h-8 w-8" />
              Financial Organizer
            </h2>
            <p className="text-muted-foreground">
              Manage your financial tasks and deadlines.
            </p>
          </div>
          <Button onClick={() => setIsAddTaskDialogOpen(true)}>
            <Plus className="mr-2" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((status) => (
            <div key={status} className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-center">{status}</h3>
              <div className="space-y-4">
                {tasksByStatus(status).map((task) => (
                  <Card key={task.id} className="p-4">
                    <p className="font-medium">{task.title}</p>
                    {task.dueDate && (
                        <p className="text-xs text-muted-foreground mt-1">Due: {task.dueDate}</p>
                    )}
                  </Card>
                ))}
                {tasksByStatus(status).length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                        No tasks here.
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onAddTask={handleAddTask}
      />
    </main>
  );
}
