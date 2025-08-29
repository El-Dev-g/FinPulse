// src/app/dashboard/organizer/page.tsx
"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";
import {
  tasksData as initialTasks,
  type FinancialTask,
  type TaskStatus,
} from "@/lib/placeholder-data";
import { AddTaskDialog } from "@/components/dashboard/add-task-dialog";
import { TaskColumn } from "@/components/dashboard/task-column";

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
    setTasks((prev) => [...prev, taskWithId]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setTasks((tasks) => {
      const activeTask = tasks.find((t) => t.id === activeId);
      const overTask = tasks.find((t) => t.id === overId);
      const overColumn = over.data.current?.sortable?.containerId as TaskStatus | undefined;
      
      // If dropping over a column (but not on an item)
      if (overColumn && activeTask && activeTask.status !== overColumn) {
        return tasks.map(t => t.id === activeId ? {...t, status: overColumn} : t);
      }
      
      // If dropping over another task
      if (activeTask && overTask) {
        const oldIndex = tasks.findIndex((t) => t.id === activeId);
        const newIndex = tasks.findIndex((t) => t.id === overId);
        const newStatus = overTask.status;

        if (activeTask.status !== newStatus) {
            const updatedTask = {...activeTask, status: newStatus};
            const remainingTasks = tasks.filter(t => t.id !== activeId);
            remainingTasks.splice(newIndex, 0, updatedTask);
            return remainingTasks;
        }
        return arrayMove(tasks, oldIndex, newIndex);
      }

      return tasks;
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 flex flex-col">
        <div className="max-w-7xl mx-auto w-full">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow max-w-7xl mx-auto w-full">
          {columns.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks.filter((task) => task.status === status)}
            />
          ))}
        </div>
        <AddTaskDialog
          isOpen={isAddTaskDialogOpen}
          onOpenChange={setIsAddTaskDialogOpen}
          onAddTask={handleAddTask}
        />
      </main>
    </DndContext>
  );
}
