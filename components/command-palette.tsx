"use client";

import { useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  FileDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQuestionStore } from "@/lib/store";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    topics,
    setSearchQuery,
    expandAll,
    collapseAll,
  } = useQuestionStore();
  const { theme, setTheme } = useTheme();


  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);


  const allQuestions = useMemo(() => {
    const results: {
      id: string;
      title: string;
      topicTitle: string;
      subTopicTitle: string;
      difficulty: string;
      completed: boolean;
    }[] = [];
    for (const topic of topics) {
      for (const st of topic.subTopics) {
        for (const q of st.questions) {
          results.push({
            id: q.id,
            title: q.title,
            topicTitle: topic.title,
            subTopicTitle: st.title,
            difficulty: q.difficulty,
            completed: q.completed,
          });
        }
      }
    }
    return results;
  }, [topics]);

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput placeholder="Search questions, topics, or actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              setCommandPaletteOpen(false);
            }}
          >
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            Toggle Theme
          </CommandItem>
          <CommandItem
            onSelect={() => {
              expandAll();
              setCommandPaletteOpen(false);
            }}
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Expand All Topics
          </CommandItem>
          <CommandItem
            onSelect={() => {
              collapseAll();
              setCommandPaletteOpen(false);
            }}
          >
            <Minimize2 className="mr-2 h-4 w-4" />
            Collapse All Topics
          </CommandItem>
          <CommandItem
            onSelect={() => {
              const blob = new Blob(
                [JSON.stringify(topics, null, 2)],
                { type: "application/json" }
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "questions.json";
              a.click();
              URL.revokeObjectURL(url);
              setCommandPaletteOpen(false);
            }}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export as JSON
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Topics">
          {topics.slice(0, 10).map((topic) => (
            <CommandItem
              key={topic.id}
              onSelect={() => {
                setSearchQuery(topic.title);
                setCommandPaletteOpen(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {topic.title}
              <span className="ml-auto text-xs text-muted-foreground">
                {topic.subTopics.reduce(
                  (acc, st) => acc + st.questions.length,
                  0
                )}{" "}
                questions
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        {allQuestions.length > 0 && (
          <CommandGroup heading="Questions">
            {allQuestions.slice(0, 20).map((q) => (
              <CommandItem
                key={q.id}
                onSelect={() => {
                  setSearchQuery(q.title);
                  setCommandPaletteOpen(false);
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                <span className="truncate">{q.title}</span>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  {q.topicTitle}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
