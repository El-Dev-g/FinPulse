// src/components/dashboard/project-card.tsx
"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { ClientProject } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ArrowRight, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface ProjectCardProps {
  project: ClientProject;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const { formatCurrency } = useAuth();
  const progress = project.targetAmount > 0 ? (project.currentAmount / project.targetAmount) * 100 : 0;

  return (
    <Card>
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
            <Image
                src={project.imageUrl}
                alt={project.name}
                fill
                className="object-cover rounded-t-lg"
                data-ai-hint="project goal"
            />
        </div>
         <div className="flex items-start justify-between p-6 pb-2">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit()}>
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onDelete()} className="text-destructive">
                      Delete Project
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="space-y-2">
          <Progress value={progress} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <p>Progress: {progress.toFixed(0)}%</p>
            <p className="font-medium text-foreground">{formatCurrency(project.currentAmount)} / {formatCurrency(project.targetAmount)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/dashboard/projects/${project.id}`}>
              View Project <ArrowRight className="ml-2" />
            </Link>
          </Button>
      </CardFooter>
    </Card>
  );
}
