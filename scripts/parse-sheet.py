import json
import os
import glob

# Find the sheet json file
sheet_path = None
for pattern in [
    "/vercel/share/v0-project/scripts/sheet.json",
    "/vercel/share/v0-project/scripts/sheet-*.json",
]:
    matches = glob.glob(pattern)
    if matches:
        sheet_path = matches[0]
        break

if not sheet_path:
    # Try to find it anywhere
    for root, dirs, files in os.walk("/vercel/share/v0-project"):
        for f in files:
            if f.startswith("sheet") and f.endswith(".json"):
                sheet_path = os.path.join(root, f)
                break

print(f"Looking for sheet at: {sheet_path}")
print(f"File exists: {os.path.exists(sheet_path) if sheet_path else False}")

# List what's in scripts dir
scripts_dir = "/vercel/share/v0-project/scripts"
if os.path.exists(scripts_dir):
    print(f"Scripts dir contents: {os.listdir(scripts_dir)}")

# Also check current working dir
print(f"CWD: {os.getcwd()}")
print(f"CWD contents: {os.listdir('.')}")

if not sheet_path or not os.path.exists(sheet_path):
    print("ERROR: sheet.json not found!")
    exit(1)

with open(sheet_path, "r") as f:
    raw = json.load(f)

questions = raw["data"]["questions"]
print(f"Total raw questions: {len(questions)}")

# Build topic -> subTopic -> questions hierarchy
from collections import OrderedDict

topic_map = OrderedDict()

TOPIC_COLORS = [
    "#f97316", "#ea580c", "#fb923c", "#c2410c", "#f59e0b",
    "#d97706", "#ef4444", "#f43f5e", "#e11d48", "#ec4899",
    "#10b981", "#14b8a6", "#3b82f6", "#6366f1", "#8b5cf6",
    "#f97316", "#ea580c", "#fb923c", "#c2410c", "#f59e0b",
    "#d97706", "#ef4444", "#f43f5e", "#e11d48", "#ec4899",
    "#10b981", "#14b8a6",
]

for q in questions:
    topic_name = q.get("topic", "Uncategorized")
    sub_topic_name = q.get("subTopic", "General")
    
    if topic_name not in topic_map:
        topic_map[topic_name] = OrderedDict()
    sub_map = topic_map[topic_name]
    if sub_topic_name not in sub_map:
        sub_map[sub_topic_name] = []
    
    qid = q.get("questionId") or {}
    difficulty_raw = (qid.get("difficulty") or "Medium").lower()
    if difficulty_raw in ("easy", "basic"):
        difficulty = "easy"
    elif difficulty_raw == "hard":
        difficulty = "hard"
    else:
        difficulty = "medium"
    
    sub_map[sub_topic_name].append({
        "title": q.get("title", "Untitled"),
        "difficulty": difficulty,
        "link": qid.get("problemUrl", ""),
        "resource": q.get("resource", ""),
        "platform": qid.get("platform", ""),
    })

result = []
color_idx = 0
for topic_name, sub_map in topic_map.items():
    sub_topics = []
    for sub_name, qs in sub_map.items():
        sub_topics.append({
            "title": sub_name,
            "questions": qs,
        })
    result.append({
        "title": topic_name,
        "color": TOPIC_COLORS[color_idx % len(TOPIC_COLORS)],
        "subTopics": sub_topics,
    })
    color_idx += 1

total_q = 0
for t in result:
    tq = sum(len(st["questions"]) for st in t["subTopics"])
    print(f"  {t['title']}: {len(t['subTopics'])} sub-topics, {tq} questions")
    total_q += tq

print(f"\nTotal: {len(result)} topics, {total_q} questions")

# Generate TypeScript
lines = []
lines.append("// Auto-generated from sheet.json - Do not edit manually\n")
lines.append("export interface SheetQuestion {")
lines.append("  title: string;")
lines.append("  difficulty: \"easy\" | \"medium\" | \"hard\";")
lines.append("  link: string;")
lines.append("  resource: string;")
lines.append("  platform: string;")
lines.append("}\n")
lines.append("export interface SheetSubTopic {")
lines.append("  title: string;")
lines.append("  questions: SheetQuestion[];")
lines.append("}\n")
lines.append("export interface SheetTopic {")
lines.append("  title: string;")
lines.append("  color: string;")
lines.append("  subTopics: SheetSubTopic[];")
lines.append("}\n")
lines.append(f"export const SHEET_DATA: SheetTopic[] = {json.dumps(result, indent=2)};")

output = "\n".join(lines) + "\n"

out_path = "/vercel/share/v0-project/lib/sheet-data.ts"
with open(out_path, "w") as f:
    f.write(output)

print(f"\nWritten to {out_path} ({len(output)} bytes)")
