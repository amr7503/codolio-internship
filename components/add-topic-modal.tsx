"use client";

import React from "react"

import { useState } from "react";
import { useQuestionStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddTopicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTopicModal({ open, onOpenChange }: AddTopicModalProps) {
  const { addTopic } = useQuestionStore();
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTopic(title.trim());
      setTitle("");
      onOpenChange(false);
      toast.success(`Topic "${title.trim()}" created`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-heading">Add New Topic</DialogTitle>
            <DialogDescription>
              Create a new topic to organize your questions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="topic-title" className="text-sm font-medium">
              Topic Name
            </Label>
            <Input
              id="topic-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dynamic Programming"
              className="mt-1.5"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="gradient-primary text-white border-0"
            >
              Create Topic
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
