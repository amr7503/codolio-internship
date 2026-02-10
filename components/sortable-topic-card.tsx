"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { TopicCard } from "./topic-card";
import type { Topic } from "@/lib/types";

interface SortableTopicCardProps {
    topic: Topic;
    filterMode: string;
    searchQuery: string;
    isFirst: boolean;
    isLast: boolean;
}

export function SortableTopicCard({ topic, filterMode, searchQuery, isFirst, isLast }: SortableTopicCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: topic.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group/sortable">
            <TopicCard
                topic={topic}
                filterMode={filterMode}
                searchQuery={searchQuery}
                isFirst={isFirst}
                isLast={isLast}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}
