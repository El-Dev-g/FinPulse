
// src/components/dashboard/add-project-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import type { Project } from "@/lib/types";
import { generateProjectImage } from "@/ai/flows/generate-project-image";

interface AddProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddProject: (newProject: Omit<Project, "id" | "createdAt">) => Promise<void>;
}

export function AddProjectDialog({
  isOpen,
  onOpenChange,
  onAddProject,
}: AddProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTargetAmount("");
    setLoading(false);
    setError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !targetAmount) {
      setError("Please fill out at least the name and target amount.");
      return;
    }
    
    const numTargetAmount = parseFloat(targetAmount);
    if (isNaN(numTargetAmount) || numTargetAmount <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    setLoading(true);

    try {
      // Generate AI image first
      const { imageUrl } = await generateProjectImage({ projectName: name });

      await onAddProject({
        name,
        description,
        targetAmount: numTargetAmount,
        currentAmount: 0,
        imageUrl,
        status: 'active',
      });
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error("Failed to add project:", err);
      setError("Failed to add project. The AI image generator may be unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New Project</DialogTitle>
            <DialogDescription>
              Start planning your next big financial milestone. An AI-generated image will be created for you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Kitchen Renovation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="project-target">Target Amount</Label>
              <Input
                id="project-target"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="e.g., 20000"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Generating Image...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
