// src/app/dashboard/organizer/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, Calendar, LayoutGrid } from "lucide-react";
import {
  tasksData as initialTasks,
  goalsData,
  type FinancialTask,
  type TaskStatus,
} from "@/lib/placeholder-data";
import { AddTaskDialog } from "@/components/dashboard/add-task-dialog";
import { EditTaskDialog } from "@/components/dashboard/edit-task-dialog";
import { TaskColumn } from "@/components/dashboard/task-column";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const columns: TaskStatus[] = ["To Do", "In Progress", "Done"];

function KanbanView({
  tasks,
  onDragEnd,
  onEdit,
}: {
  tasks: FinancialTask[];
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (task: FinancialTask) => void;
}) {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow w-full">
        {columns.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
            onEditTask={onEdit}
          />
        ))}
      </div>
    </DndContext>
  );
}

function CalendarView({ tasks }: { tasks: FinancialTask[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const tasksByDate = useMemo(() => {
    const groupedTasks: { [key: string]: FinancialTask[] } = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = task.dueDate;
        if (!groupedTasks[dateKey]) {
          groupedTasks[dateKey] = [];
        }
        groupedTasks[dateKey].push(task);
      }
    });
    return groupedTasks;
  }, [tasks]);

  const selectedDayTasks = date
    ? tasksByDate[date.toISOString().split("T")[0]] || []
    : [];

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case "To Do":
        return "secondary";
      case "In Progress":
        return "default";
      case "Done":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow w-full">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-2">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              modifiers={{
                due: Object.keys(tasksByDate).map((d) => new Date(d + "T00:00:00")),
              }}
              modifiersStyles={{
                due: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                  textDecorationColor: "hsl(var(--primary))",
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              Tasks for {date ? date.toLocaleDateString() : "selected date"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDayTasks.length > 0 ? (
              selectedDayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-md border bg-card-foreground/5"
                >
                  <p className="font-semibold">{task.title}</p>
                  <Badge
                    variant={getStatusBadgeVariant(task.status)}
                    className="mt-1"
                  >
                    {task.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No tasks due on this day.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OrganizerPage() {
  const [tasks, setTasks] = useState<FinancialTask[]>(initialTasks);
  const [editingTask, setEditingTask] = useState<FinancialTask | null>(null);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("board");

  const handleAddTask = (newTask: Omit<FinancialTask, "id" | "status">) => {
    const taskWithId: FinancialTask = {
      ...newTask,
      id: `task_${tasks.length + 1}`,
      status: "To Do",
    };
    setTasks((prev) => [...prev, taskWithId]);
  };
  
  const handleEditTask = (updatedTask: FinancialTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };
  
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
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
      const overColumn = over.data.current?.sortable
        ?.containerId as TaskStatus | undefined;

      // If dropping over a column (but not on an item)
      if (overColumn && activeTask && activeTask.status !== overColumn) {
        return tasks.map((t) =>
          t.id === activeId ? { ...t, status: overColumn } : t
        );
      }

      // If dropping over another task
      if (activeTask && overTask) {
        const oldIndex = tasks.findIndex((t) => t.id === activeId);
        const newIndex = tasks.findIndex((t) => t.id === overId);
        const newStatus = overTask.status;

        if (activeTask.status !== newStatus) {
          const updatedTask = { ...activeTask, status: newStatus };
          const remainingTasks = tasks.filter((t) => t.id !== activeId);
          remainingTasks.splice(newIndex, 0, updatedTask);
          return remainingTasks;
        }
        return arrayMove(tasks, oldIndex, newIndex);
      }

      return tasks;
    });
  };

  return (
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
      <div className="max-w-7xl mx-auto w-full flex-grow">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="board">
              <LayoutGrid className="mr-2" />
              Board
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="mr-2" />
              Calendar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="board" className="h-full">
            <KanbanView
              tasks={tasks}
              onDragEnd={handleDragEnd}
              onEdit={setEditingTask}
            />
          </TabsContent>
          <TabsContent value="calendar" className="h-full">
            <CalendarView tasks={tasks} />
          </TabsContent>
        </Tabs>
      </div>
      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onAddTask={handleAddTask}
        goals={goalsData}
      />
      <EditTaskDialog
        task={editingTask}
        isOpen={!!editingTask}
        onOpenChange={(isOpen) => !isOpen && setEditingTask(null)}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        goals={goalsData}
      />
    </main>
  );
}
