export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  title: string;
  difficulty: Difficulty;
  link: string;
  resource: string;
  platform: string;
  completed: boolean;
  notes: string;
}

export interface SubTopic {
  id: string;
  title: string;
  questions: Question[];
}

export interface Topic {
  id: string;
  title: string;
  color: string;
  subTopics: SubTopic[];
  expanded: boolean;
}

export type ViewMode = "list" | "kanban" | "compact";
export type FilterMode = "all" | "easy" | "medium" | "hard" | "completed" | "incomplete";
export type SortMode = "custom" | "a-z" | "progress";
