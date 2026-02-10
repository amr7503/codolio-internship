"use client";

import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Download,
  Search,
  Undo2,
  Redo2,
  ChevronDown,
  FileJson,
  FileText,
  Printer,
} from "lucide-react";
import { useQuestionStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { setCommandPaletteOpen, undo, redo, topics, historyIndex, history } =
    useQuestionStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(topics, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question-sheet.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    let csv = "Topic,Sub-topic,Question,Difficulty,Completed,Link\n";
    for (const topic of topics) {
      for (const st of topic.subTopics) {
        for (const q of st.questions) {
          csv += `"${topic.title}","${st.title}","${q.title}","${q.difficulty}","${q.completed}","${q.link}"\n`;
        }
      }
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question-sheet.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <span className="text-sm font-bold text-white">C</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
          </div>
          <h1 className="text-lg font-bold font-heading text-foreground">
            CodolioSheet
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Search trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Search...</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground sm:flex">
              <span className="text-xs">{"⌘"}</span>K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandPaletteOpen(true)}
            className="sm:hidden text-muted-foreground"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="text-muted-foreground hover:text-foreground"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="text-muted-foreground hover:text-foreground"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline text-xs">Export</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={exportJSON}>
                <FileJson className="h-4 w-4 mr-2" />
                Export JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 hover:rotate-90" />
              ) : (
                <Moon className="h-4 w-4 transition-transform duration-300" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
