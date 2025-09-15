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
  goals: Goal[];
  projects: ClientProject[];
  onEdit: (task: FinancialTask) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

interface TaskSectionColumnProps {
    title: string;
    tasks: FinancialTask[];
    goals: Goal[];
    projects: ClientProject[];
    onEdit: (task: FinancialTask) => void;
    onStatusChange: (taskId: string, status: TaskStatus) => void;
    isOverdue?: boolean;
}

function TaskSectionColumn({ title, tasks, goals, projects, onEdit, onStatusChange, isOverdue = false }: TaskSectionColumnProps) {
    const { setNodeRef } = useDroppable({ id: title });

    // Only render the column if it has tasks, except for the "Done" column which should always be visible.
    if (tasks.length === 0 && title !== 'Done') {
        return null;
    }

    const isDoneColumn = title === 'Done';

    return (
        <div className="space-y-4">
            <h3 className="text-base font-semibold text-muted-foreground px-1">{title} ({tasks.length})</h3>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div ref={setNodeRef} className="space-y-3 p-1 rounded-md min-h-12 bg-background">
                    {tasks.map(task => {
                        const goal = task.goalId ? goals.find(g => g.id === task.goalId) : null;
                        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                        return (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                goal={goal} 
                                project={project}
                                onEdit={onEdit}
                                onStatusChange={onStatusChange}
                                isOverdue={isOverdue}
                            />
                        )
                    })}
                     {isDoneColumn && tasks.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg min-h-24 flex items-center justify-center">
                            <p>Completed tasks appear here</p>
                        </div>
                    )}
                </div>
            </SortableContext>
           
        </div>
    )
}


export function TaskBoard({ sections, goals, projects, onEdit, onStatusChange }: TaskBoardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-8">
        {/* Main Columns */}
        <div className="space-y-6">
             <TaskSectionColumn 
                title="Overdue" 
                tasks={sections["Overdue"]}
                goals={goals}
                projects={projects}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
                isOverdue
             />
             <TaskSectionColumn 
                title="Today" 
                tasks={sections["Today"]}
                goals={goals}
                projects={projects}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
             />
        </div>
        <div className="space-y-6">
             <TaskSectionColumn 
                title="Upcoming" 
                tasks={sections["Upcoming"]}
                goals={goals}
                projects={projects}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
             />
        </div>
        <div className="space-y-6">
            <TaskSectionColumn 
                title="Other" 
                tasks={sections["Other"]}
                goals={goals}
                projects={projects}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
            />
        </div>
        <div className="space-y-6 bg-muted/30 p-4 rounded-lg">
             <TaskSectionColumn 
                title="Done" 
                tasks={sections["Done"]}
                goals={goals}
                projects={projects}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
             />
        </div>
    </div>
  );
}
