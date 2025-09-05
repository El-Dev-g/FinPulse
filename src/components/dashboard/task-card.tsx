// src/components/dashboard/task-card.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { FinancialTask, Goal, TaskStatus } from "@/lib/types";
import { GripVertical, Pencil, Target, Check, Circle } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { Button } from "../ui/button";

interface TaskCardProps {
  task: FinancialTask;
  goal?: Goal | null;
  onEdit: (task: FinancialTask) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isOverdue?: boolean;
}

export function TaskCard({ task, goal, onEdit, onStatusChange, isOverdue = false }: TaskCardProps) {
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
  
  const handleCheckboxClick = () => {
    const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
    onStatusChange(task.id, newStatus);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          "p-3 group relative transition-colors pr-4",
          isDragging && "shadow-lg",
          isOverdue && "border-destructive/50 bg-destructive/5 hover:border-destructive"
        )}
      >
        <div className="flex items-start gap-2">
            <button onClick={handleCheckboxClick} className="flex-shrink-0 mt-1">
                {task.status === 'Done' ? (
                     <Check className="h-5 w-5 text-primary" />
                ) : (
                     <Circle className="h-5 w-5 text-muted-foreground/50" />
                )}
            </button>
            <div className="flex-grow">
                <p className={cn("font-medium", task.status === 'Done' && 'line-through text-muted-foreground')}>
                    {task.title}
                </p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 items-center mt-1">
                    {task.dueDate && (
                     <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", isOverdue && !isDragging && "font-semibold text-destructive")}>
                        <span>
                            {new Date(task.dueDate + "T00:00:00").toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            })}
                        </span>
                        {task.dueTime && <span>{formatTime(task.dueTime)}</span>}
                    </div>
                    )}
                    {goal && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Target className="h-3 w-3 text-primary/70"/>
                            <p>{goal.title}</p>
                        </div>
                    )}
                </div>
            </div>
             <div {...listeners} className="p-2 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity flex-shrink-0 -mr-2">
                <GripVertical className="h-4 w-4" />
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground/50 opacity-0 group-hover:opacity-100 flex-shrink-0 -mr-2"
                onClick={() => onEdit(task)}
                >
                <Pencil className="h-4 w-4" />
            </Button>
        </div>
      </Card>
    </div>
  );
}
