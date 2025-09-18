
// src/components/dashboard/task-board.tsx
"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { FinancialTask, TaskStatus, Goal, ClientProject } from "@/lib/types";
import { TaskCard } from "./task-card";

type TaskSection = {
    [key: string]: FinancialTask[];
}

interface TaskBoardProps {
  sections: TaskSection;
  projects: ClientProject[];
  onEdit: (task: FinancialTask) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

interface TaskSectionColumnProps {
    title: string;
    tasks: FinancialTask[];
    projects: ClientProject[];
    onEdit: (task: FinancialTask) => void;
    onStatusChange: (taskId: string, status: TaskStatus) => void;
    isOverdue?: boolean;
}

function TaskSectionColumn({ title, tasks, projects, onEdit, onStatusChange, isOverdue = false }: TaskSectionColumnProps) {
    const { setNodeRef } = useDroppable({ id: title });

    const isDoneColumn = title === 'Done';

    return (
        <div className="flex-shrink-0 w-full">
            <h3 className="text-base font-semibold text-muted-foreground px-1">{title} ({tasks.length})</h3>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div ref={setNodeRef} className="space-y-3 p-1 rounded-md min-h-12 bg-transparent mt-2">
                    {tasks.map(task => {
                        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                        return (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                project={project}
                                onEdit={onEdit}
                                onStatusChange={onStatusChange}
                                isOverdue={isOverdue}
                            />
                        )
                    })}
                     {tasks.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg min-h-24 flex items-center justify-center">
                            <p>{isDoneColumn ? 'Completed tasks appear here' : 'No tasks in this section'}</p>
                        </div>
                    )}
                </div>
            </SortableContext>
           
        </div>
    )
}


export function TaskBoard({ sections, projects, onEdit, onStatusChange }: TaskBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 w-full">
        {Object.entries(sections).map(([title, tasks]) => (
            <TaskSectionColumn 
                key={title}
                title={title} 
                tasks={tasks}
                projects={projects}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
                isOverdue={title === "Overdue"}
             />
        ))}
    </div>
  );
}
