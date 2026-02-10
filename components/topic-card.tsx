"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  Hash,
  GripVertical,
} from "lucide-react";
import type { Topic } from "@/lib/types";
import { useQuestionStore } from "@/lib/store";
import { QuestionItem } from "./question-item";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface TopicCardProps {
  topic: Topic;
  filterMode: string;
  searchQuery: string;
  isFirst: boolean;
  isLast: boolean;
  dragHandleProps?: any;
}

export function TopicCard({ topic, filterMode, searchQuery, isFirst, isLast, dragHandleProps }: TopicCardProps) {
  const {
    toggleTopicExpanded,
    deleteTopic,
    updateTopic,
    addSubTopic,
    updateSubTopic,
    deleteSubTopic,
    markAllComplete,
    addQuestion,
  } = useQuestionStore();

  const [addingSubTopic, setAddingSubTopic] = useState(false);
  const [newSubTopicTitle, setNewSubTopicTitle] = useState("");
  const [addingQuestionTo, setAddingQuestionTo] = useState<string | null>(null);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [editingTopic, setEditingTopic] = useState(false);
  const [editTopicTitle, setEditTopicTitle] = useState(topic.title);
  const [editingSubTopic, setEditingSubTopic] = useState<string | null>(null);
  const [editSubTopicTitle, setEditSubTopicTitle] = useState("");

  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const st of topic.subTopics) {
      for (const qq of st.questions) {
        total++;
        if (qq.completed) completed++;
      }
    }
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [topic.subTopics]);

  const filteredSubTopics = useMemo(() => {
    return topic.subTopics
      .map((st) => {
        let questions = st.questions;
        if (filterMode !== "all") {
          if (filterMode === "completed") questions = questions.filter((qq) => qq.completed);
          else if (filterMode === "incomplete") questions = questions.filter((qq) => !qq.completed);
          else questions = questions.filter((qq) => qq.difficulty === filterMode);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          questions = questions.filter(
            (qq) => qq.title.toLowerCase().includes(q) || st.title.toLowerCase().includes(q)
          );
        }
        return { ...st, questions };
      })
      .filter((st) => st.questions.length > 0 || (searchQuery && st.title.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [topic.subTopics, filterMode, searchQuery]);

  const handleAddSubTopic = useCallback(() => {
    if (newSubTopicTitle.trim()) {
      addSubTopic(topic.id, newSubTopicTitle.trim());
      setNewSubTopicTitle("");
      setAddingSubTopic(false);
      toast.success("Sub-topic added");
    }
  }, [addSubTopic, topic.id, newSubTopicTitle]);

  const handleAddQuestion = useCallback(
    (subTopicId: string) => {
      if (newQuestionTitle.trim()) {
        addQuestion(topic.id, subTopicId, { title: newQuestionTitle.trim() });
        setNewQuestionTitle("");
        setAddingQuestionTo(null);
        toast.success("Question added");
      }
    },
    [addQuestion, topic.id, newQuestionTitle]
  );

  const handleEditTopic = useCallback(() => {
    if (editTopicTitle.trim() && editTopicTitle.trim() !== topic.title) {
      updateTopic(topic.id, editTopicTitle.trim());
      toast.success("Topic updated");
    }
    setEditingTopic(false);
  }, [updateTopic, topic.id, topic.title, editTopicTitle]);

  const handleEditSubTopic = useCallback(
    (subTopicId: string) => {
      if (editSubTopicTitle.trim()) {
        updateSubTopic(topic.id, subTopicId, editSubTopicTitle.trim());
        toast.success("Sub-topic updated");
      }
      setEditingSubTopic(null);
      setEditSubTopicTitle("");
    },
    [updateSubTopic, topic.id, editSubTopicTitle]
  );

  if ((filterMode !== "all" || searchQuery) && filteredSubTopics.length === 0) {
    return null;
  }

  return (
    <div className="group/card relative rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
      <div className="h-1 w-full" style={{ background: topic.color }} />

      <div className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
        {/* Drag handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="flex h-6 w-6 shrink-0 items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover/card:scale-105"
          style={{ background: `${topic.color}15`, color: topic.color }}
        >
          <Hash className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold font-heading text-foreground truncate">{topic.title}</h3>
            {stats.percent === 100 && stats.total > 0 && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Progress value={stats.percent} className="h-1.5 flex-1 max-w-[200px] bg-muted" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {stats.completed}/{stats.total}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setAddingSubTopic(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sub-topic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => markAllComplete(topic.id)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark All Complete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  deleteTopic(topic.id);
                  toast.success("Topic deleted");
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Topic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleTopicExpanded(topic.id)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", topic.expanded && "rotate-180")} />
          </Button>
        </div>
      </div>

      <div className={cn("overflow-hidden", topic.expanded ? "block" : "hidden")}>
        <div className="border-t px-4 py-3 sm:px-5 sm:py-4">
          {(filteredSubTopics.length > 0 ? filteredSubTopics : topic.subTopics).map((subTopic) => (
            <div key={subTopic.id} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2 group/sub">
                <div className="h-4 w-0.5 rounded-full" style={{ background: topic.color }} />
                <h4 className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">{subTopic.title}</h4>
                <span className="text-xs text-muted-foreground shrink-0">
                  {subTopic.questions.filter((qq) => qq.completed).length}/{subTopic.questions.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover/sub:opacity-100 transition-opacity text-muted-foreground"
                  onClick={() => {
                    setAddingQuestionTo(subTopic.id);
                    setNewQuestionTitle("");
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover/sub:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    deleteSubTopic(topic.id, subTopic.id);
                    toast.success("Sub-topic deleted");
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="ml-3 border-l-2 border-muted pl-3">
                {(filterMode !== "all" || searchQuery
                  ? filteredSubTopics.find((fst) => fst.id === subTopic.id)?.questions || subTopic.questions
                  : subTopic.questions
                ).map((question) => (
                  <QuestionItem key={question.id} question={question} topicId={topic.id} subTopicId={subTopic.id} />
                ))}

                {addingQuestionTo === subTopic.id && (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <input
                      type="text"
                      value={newQuestionTitle}
                      onChange={(e) => setNewQuestionTitle(e.target.value)}
                      placeholder="Question title..."
                      className="flex-1 h-8 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddQuestion(subTopic.id);
                        if (e.key === "Escape") setAddingQuestionTo(null);
                      }}
                    />
                    <Button size="sm" className="h-8 text-xs gradient-primary text-white border-0" onClick={() => handleAddQuestion(subTopic.id)}>
                      Add
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setAddingQuestionTo(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {addingSubTopic && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <input
                type="text"
                value={newSubTopicTitle}
                onChange={(e) => setNewSubTopicTitle(e.target.value)}
                placeholder="Sub-topic name..."
                className="flex-1 h-8 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSubTopic();
                  if (e.key === "Escape") setAddingSubTopic(false);
                }}
              />
              <Button size="sm" className="h-8 text-xs gradient-primary text-white border-0" onClick={handleAddSubTopic}>
                Add
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setAddingSubTopic(false)}>
                Cancel
              </Button>
            </div>
          )}

          {topic.subTopics.length === 0 && !addingSubTopic && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">No sub-topics yet</p>
              <Button variant="outline" size="sm" onClick={() => setAddingSubTopic(true)} className="text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add Sub-topic
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
