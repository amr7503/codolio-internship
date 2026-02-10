import { create } from "zustand";
import type {
  Topic,
  Question,
  Difficulty,
  ViewMode,
  FilterMode,
  SortMode,
} from "./types";

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const STORAGE_KEY = "codoliosheet-data";

interface QuestionStore {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  viewMode: ViewMode;
  filterMode: FilterMode;
  sortMode: SortMode;
  commandPaletteOpen: boolean;
  history: { topics: Topic[]; desc: string }[];
  historyIndex: number;

  setSearchQuery: (q: string) => void;
  setViewMode: (m: ViewMode) => void;
  setFilterMode: (m: FilterMode) => void;
  setSortMode: (m: SortMode) => void;
  setCommandPaletteOpen: (open: boolean) => void;

  addTopic: (title: string) => void;
  updateTopic: (id: string, title: string) => void;
  deleteTopic: (id: string) => void;
  toggleTopicExpanded: (id: string) => void;
  moveTopicUp: (id: string) => void;
  moveTopicDown: (id: string) => void;
  reorderTopics: (activeId: string, overId: string) => void;

  addSubTopic: (topicId: string, title: string) => void;
  updateSubTopic: (topicId: string, subTopicId: string, title: string) => void;
  deleteSubTopic: (topicId: string, subTopicId: string) => void;
  reorderSubTopics: (topicId: string, activeId: string, overId: string) => void;

  addQuestion: (topicId: string, subTopicId: string, question: Partial<Question>) => void;
  deleteQuestion: (topicId: string, subTopicId: string, questionId: string) => void;
  toggleQuestion: (topicId: string, subTopicId: string, questionId: string) => boolean;
  updateQuestion: (topicId: string, subTopicId: string, questionId: string, updates: Partial<Question>) => void;
  reorderQuestions: (topicId: string, subTopicId: string, activeId: string, overId: string) => void;

