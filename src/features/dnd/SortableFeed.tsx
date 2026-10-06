"use client";
import { Reorder } from "framer-motion";
import { ContentItem } from "@/types";
import { useReorder } from "./useReorder";
import { ContentCard } from "@/components/cards/ContentCard";
export function SortableFeed({
  items,
  className = "",
}: {
  items: ContentItem[];
  className?: string;
}) {
  const { handleReorder, moveUp, moveDown } = useReorder();
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={handleReorder}
      className={`feed-grid ${className}`}
      aria-label="Reorderable feed"
    >
      {items.map((item, index) => (
        <ContentCard
          key={item.id}
          item={item}
          isDraggable
          onMoveUp={index > 0 ? () => moveUp(index) : undefined}
          onMoveDown={
            index < items.length - 1 ? () => moveDown(index) : undefined
          }
        />
      ))}
    </Reorder.Group>
  );
}
export default SortableFeed;
