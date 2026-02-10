import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

interface RawQuestion {
  title?: string;
  topic?: string;
  subTopic?: string;
  resource?: string;
  questionId?: {
    difficulty?: string;
    problemUrl?: string;
    platform?: string;
  };
}

const TOPIC_COLORS = [
  "#f97316", "#ea580c", "#fb923c", "#d97706", "#f59e0b",
  "#ef4444", "#e11d48", "#ec4899", "#f43f5e", "#c2410c",
  "#10b981", "#14b8a6", "#3b82f6", "#6366f1", "#8b5cf6",
  "#f97316", "#ea580c", "#fb923c", "#d97706", "#f59e0b",
  "#ef4444", "#e11d48", "#ec4899", "#f43f5e", "#c2410c",
  "#10b981", "#14b8a6",
];

export async function GET() {
  try {
    const filePath = join(process.cwd(), "public", "sheet-data.json");
    const raw = JSON.parse(readFileSync(filePath, "utf-8"));
    const questions: RawQuestion[] = raw?.data?.questions || [];

    const topicMap = new Map<string, Map<string, Array<{
      title: string;
      difficulty: string;
      link: string;
      resource: string;
      platform: string;
    }>>>();
    const topicOrder: string[] = [];

    for (const q of questions) {
      const topicName = q.topic || "Uncategorized";
      const subTopicName = q.subTopic || "General";

      if (!topicMap.has(topicName)) {
        topicMap.set(topicName, new Map());
        topicOrder.push(topicName);
      }

      const subMap = topicMap.get(topicName)!;
      if (!subMap.has(subTopicName)) {
        subMap.set(subTopicName, []);
      }

      const diffRaw = (q.questionId?.difficulty || "Medium").toLowerCase();
      let difficulty = "medium";
      if (diffRaw === "easy" || diffRaw === "basic") difficulty = "easy";
      else if (diffRaw === "hard") difficulty = "hard";

      subMap.get(subTopicName)!.push({
        title: q.title || "Untitled",
        difficulty,
        link: q.questionId?.problemUrl || "",
        resource: q.resource || "",
        platform: q.questionId?.platform || "",
      });
    }

    const topics = topicOrder
      .filter((name) => name !== "Uncategorized")
      .map((name, idx) => {
        const subMap = topicMap.get(name)!;
        const subTopics = Array.from(subMap.entries()).map(([stName, qs]) => ({
          title: stName,
          questions: qs,
        }));
        return {
          title: name,
          color: TOPIC_COLORS[idx % TOPIC_COLORS.length],
          subTopics,
        };
      });

    return NextResponse.json({ topics, total: questions.length });
  } catch (err) {
    console.error("Failed to parse sheet:", err);
    return NextResponse.json({ error: "Failed to load sheet data" }, { status: 500 });
  }
}
