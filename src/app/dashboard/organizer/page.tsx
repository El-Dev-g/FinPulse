// src/app/dashboard/organizer/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, Calendar, LayoutGrid, Loader } from "lucide-react";
import {
  type FinancialTask,
  type TaskStatus,
  type Goal,
} from "@/lib/types";
import { AddTaskDialog } from "@/components/dashboard/add-task-dialog";
import { EditTaskDialog } from "@/components/dashboard/edit-task-dialog";
import { TaskColumn } from "@/components/dashboard/task-column";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { getTasks, getGoals, addTask, updateTask, deleteTask } from "@/lib/db";

const columns: TaskStatus[] = ["To Do", "In Progress", "Done"];

function KanbanView({
  tasks,
  goals,
  onDragEnd,
  onEdit,
}: {
  tasks: FinancialTask[];
  goals: Goal[];
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
            goals={goals}
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
  const { user } = useAuth();
  const [tasks, setTasks] = useState<FinancialTask[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<FinancialTask | null>(null);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("board");

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dbTasks, dbGoals] = await Promise.all([getTasks(), getGoals()]);
      setTasks(dbTasks as FinancialTask[]);
      setGoals(dbGoals as Goal[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleAddTask = async (newTask: Omit<FinancialTask, "id" | "status" | "createdAt">) => {
    await addTask({ ...newTask, status: "To Do" });
    fetchData();
  };
  
  const handleEditTask = async (updatedTask: FinancialTask) => {
    await updateTask(updatedTask.id, updatedTask);
    fetchData();
  };
  
  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    fetchData();
  };


  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Dropping on a column
    const overColumn = over.data.current?.sortable?.containerId as TaskStatus | undefined;
    if (overColumn && activeTask.status !== overColumn) {
        const updatedTask = { ...activeTask, status: overColumn };
        await updateTask(activeId as string, { status: overColumn });
        setTasks(tasks.map((t) => (t.id === activeId ? updatedTask : t)));
        return;
    }

    // Dropping on another task
    if (activeId !== overId) {
      const oldIndex = tasks.findIndex((t) => t.id === activeId);
      const newIndex = tasks.findIndex((t) => t.id === overId);
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);
      // Note: For persistence, you'd need to update an 'order' field in Firestore
    }
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
          {loading ? (
             <div className="flex justify-center items-center h-96">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <>
            <TabsContent value="board" className="h-full">
                <KanbanView
                tasks={tasks}
                goals={goals}
                onDragEnd={handleDragEnd}
                onEdit={setEditingTask}
                />
            </TabsContent>
            <TabsContent value="calendar" className="h-full">
                <CalendarView tasks={tasks} />
            </TabsContent>
           </>
          )}
        </Tabs>
      </div>
      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onAddTask={handleAddTask}
        goals={goals}
      />
      <EditTaskDialog
        task={editingTask}
        isOpen={!!editingTask}
        onOpenChange={(isOpen) => !isOpen && setEditingTask(null)}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        goals={goals}
      />
    </main>
  );
}
