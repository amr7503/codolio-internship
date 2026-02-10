import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(
  readFileSync("/vercel/share/v0-project/scripts/sheet.json", "utf-8")
);

const questions = raw.data.questions;

// Build topic -> subTopic -> questions hierarchy preserving insertion order
const topicMap = new Map();

for (const q of questions) {
  const topicName = q.topic || "Uncategorized";
  const subTopicName = q.subTopic || "General";

  if (!topicMap.has(topicName)) {
    topicMap.set(topicName, new Map());
  }
  const subMap = topicMap.get(topicName);
  if (!subMap.has(subTopicName)) {
    subMap.set(subTopicName, []);
  }

  const difficulty = (q.questionId?.difficulty || "Medium").toLowerCase();
  let normalizedDifficulty = "medium";
  if (difficulty === "easy" || difficulty === "basic") normalizedDifficulty = "easy";
  else if (difficulty === "hard") normalizedDifficulty = "hard";

  subMap.get(subTopicName).push({
    title: q.title,
    difficulty: normalizedDifficulty,
    link: q.questionId?.problemUrl || "",
    resource: q.resource || "",
    platform: q.questionId?.platform || "",
  });
}

const TOPIC_COLORS = [
  "#f97316", "#ea580c", "#fb923c", "#c2410c", "#f59e0b",
  "#d97706", "#ef4444", "#f43f5e", "#e11d48", "#ec4899",
  "#10b981", "#14b8a6", "#3b82f6", "#6366f1", "#8b5cf6",
];

const result = [];
let colorIdx = 0;

for (const [topicName, subMap] of topicMap) {
  const subTopics = [];
  for (const [subTopicName, qs] of subMap) {
    subTopics.push({
      title: subTopicName,
      questions: qs,
    });
  }
  result.push({
    title: topicName,
    color: TOPIC_COLORS[colorIdx % TOPIC_COLORS.length],
    subTopics,
  });
  colorIdx++;
}

console.log("Parsed " + result.length + " topics");
let totalQ = 0;
for (const t of result) {
  let tq = 0;
  for (const st of t.subTopics) tq += st.questions.length;
  console.log("  " + t.title + ": " + t.subTopics.length + " sub-topics, " + tq + " questions");
  totalQ += tq;
}
console.log("Total questions: " + totalQ);

const output = `// Auto-generated from sheet.json - Do not edit manually

export interface SheetQuestion {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  link: string;
  resource: string;
  platform: string;
}

export interface SheetSubTopic {
  title: string;
  questions: SheetQuestion[];
}

export interface SheetTopic {
  title: string;
  color: string;
  subTopics: SheetSubTopic[];
}

export const SHEET_DATA: SheetTopic[] = ${JSON.stringify(result, null, 2)};
`;

writeFileSync("/vercel/share/v0-project/lib/sheet-data.ts", output);
console.log("Written to lib/sheet-data.ts");
