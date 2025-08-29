// src/components/dashboard/task-card.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { FinancialTask, Goal } from "@/lib/types";
import { GripVertical, Pencil, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface TaskCardProps {
  task: FinancialTask;
  goal?: Goal | null; // Pass goal as a prop
  onEdit: (task: FinancialTask) => void;
}

export function TaskCard({ task, goal, onEdit }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: {type: 'task', task} });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.7 : 1,
  };


  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          "p-4 group relative",
          isDragging && "shadow-lg"
        )}
      >
        <div
          {...listeners}
          className="absolute top-1/2 -left-4 -translate-y-1/2 p-2 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-7 w-7 text-muted-foreground/50 opacity-0 group-hover:opacity-100"
          onClick={() => onEdit(task)}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <p className="font-medium pr-8">{task.title}</p>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center mt-1">
            {task.dueDate && (
            <p className="text-xs text-muted-foreground">
                Due: {new Date(task.dueDate + "T00:00:00").toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
                })}
            </p>
            )}
            {goal && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Target className="h-3 w-3 text-primary/70"/>
                    <p>{goal.title}</p>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
}
