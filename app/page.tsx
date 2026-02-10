"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  FolderTree,
  HelpCircle,
  Target,
  Plus,
  List,
  LayoutGrid,
  AlignJustify,
  ChevronsUpDown,
  ChevronsDownUp,
  X,
  Sparkles,
} from "lucide-react";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useQuestionStore } from "@/lib/store";
import { Navbar } from "@/components/navbar";
import { StatCard } from "@/components/stat-card";
import { SortableTopicCard } from "@/components/sortable-topic-card";
import { CommandPalette } from "@/components/command-palette";
import { AddTopicModal } from "@/components/add-topic-modal";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function Page() {
  const {
    topics,
    loading,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filterMode,
    setFilterMode,
    sortMode,
    setSortMode,
    initialize,
    expandAll,
    collapseAll,
    getStats,
    undo,
    redo,
    reorderTopics,
  } = useQuestionStore();

  const [addTopicOpen, setAddTopicOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTopics(active.id as string, over.id as string);
    }
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setAddTopicOpen(true);
      }
      if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const stats = useMemo(() => getStats(), [getStats, topics]);

  const sortedTopics = useMemo(() => {
    const sorted = [...topics];
    switch (sortMode) {
      case "a-z":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "progress": {
        const getProgress = (t: (typeof topics)[0]) => {
          let total = 0;
          let done = 0;
          for (const st of t.subTopics) {
            for (const qq of st.questions) {
              total++;
              if (qq.completed) done++;
            }
          }
          return total > 0 ? done / total : 0;
        };
        sorted.sort((a, b) => getProgress(b) - getProgress(a));
        break;
      }
      default:
        break;
    }
    return sorted;
  }, [topics, sortMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CommandPalette />
      <AddTopicModal open={addTopicOpen} onOpenChange={setAddTopicOpen} />

      <main className="mx-auto max-w-7xl px-4 lg:px-6 py-6 lg:py-8">
        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8" aria-label="Statistics">
          <StatCard label="Topics" value={stats.totalTopics} icon={BookOpen} color="#6366f1" />
          <StatCard label="Sub-topics" value={stats.totalSubTopics} icon={FolderTree} color="#8b5cf6" />
          <StatCard label="Questions" value={stats.totalQuestions} icon={HelpCircle} color="#ec4899" />
          <StatCard label="Completed" value={stats.completionRate} suffix="%" icon={Target} color="#10b981" />
        </section>

        {/* Controls */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <Button
            onClick={() => setAddTopicOpen(true)}
            className="gradient-primary text-white border-0 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Add New Topic
          </Button>

          <div className="relative flex-1 max-w-xs">
            <Input
              placeholder="Filter questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 pr-8 h-9 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
              {([
                { mode: "list" as const, icon: List, label: "List view" },
                { mode: "kanban" as const, icon: LayoutGrid, label: "Grid view" },
                { mode: "compact" as const, icon: AlignJustify, label: "Compact view" },
              ] as const).map(({ mode, icon: ViewIcon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200",
                    viewMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={label}
                >
                  <ViewIcon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            <Select value={filterMode} onValueChange={(v) => setFilterMode(v as typeof filterMode)}>
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortMode} onValueChange={(v) => setSortMode(v as typeof sortMode)}>
              <SelectTrigger className="h-8 w-[100px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="a-z">A-Z</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={expandAll} className="h-8 w-8 text-muted-foreground" title="Expand all">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={collapseAll} className="h-8 w-8 text-muted-foreground" title="Collapse all">
              <ChevronsDownUp className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Difficulty bar */}
        {stats.totalQuestions > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Easy ({stats.easyCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">Medium ({stats.mediumCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Hard ({stats.hardCount})</span>
              </div>
              <span className="ml-auto text-xs font-medium text-foreground">
                {stats.completedQuestions}/{stats.totalQuestions} done
              </span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(stats.easyCount / stats.totalQuestions) * 100}%` }} />
              <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(stats.mediumCount / stats.totalQuestions) * 100}%` }} />
              <div className="bg-red-500 transition-all duration-500" style={{ width: `${(stats.hardCount / stats.totalQuestions) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Topics */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedTopics.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <section
              className={cn(
                "flex flex-col gap-4",
                viewMode === "kanban" && "sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4",
                viewMode === "compact" && "gap-2"
              )}
              aria-label="Topics"
            >
              {sortedTopics.map((topic, index) => (
                <SortableTopicCard
                  key={topic.id}
                  topic={topic}
                  filterMode={filterMode}
                  searchQuery={searchQuery}
                  isFirst={index === 0}
                  isLast={index === sortedTopics.length - 1}
                />
              ))}
            </section>
          </SortableContext>
        </DndContext>

        {topics.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 dark:bg-indigo-950/30">
              <BookOpen className="h-10 w-10 text-indigo-500" />
            </div>
            <h2 className="text-xl font-semibold font-heading text-foreground mb-2">No topics yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {"Create your first topic to start organizing your interview preparation questions."}
            </p>
            <Button onClick={() => setAddTopicOpen(true)} className="gradient-primary text-white border-0" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </div>
        )}

        <footer className="mt-16 pb-8 text-center">
          <p className="text-xs text-muted-foreground">
            CodolioSheet &middot; DSA Interview Preparation Tracker &middot; {stats.totalQuestions} questions tracked
          </p>
        </footer>
      </main>
    </div>
  );
}
