// src/components/dashboard/task-column.tsx
"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { FinancialTask, TaskStatus } from "@/lib/placeholder-data";
import { TaskCard } from "./task-card";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: FinancialTask[];
  onEditTask: (task: FinancialTask) => void;
}

export function TaskColumn({ status, tasks, onEditTask }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div ref={setNodeRef} className="bg-muted/50 rounded-lg p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-center">{status}</h3>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4 flex-grow">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg h-full flex items-center justify-center">
              <p>Drop tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
