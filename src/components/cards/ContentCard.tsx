"use client";
import { Reorder, useDragControls } from "framer-motion";
import { Bookmark, GripVertical, ArrowUpRight, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ContentItem } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/features/favorites/favoritesSlice";
import { setSelectedDetailItem } from "@/features/feed/feedSlice";
import { SafeImage } from "../ui/SafeImage";
export function ContentCard({
  item,
  isDraggable = false,
  onMoveUp,
  onMoveDown,
}: {
  item: ContentItem;
  isDraggable?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const dispatch = useAppDispatch();
  const controls = useDragControls();
  const { t } = useTranslation();
  const saved = useAppSelector((s) =>
    s.favorites.favoriteIds.includes(item.id),
  );
  const body = (
    <article
      className="story-card"
      data-testid="content-card"
      data-item-id={item.id}
    >
      <button
        className="story-image"
        onClick={() => dispatch(setSelectedDetailItem(item))}
        aria-label={`Open ${item.title}`}
      >
        <SafeImage
          src={item.imageUrl}
          alt={item.imageAlt || item.title}
          category={item.category}
          fill
          className="object-cover"
        />
      </button>
      <div className="story-body">
        <div className="story-meta">
          <span className="type-label">
            {t(
              `feed.${item.type === "recommendation" ? "recommendations" : item.type}`,
              item.type,
            )}
          </span>
          <span>•</span>
          <span>{item.category}</span>
        </div>
        <h3>
          <button onClick={() => dispatch(setSelectedDetailItem(item))}>
            {item.title}
          </button>
        </h3>
        <p className="story-summary">{item.summary}</p>
        <div className="story-bottom">
          <span className="story-source">
            {item.source || item.sourceName || "Pulse"}
            {item.type === "news" && item.readTimeMinutes && (
              <span> · {item.readTimeMinutes} min read</span>
            )}
            {item.type === "recommendation" && (
              <span>
                {" "}
                · ★ <span>{item.rating}</span>/10 · By {item.creator}
              </span>
            )}
          </span>
          <div className="story-controls">
            <button
              aria-label="Toggle favorite"
              aria-pressed={saved}
              title={saved ? "Remove from favorites" : "Add to favorites"}
              className={saved ? "saved" : ""}
              onClick={() => dispatch(toggleFavorite(item))}
            >
              <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              className={`cta-button ${item.type === "music" ? "music-cta" : ""}`}
              aria-label={`Read more about ${item.title}`}
              onClick={() => dispatch(setSelectedDetailItem(item))}
            >
              {item.type === "music" ? (
                <>
                  <Play size={12} fill="currentColor" />
                  <span>Play Now</span>
                </>
              ) : (
                <>
                  <span>Read More</span>
                  <ArrowUpRight size={14} />
                </>
              )}
            </button>
            {isDraggable && (
              <button
                className="drag-handle"
                aria-label={`Drag ${item.title}`}
                onPointerDown={(e) => controls.start(e)}
              >
                <GripVertical size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
  return isDraggable ? (
    <Reorder.Item
      as="div"
      value={item}
      dragListener={false}
      dragControls={controls}
      whileDrag={{
        scale: 1.035,
        rotate: -2,
        zIndex: 30,
        boxShadow: "0 24px 55px #0003",
      }}
      style={{ position: "relative", borderRadius: 16 }}
      transition={{ type: "spring", stiffness: 360, damping: 30 }}
    >
      {body}
      <div className="order-actions">
        <button
          disabled={!onMoveUp}
          aria-label={`Move ${item.title} up`}
          onClick={onMoveUp}
        >
          ↑ Move up
        </button>
        <button
          disabled={!onMoveDown}
          aria-label={`Move ${item.title} down`}
          onClick={onMoveDown}
        >
          ↓ Move down
        </button>
      </div>
    </Reorder.Item>
  ) : (
    body
  );
}
export default ContentCard;
