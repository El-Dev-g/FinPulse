// src/components/dashboard/task-card.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { FinancialTask } from "@/lib/placeholder-data";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: FinancialTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className={cn("p-4 group relative", isDragging && "shadow-lg")}>
         <div
          {...listeners}
          className="absolute top-1/2 -left-4 -translate-y-1/2 p-2 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <p className="font-medium">{task.title}</p>
        {task.dueDate && (
          <p className="text-xs text-muted-foreground mt-1">
            Due: {task.dueDate}
          </p>
        )}
      </Card>
    </div>
  );
}