  markAllComplete: (topicId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

  undo: () => void;
  redo: () => void;

  getStats: () => {
    totalTopics: number;
    totalSubTopics: number;
    totalQuestions: number;
    completedQuestions: number;
    completionRate: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  };

  initialize: () => void;
}

function save(topics: Topic[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  } catch { }
}

function pushHist(get: () => QuestionStore, set: (s: Partial<QuestionStore>) => void, desc: string) {
  const { topics, history, historyIndex } = get();
  const newHist = history.slice(0, historyIndex + 1);
  newHist.push({ topics: JSON.parse(JSON.stringify(topics)), desc });
  if (newHist.length > 30) newHist.shift();
  set({ history: newHist, historyIndex: newHist.length - 1 });
}

const TOPIC_COLORS = [
  "#f97316", "#ea580c", "#fb923c", "#d97706", "#f59e0b",
  "#ef4444", "#e11d48", "#ec4899", "#10b981", "#14b8a6",
  "#3b82f6", "#6366f1", "#8b5cf6", "#c2410c", "#f43f5e",
];

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  topics: [],
  loading: true,
  error: null,
  searchQuery: "",
  viewMode: "list",
  filterMode: "all",
  sortMode: "custom",
  commandPaletteOpen: false,
  history: [],
  historyIndex: -1,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setViewMode: (viewMode) => set({ viewMode }),
  setFilterMode: (filterMode) => set({ filterMode }),
  setSortMode: (sortMode) => set({ sortMode }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

  addTopic: (title) => {
    pushHist(get, set, "Add topic");
    const idx = get().topics.length;
    const t: Topic = {
      id: generateId(),
      title,
      color: TOPIC_COLORS[idx % TOPIC_COLORS.length],
      subTopics: [],
      expanded: true,
    };
    const topics = [...get().topics, t];
    set({ topics });
    save(topics);
  },

  deleteTopic: (id) => {
    pushHist(get, set, "Delete topic");
    const topics = get().topics.filter((t) => t.id !== id);
    set({ topics });
    save(topics);
  },

  toggleTopicExpanded: (id) => {
    set({ topics: get().topics.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t)) });
  },

  moveTopicUp: (id) => {
    const topics = [...get().topics];
    const idx = topics.findIndex((t) => t.id === id);
    if (idx <= 0) return;
    pushHist(get, set, "Move topic up");
    [topics[idx - 1], topics[idx]] = [topics[idx], topics[idx - 1]];
    set({ topics });
    save(topics);
  },

  moveTopicDown: (id) => {
    const topics = [...get().topics];
    const idx = topics.findIndex((t) => t.id === id);
    if (idx < 0 || idx >= topics.length - 1) return;
    pushHist(get, set, "Move topic down");
    [topics[idx], topics[idx + 1]] = [topics[idx + 1], topics[idx]];
    set({ topics });
    save(topics);
  },

  updateTopic: (id, title) => {
    pushHist(get, set, "Update topic");
    const topics = get().topics.map((t) =>
      t.id === id ? { ...t, title: title.trim() } : t
    );
    set({ topics });
    save(topics);
  },

  reorderTopics: (activeId, overId) => {
    if (activeId === overId) return;
    pushHist(get, set, "Reorder topics");
    const topics = [...get().topics];
    const activeIndex = topics.findIndex((t) => t.id === activeId);
    const overIndex = topics.findIndex((t) => t.id === overId);
    if (activeIndex === -1 || overIndex === -1) return;

    const [movedTopic] = topics.splice(activeIndex, 1);
    topics.splice(overIndex, 0, movedTopic);

    set({ topics });
    save(topics);
  },

  addSubTopic: (topicId, title) => {
    pushHist(get, set, "Add sub-topic");
    const topics = get().topics.map((t) =>
      t.id === topicId
        ? { ...t, subTopics: [...t.subTopics, { id: generateId(), title, questions: [] }] }
        : t
    );
    set({ topics });
    save(topics);
  },

  deleteSubTopic: (topicId, subTopicId) => {
    pushHist(get, set, "Delete sub-topic");
    const topics = get().topics.map((t) =>
      t.id === topicId
        ? { ...t, subTopics: t.subTopics.filter((st) => st.id !== subTopicId) }
        : t
    );
    set({ topics });
    save(topics);
  },

  updateSubTopic: (topicId, subTopicId, title) => {
    pushHist(get, set, "Update sub-topic");
    const topics = get().topics.map((t) =>
      t.id === topicId
        ? {
          ...t,
          subTopics: t.subTopics.map((st) =>
            st.id === subTopicId ? { ...st, title: title.trim() } : st
          ),
        }
        : t
    );
    set({ topics });
    save(topics);
  },

  reorderSubTopics: (topicId, activeId, overId) => {
    if (activeId === overId) return;
    pushHist(get, set, "Reorder sub-topics");
    const topics = get().topics.map((t) => {
      if (t.id !== topicId) return t;

      const subTopics = [...t.subTopics];
      const activeIndex = subTopics.findIndex((st) => st.id === activeId);
      const overIndex = subTopics.findIndex((st) => st.id === overId);
      if (activeIndex === -1 || overIndex === -1) return t;

      const [movedSubTopic] = subTopics.splice(activeIndex, 1);
      subTopics.splice(overIndex, 0, movedSubTopic);

      return { ...t, subTopics };
    });
    set({ topics });
    save(topics);
  },

  addQuestion: (topicId, subTopicId, question) => {
    pushHist(get, set, "Add question");
    const newQ: Question = {
      id: generateId(),
      title: question.title || "New Question",
      difficulty: question.difficulty || "medium",
      link: question.link || "",
      resource: question.resource || "",
      platform: question.platform || "",
      completed: false,
      notes: question.notes || "",
    };
    const topics = get().topics.map((t) =>
      t.id === topicId
        ? {
          ...t,
          subTopics: t.subTopics.map((st) =>
            st.id === subTopicId ? { ...st, questions: [...st.questions, newQ] } : st
          ),
        }
        : t
    );
    set({ topics });
    save(topics);
  },

  deleteQuestion: (topicId, subTopicId, questionId) => {
    pushHist(get, set, "Delete question");
    const topics = get().topics.map((t) =>
      t.id === topicId
        ? {
          ...t,
          subTopics: t.subTopics.map((st) =>
            st.id === subTopicId
              ? { ...st, questions: st.questions.filter((qq) => qq.id !== questionId) }
              : st
          ),
        }
        : t
    );
    set({ topics });
    save(topics);
  },

  toggleQuestion: (topicId, subTopicId, questionId) => {
    let wasCompleted = false;
    const topics = get().topics.map((t) =>
      t.id === topicId
        ? {
          ...t,
          subTopics: t.subTopics.map((st) =>
            st.id === subTopicId
              ? {
                ...st,
                questions: st.questions.map((qq) => {
                  if (qq.id === questionId) {
                    wasCompleted = !qq.completed;
                    return { ...qq, completed: !qq.completed };
                  }
                  return qq;
                }),
              }
              : st
          ),
        }
        : t
    );
    set({ topics });
    save(topics);
    return wasCompleted;
  },

  updateQuestion: (topicId, subTopicId, questionId, updates) => {
    const topics = get().topics.map((t) =>
      t.id === topicId
        ? {
          ...t,
          subTopics: t.subTopics.map((st) =>
            st.id === subTopicId
              ? {
                ...st,
                questions: st.questions.map((qq) =>
                  qq.id === questionId ? { ...qq, ...updates } : qq
                ),
              }
              : st
          ),
        }
        : t
    );
    set({ topics });
    save(topics);
  },

  reorderQuestions: (topicId, subTopicId, activeId, overId) => {
    if (activeId === overId) return;
    pushHist(get, set, "Reorder questions");
    const topics = get().topics.map((t) => {
      if (t.id !== topicId) return t;

      return {
        ...t,
        subTopics: t.subTopics.map((st) => {
          if (st.id !== subTopicId) return st;

          const questions = [...st.questions];
          const activeIndex = questions.findIndex((q) => q.id === activeId);
          const overIndex = questions.findIndex((q) => q.id === overId);
          if (activeIndex === -1 || overIndex === -1) return st;

          const [movedQuestion] = questions.splice(activeIndex, 1);
          questions.splice(overIndex, 0, movedQuestion);

          return { ...st, questions };
        }),
      };
    });
    set({ topics });
    save(topics);
  },

  markAllComplete: (topicId) => {
    pushHist(get, set, "Mark all complete");
    const topics = get().topics.map((t) =>
      t.id === topicId
        ? {
          ...t,
          subTopics: t.subTopics.map((st) => ({
            ...st,
            questions: st.questions.map((qq) => ({ ...qq, completed: true })),
          })),
        }
        : t
    );
    set({ topics });
    save(topics);
  },

  expandAll: () => set({ topics: get().topics.map((t) => ({ ...t, expanded: true })) }),
  collapseAll: () => set({ topics: get().topics.map((t) => ({ ...t, expanded: false })) }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const i = historyIndex - 1;
      const topics = JSON.parse(JSON.stringify(history[i].topics));
      set({ topics, historyIndex: i });
      save(topics);
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const i = historyIndex + 1;
      const topics = JSON.parse(JSON.stringify(history[i].topics));
      set({ topics, historyIndex: i });
      save(topics);
    }
  },

  getStats: () => {
    const { topics } = get();
    let totalSubTopics = 0;
    let totalQuestions = 0;
    let completedQuestions = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    for (const topic of topics) {
      totalSubTopics += topic.subTopics.length;
      for (const st of topic.subTopics) {
        for (const qq of st.questions) {
          totalQuestions++;
          if (qq.completed) completedQuestions++;
          if (qq.difficulty === "easy") easyCount++;
          else if (qq.difficulty === "medium") mediumCount++;
          else hardCount++;
        }
      }
    }

    return {
      totalTopics: topics.length,
      totalSubTopics,
      totalQuestions,
      completedQuestions,
      completionRate: totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0,
      easyCount,
      mediumCount,
      hardCount,
    };
  },

  initialize: () => {

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ topics: parsed, loading: false });
          pushHist(get, set, "Load from storage");
          return;
        }
      }
    } catch { }


    set({ loading: true });
    fetch("/api/sheet")
      .then((res) => res.json())
      .then((data) => {
        if (data.topics && data.topics.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const topics: Topic[] = data.topics.map((t: any, tIdx: number) => ({
            id: generateId(),
            title: t.title,
            color: t.color || TOPIC_COLORS[tIdx % TOPIC_COLORS.length],
            expanded: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            subTopics: (t.subTopics || []).map((st: any) => ({
              id: generateId(),
              title: st.title,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions: (st.questions || []).map((q: any) => ({
                id: generateId(),
                title: q.title || "Untitled",
                difficulty: (q.difficulty || "medium") as Difficulty,
                link: q.link || "",
                resource: q.resource || "",
                platform: q.platform || "",
                completed: false,
                notes: "",
              })),
            })),
          }));
          set({ topics, loading: false });
          pushHist(get, set, "Initial load from sheet");
          save(topics);
        } else {
          set({ topics: [], loading: false, error: "No data found" });
        }
      })
      .catch((err) => {
        console.error("Failed to load sheet:", err);
        set({ topics: [], loading: false, error: "Failed to load data" });
      });
  },
}));
