"use client";

import { useState, useCallback } from "react";
import {
  ExternalLink,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  StickyNote,
  Video,
} from "lucide-react";
import type { Question } from "@/lib/types";
import { useQuestionStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuestionItemProps {
  question: Question;
  topicId: string;
  subTopicId: string;
}

const difficultyConfig = {
  easy: {
    label: "Easy",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  },
  hard: {
    label: "Hard",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
};

export function QuestionItem({ question, topicId, subTopicId }: QuestionItemProps) {
  const { toggleQuestion, deleteQuestion, updateQuestion } = useQuestionStore();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(question.notes);

  const handleToggle = useCallback(() => {
    toggleQuestion(topicId, subTopicId, question.id);
  }, [toggleQuestion, topicId, subTopicId, question.id]);

  const handleSaveNotes = useCallback(() => {
    updateQuestion(topicId, subTopicId, question.id, { notes });
    setShowNotes(false);
  }, [updateQuestion, topicId, subTopicId, question.id, notes]);

  const config = difficultyConfig[question.difficulty] || difficultyConfig.medium;

  return (
    <div className="group">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
          "hover:bg-muted/50",
          question.completed && "opacity-60"
        )}
      >
        <button
          onClick={handleToggle}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-300",
            question.completed
              ? "border-orange-500 bg-orange-500"
              : "border-muted-foreground/30 hover:border-orange-400"
          )}
          aria-label={`Mark "${question.title}" as ${question.completed ? "incomplete" : "complete"}`}
        >
          {question.completed && (
            <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </button>

        <span
          className={cn(
            "flex-1 text-sm text-foreground transition-all duration-300 min-w-0 truncate",
            question.completed && "line-through text-muted-foreground"
          )}
        >
          {question.title}
        </span>

        {question.platform && (
          <span className="hidden lg:inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {question.platform}
          </span>
        )}

        <span className={cn("hidden sm:inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium", config.className)}>
          {config.label}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {question.resource && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-orange-500" asChild>
              <a href={question.resource} target="_blank" rel="noopener noreferrer" aria-label={`Watch resource for "${question.title}"`}>
                <Video className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {question.link && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-orange-500" asChild>
              <a href={question.link} target="_blank" rel="noopener noreferrer" aria-label={`Open link for "${question.title}"`}>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowNotes(!showNotes)}>
            <StickyNote className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => deleteQuestion(topicId, subTopicId, question.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showNotes && (
        <div className="ml-8 mr-3 mt-1 mb-2">
          <div className="flex items-start gap-2">
            <ChevronDown className="h-3 w-3 text-muted-foreground mt-2 shrink-0" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              className="flex-1 min-h-[60px] rounded-lg border bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 mt-1.5">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowNotes(false)}>
              Cancel
            </Button>
            <Button size="sm" className="h-7 text-xs gradient-primary text-white border-0" onClick={handleSaveNotes}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
