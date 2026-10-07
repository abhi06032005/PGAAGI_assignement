"use client";
import { Reorder, useDragControls } from "framer-motion";
import {
  Bookmark,
  GripVertical,
  ArrowUpRight,
  Play,
  ExternalLink,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ContentItem, MusicItem } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/features/favorites/favoritesSlice";
import { setSelectedDetailItem } from "@/features/feed/feedSlice";
import { playTrack } from "@/features/spotify/spotifySlice";
import { SafeImage } from "../ui/SafeImage";
export function ContentCard({
  item,
  isDraggable = false,
  onMoveUp,
  onMoveDown,
  inCollection = false,
}: {
  item: ContentItem;
  isDraggable?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  inCollection?: boolean;
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
          {item.type === "social" && (
            <>
              <span>•</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1 ${
                  (item as any).platform === "reddit"
                    ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                    : (item as any).platform === "twitter"
                    ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                    : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                }`}
              >
                {(item as any).platform === "reddit"
                  ? "Reddit"
                  : (item as any).platform === "twitter"
                  ? "𝕏 Twitter"
                  : (item as any).platform === "bluesky"
                  ? "Bluesky"
                  : "Mastodon"}
              </span>
            </>
          )}
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
            {item.type === "music" ? (
              item.artist
            ) : item.type === "social" ? (
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                {(item as any).platform === "reddit" ? (
                  <>
                    <strong className="text-orange-600 dark:text-orange-400">
                      {(item as any).subreddit || "r/all"}
                    </strong>
                    <span>
                      · ▲{" "}
                      {(item as any).likesCount
                        ? (item as any).likesCount > 999
                          ? `${((item as any).likesCount / 1000).toFixed(1)}k`
                          : (item as any).likesCount
                        : "1.4k"}
                    </span>
                    {(item as any).commentsCount && (
                      <span>· 💬 {(item as any).commentsCount}</span>
                    )}
                  </>
                ) : (item as any).platform === "twitter" ? (
                  <>
                    <strong className="text-stone-800 dark:text-stone-200">
                      {(item as any).authorHandle || "@twitter"}
                    </strong>
                    {(item as any).verified && (
                      <span className="text-sky-500 font-bold" title="Verified">
                        ✓
                      </span>
                    )}
                    <span>
                      · ♥{" "}
                      {(item as any).likesCount
                        ? (item as any).likesCount > 999
                          ? `${((item as any).likesCount / 1000).toFixed(1)}k`
                          : (item as any).likesCount
                        : "2.1k"}
                    </span>
                    {(item as any).repostsCount && (
                      <span>· 🔁 {(item as any).repostsCount}</span>
                    )}
                  </>
                ) : (
                  <>
                    <strong className="text-purple-600 dark:text-purple-400">
                      {(item as any).authorHandle || item.source || "Social"}
                    </strong>
                    <span>· ★ {(item as any).likesCount || 42}</span>
                  </>
                )}
              </span>
            ) : (
              item.source || item.sourceName || "Pulse"
            )}
            {item.type === "news" && item.readTimeMinutes && (
              <span> · {item.readTimeMinutes} min read</span>
            )}
            {item.type === "recommendation" && (
              <span className="inline-flex items-center gap-1">
                {" "}
                · <Star size={11} className="fill-amber-400 text-amber-400 inline" />
                <span>{item.rating}</span>/10 · By {item.creator}
              </span>
            )}
          </span>
          <div className="story-controls">
            {inCollection && item.url && (
              <a
                className="source-link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open source for ${item.title}`}
              >
                <ExternalLink size={15} />
              </a>
            )}
            <button
              aria-label={
                inCollection ? "Remove from favorites" : "Toggle favorite"
              }
              aria-pressed={saved}
              title={saved ? "Remove from favorites" : "Add to favorites"}
              className={saved ? "saved" : ""}
              onClick={() => dispatch(toggleFavorite(item))}
            >
              <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              className={`cta-button ${item.type === "music" ? "music-cta" : ""}`}
              aria-label={
                item.type === "music"
                  ? `Play ${item.title}`
                  : `Read more about ${item.title}`
              }
              onClick={() => {
                if (item.type === "music") {
                  dispatch(playTrack(item as MusicItem));
                } else {
                  dispatch(setSelectedDetailItem(item));
                }
              }}
            >
              {item.type === "music" ? (
                <>
                  <Play size={12} fill="currentColor" />
                  <span>Play Now</span>
                </>
              ) : item.type === "social" ? (
                <>
                  <span>
                    {(item as any).platform === "reddit"
                      ? "Thread"
                      : (item as any).platform === "twitter"
                      ? "Tweet"
                      : "Post"}
                  </span>
                  <ArrowUpRight size={14} />
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
